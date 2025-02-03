#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${GREEN}Checking project environment...${NC}"

# Check Python environment
if [ -d "${SCRIPT_DIR}/.pyenv" ]; then
    echo -e "✓ Local pyenv installation found"
    PYTHON_VERSION=$(cat "${SCRIPT_DIR}/.python-version")
    echo -e "  Python version: ${PYTHON_VERSION}"
else
    echo -e "${RED}✗ Local pyenv not found${NC}"
fi

# Check virtual environment
if [ -d "${SCRIPT_DIR}/venv" ]; then
    echo -e "✓ Virtual environment found"
else
    echo -e "${RED}✗ Virtual environment not found${NC}"
fi

# Check npm configuration
if [ -f "${SCRIPT_DIR}/.npmrc" ]; then
    echo -e "✓ Local npm configuration found"
else
    echo -e "${RED}✗ Local npm configuration not found${NC}"
fi

# Check pip configuration
if [ -f "${SCRIPT_DIR}/.pip/pip.conf" ]; then
    echo -e "✓ Local pip configuration found"
else
    echo -e "${RED}✗ Local pip configuration not found${NC}"
fi

# Check node_modules
if [ -d "${SCRIPT_DIR}/frontend/web/node_modules" ]; then
    echo -e "✓ Web dashboard dependencies installed"
else
    echo -e "${RED}✗ Web dashboard dependencies missing${NC}"
fi

if [ -d "${SCRIPT_DIR}/frontend/mobile/node_modules" ]; then
    echo -e "✓ Mobile app dependencies installed"
else
    echo -e "${RED}✗ Mobile app dependencies missing${NC}"
fi

# Check database
if command -v psql &> /dev/null; then
    if psql -lqt | cut -d \| -f 1 | grep -qw agrilink; then
        echo -e "✓ Database exists"
    else
        echo -e "${RED}✗ Database not found${NC}"
    fi
else
    echo -e "${YELLOW}! PostgreSQL not installed${NC}"
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "✓ Redis server is running"
    else
        echo -e "${RED}✗ Redis server is not running${NC}"
    fi
else
    echo -e "${YELLOW}! Redis is not installed${NC}"
fi

# Check MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" > /dev/null 2>&1; then
        echo -e "✓ MongoDB server is running"
    else
        echo -e "${RED}✗ MongoDB server is not running${NC}"
    fi
else
    echo -e "${YELLOW}! MongoDB is not installed${NC}"
fi

# Check environment variables
echo -e "\nChecking environment variables..."
REQUIRED_VARS=(
    "DJANGO_SECRET_KEY"
    "DB_NAME"
    "DB_USER"
    "FIREBASE_CREDENTIALS_PATH"
    "ETHEREUM_NODE_URL"
    "GOOGLE_MAPS_API_KEY"
    "MQTT_BROKER_HOST"
    "RASA_MODEL_PATH"
    "TWILIO_ACCOUNT_SID"
    "REDIS_URL"
    "MONGODB_URI"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
        echo -e "✓ ${var} is set"
    else
        echo -e "${RED}✗ ${var} is not set${NC}"
    fi
done