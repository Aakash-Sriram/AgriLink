#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Version requirements
REQUIRED_NODE_VERSION="18"
REQUIRED_PYTHON_VERSION="3.11.7"
REQUIRED_NPM_VERSION="9"

# Function to compare versions
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1";
}

# Check version conflicts
check_version_conflicts() {
    echo -e "${GREEN}Checking version conflicts...${NC}"
    
    # Check system Python
    if command -v python3 &> /dev/null; then
        SYS_PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:3])))')
        if version_gt "$SYS_PYTHON_VERSION" "$REQUIRED_PYTHON_VERSION"; then
            echo -e "${YELLOW}Warning: System Python ($SYS_PYTHON_VERSION) is newer than required version ($REQUIRED_PYTHON_VERSION)${NC}"
        fi
    fi

    # Check system Node
    if command -v node &> /dev/null; then
        SYS_NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
        if [ "$SYS_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
            echo -e "${YELLOW}Warning: System Node version ($SYS_NODE_VERSION) differs from required version ($REQUIRED_NODE_VERSION)${NC}"
        fi
    fi

    # Check for conflicting global packages
    if [ -d "$HOME/.npm" ]; then
        echo -e "${YELLOW}Warning: Global NPM packages found in $HOME/.npm${NC}"
    fi
}

# Run version conflict check
check_version_conflicts

echo -e "${GREEN}Setting up Agri-Supply Chain Platform...${NC}"

# Create and set project-specific pyenv directory
export PYENV_ROOT="${SCRIPT_DIR}/.pyenv"
export PATH="${PYENV_ROOT}/bin:$PATH"

# Check if pyenv is installed
if ! command -v pyenv &> /dev/null; then
    echo -e "${RED}pyenv is not installed. Installing pyenv...${NC}"
    # Install pyenv dependencies
    sudo apt-get update
    sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

    # Install pyenv
    git clone https://github.com/pyenv/pyenv.git "${PYENV_ROOT}"

    # Initialize pyenv
    eval "$(pyenv init -)"
fi

# Install Python 3.11.7
echo -e "${GREEN}Installing Python 3.11.7...${NC}"
pyenv install 3.11.7
pyenv local 3.11.7

# Create .python-version file
echo "3.11.7" > "${SCRIPT_DIR}/.python-version"

# Verify Python installation
if ! python --version | grep -q "3.11.7"; then
    echo -e "${RED}Python 3.11.7 installation failed${NC}"
    exit 1
fi

# Create virtual environment
echo -e "${GREEN}Creating virtual environment...${NC}"
python -m venv venv
source venv/bin/activate

# Verify virtual environment
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo -e "${RED}Virtual environment activation failed${NC}"
    exit 1
fi

# Install backend dependencies
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Verify critical packages
if ! python -c "import django" 2>/dev/null; then
    echo -e "${RED}Django installation failed${NC}"
    exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verify Node.js installation
if ! node --version | grep -q "v18"; then
    echo -e "${RED}Node.js v18 installation failed${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd ../frontend

# Mobile app dependencies
echo -e "${GREEN}Installing mobile app dependencies...${NC}"
cd mobile
npm install

# Verify React Native installation
if ! npx react-native --version &>/dev/null; then
    echo -e "${RED}React Native installation failed${NC}"
    exit 1
fi

# Web dashboard dependencies
echo -e "${GREEN}Installing web dashboard dependencies...${NC}"
cd ../web
npm install

# Verify web dashboard setup
if ! npm run build &>/dev/null; then
    echo -e "${RED}Web dashboard build failed${NC}"
    exit 1
fi

# Setup TypeScript
echo -e "${GREEN}Setting up TypeScript...${NC}"
npm install --save-dev typescript @types/react @types/react-dom
npm install --save-dev @types/node @types/jest @testing-library/react @testing-library/jest-dom
npm install --save recharts @react-google-maps/api

# Install security packages
echo -e "${GREEN}Setting up security packages...${NC}"
npm install --save crypto-js
npm install --save-dev @types/crypto-js

# Security checks
echo -e "${GREEN}Running security audit...${NC}"
npm audit

# Performance monitoring setup
echo -e "${GREEN}Setting up performance monitoring...${NC}"
npm install --save web-vitals

