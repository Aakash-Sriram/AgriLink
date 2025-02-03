# Quick Start Guide

## Prerequisites

1. Install system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
	python3.11 \
	python3.11-venv \
	postgresql \
	postgresql-contrib \
	nodejs \
	npm \
	redis-server
```

## Setup Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AgriLink.git
cd AgriLink
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Setup database
sudo -u postgres psql -c "CREATE DATABASE agrilink;"
sudo -u postgres psql -c "CREATE USER agrilink_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agrilink TO agrilink_user;"

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and other configurations

# Run migrations
python manage.py migrate
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

### 3. Frontend Web Setup

```bash
cd ../frontend/web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoints and other configurations

# Start development server
npm start
```

### 4. Frontend Mobile Setup

```bash
cd ../mobile

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoints and other configurations

# Start Metro bundler
npm start

# In another terminal, run the app
npm run android  # For Android
# or
npm run ios     # For iOS (requires macOS)
```

### 5. Verify Setup

1. Backend API: http://localhost:8000/api/docs/
2. Web Dashboard: http://localhost:3000
3. Mobile App: Check your emulator/device

## Common Issues

1. Database Connection Error:
   - Verify PostgreSQL is running: `sudo service postgresql status`
   - Check database credentials in .env

2. Node.js Version Error:
   - Use nvm to install correct version: `nvm install 18`
   - Switch to correct version: `nvm use 18`

3. Python Version Error:
   - Ensure Python 3.11.7 is installed
   - Verify virtual environment is activated

## Development Tools

```bash
# Backend code formatting
black .
isort .

# Frontend code formatting
npm run format
npm run lint

# Run tests
# Backend
python manage.py test

# Frontend
npm test
```

For detailed setup instructions and advanced configurations, refer to [README.md](README.md).