# Initialize TypeScript config if not exists
if [ ! -f "tsconfig.json" ]; then
    npx tsc --init
fi

# Setup git hooks
echo -e "${GREEN}Setting up git hooks...${NC}"
cd ../../
cp scripts/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit

# Create necessary directories
mkdir -p backend/media
mkdir -p backend/static
mkdir -p logs

# Set up database
echo -e "${GREEN}Setting up database...${NC}"
if command -v psql &> /dev/null; then
    sudo -u postgres psql -c "CREATE DATABASE agrilink;" || true
    sudo -u postgres psql -c "CREATE USER agrilink_user WITH PASSWORD 'your_password';" || true
    sudo -u postgres psql -c "ALTER ROLE agrilink_user SET client_encoding TO 'utf8';"
    sudo -u postgres psql -c "ALTER ROLE agrilink_user SET timezone TO 'UTC';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agrilink TO agrilink_user;"
else
    echo -e "${RED}PostgreSQL is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}Don't forget to:"
echo -e "1. Configure your .env file"
echo -e "2. Run database migrations"
echo -e "3. Create a superuser${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${GREEN}Cleaning up...${NC}"
    
    # Deactivate virtual environment if active
    if [ -n "$VIRTUAL_ENV" ]; then
        deactivate
    fi
    
    # Remove temporary files
    find . -type f -name "*.pyc" -delete
    find . -type d -name "__pycache__" -exec rm -r {} +
    find . -type d -name "*.egg-info" -exec rm -r {} +
    find . -type f -name "*.log" -delete
    
    # Clean npm caches
    if [ -d "frontend/web" ]; then
        cd frontend/web
        npm cache clean --force
        cd ../..
    fi
    
    if [ -d "frontend/mobile" ]; then
        cd frontend/mobile
        npm cache clean --force
        cd ../..
    fi
}

# Register cleanup on script exit
trap cleanup EXIT

# Function to handle errors
handle_error() {
    echo -e "\n${RED}Error occurred during setup. Rolling back...${NC}"
    
    # Remove virtual environment
    if [ -d "venv" ]; then
        rm -rf venv
    fi
    
    # Remove local pyenv
    if [ -d "${SCRIPT_DIR}/.pyenv" ]; then
        rm -rf "${SCRIPT_DIR}/.pyenv"
    fi
    
    # Remove node_modules
    find . -type d -name "node_modules" -exec rm -rf {} +
    
    cleanup
    exit 1
}

# Register error handler
trap handle_error ERR

# Create isolated npm configuration
create_npm_config() {
    echo -e "${GREEN}Creating isolated npm configuration...${NC}"
    
    # Create .npmrc in project directory
    cat > "${SCRIPT_DIR}/.npmrc" << EOL
prefix=${SCRIPT_DIR}/.npm-packages
cache=${SCRIPT_DIR}/.npm-cache
init-author-name=agrilink-team
init-license=MIT
save-exact=true
EOL

    # Set npm environment variables
    export NPM_CONFIG_USERCONFIG="${SCRIPT_DIR}/.npmrc"
    export NPM_CONFIG_CACHE="${SCRIPT_DIR}/.npm-cache"
    export PATH="${SCRIPT_DIR}/.npm-packages/bin:$PATH"
}

# Create isolated pip configuration
create_pip_config() {
    echo -e "${GREEN}Creating isolated pip configuration...${NC}"
    
    # Create pip.conf in project directory
    mkdir -p "${SCRIPT_DIR}/.pip"
    cat > "${SCRIPT_DIR}/.pip/pip.conf" << EOL
[global]
disable-pip-version-check = true
no-cache-dir = false
cache-dir = ${SCRIPT_DIR}/.pip-cache

[install]
ignore-installed = true
no-warn-script-location = true
EOL

    # Set pip environment variables
    export PIP_CONFIG_FILE="${SCRIPT_DIR}/.pip/pip.conf"
}

# Update .gitignore with new paths
update_gitignore() {
    echo -e "${GREEN}Updating .gitignore...${NC}"
    
    cat >> "${SCRIPT_DIR}/.gitignore" << EOL

# Project-specific isolation
.npm-packages/
.npm-cache/
.pip/
.pip-cache/
.npmrc
EOL
}

# Call isolation setup functions
create_npm_config
create_pip_config
update_gitignore 