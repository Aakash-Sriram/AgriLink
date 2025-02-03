# Agri-Supply Chain Platform

A comprehensive platform for optimizing agricultural supply chains, connecting farmers directly with buyers, and providing intelligent logistics solutions.

## Project Structure
```
agrilink/
├── backend/
│   ├── analytics/           # Price prediction and demand forecasting
│   ├── blockchain/          # Smart contract integration
│   ├── chatbot/            # AI-powered chatbot for market updates
│   ├── config/             # Project configuration
│   ├── iot/                # IoT device integration
│   ├── logistics/          # Route optimization and delivery tracking
│   ├── marketplace/        # Core marketplace functionality
│   └── training/           # Farmer training module
└── frontend/
    ├── mobile/            # React Native mobile app
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── analytics/     # Price charts and forecasts
    │   │   │   ├── blockchain/    # Payment components
    │   │   │   ├── chat/          # Chatbot interface
    │   │   │   ├── logistics/     # Delivery tracking
    │   │   │   └── common/        # Shared components
    │   │   ├── screens/          # App screens
    │   │   ├── services/         # API services
    │   │   ├── navigation/       # Navigation config
    │   │   └── i18n/            # Translations
    │   └── App.js
    └── web/               # React.js web dashboard
```

## Backend Components

### Analytics Module
- `models.py`: Defines HistoricalPrice, PricePrediction, and DemandForecast models
- `services.py`: Implements ML-based price prediction and demand forecasting
- `views.py`: API endpoints for analytics data

### Blockchain Module
- `contracts/`: Smart contracts for secure transactions
- `models.py`: Blockchain transaction and contract models
- `services.py`: Handles blockchain interactions and payments

### Chatbot Module
- `models.py`: Conversation and Message models
- `services.py`: Rasa-based chatbot implementation
- `views.py`: Chat API endpoints

### IoT Module
- `models.py`: IoT device and sensor reading models
- `services.py`: MQTT communication handler
- `views.py`: Device management endpoints

### Logistics Module
- `models.py`: Vehicle, Route, and DeliveryTracking models
- `services.py`: Route optimization using Google Maps API
- `views.py`: Transportation management endpoints

### Marketplace Module
- `models.py`: Product, Listing, and Order models
- `views.py`: Core marketplace functionality
- `permissions.py`: Role-based access control

### Training Module
- `models.py`: Course and progress tracking models
- `services.py`: Course recommendation system
- `views.py`: Training content delivery endpoints

## Frontend Components

### Mobile App

#### Key Features
- Multilingual support with voice commands
- Offline-first architecture
- Real-time price tracking
- IoT sensor integration
- Secure blockchain payments

#### Components
- `PriceChart`: Real-time price visualization
- `DeliveryStatus`: Shipment tracking with IoT data
- `ChatInterface`: AI chatbot with voice support
- `ListingCard`: Product listing display
- `PaymentStatus`: Blockchain transaction tracking

### Web Dashboard (Admin Panel)
- Market analytics and trends
- Logistics management
- User management
- Content management for training
- System monitoring
- Real-time vehicle tracking
- Interactive maps
- Data visualization
- Performance analytics

## Setup Instructions

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/agrilink.git
cd agrilink
```

2. Set up Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Setup

1. Install mobile app dependencies:
```bash
cd frontend/mobile
npm install
```

2. Install web dashboard dependencies:
```bash
cd frontend/web
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoints
```

4. Start the development servers:
```bash
# Mobile app
cd frontend/mobile
npm run start

# Web dashboard
cd frontend/web
npm run start
```

## Development Environment Setup

### Prerequisites

- Git
- pyenv
- Node.js & npm
- PostgreSQL

### Initial Setup

1. Install pyenv (if not already installed):
```bash
# Install pyenv dependencies
sudo apt-get update
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

# Install pyenv
curl https://pyenv.run | bash
```

2. Add pyenv to your shell configuration:
```bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

### Project Setup

1. Clone and enter the repository:
```bash
git clone https://github.com/yourusername/agrilink.git
cd agrilink
```

2. Run the setup script:
```bash
./setup.sh
```

The setup script will:
- Install Python 3.11.7 using pyenv
- Create and activate a virtual environment
- Install all backend dependencies
- Install Node.js (if not present)
- Install all frontend dependencies

### Database Setup

1. Install PostgreSQL:
```bash
sudo apt-get install postgresql postgresql-contrib
```

2. Create database and user:
```bash
sudo -u postgres psql

CREATE DATABASE agrilink;
CREATE USER agrilink_user WITH PASSWORD 'your_password';
ALTER ROLE agrilink_user SET client_encoding TO 'utf8';
ALTER ROLE agrilink_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE agrilink_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE agrilink TO agrilink_user;
\q
```

3. Update your .env file with database credentials:
```env
DB_NAME=agrilink
DB_USER=agrilink_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Development Tools

The project includes several development tools:

- `black`: Code formatter
- `isort`: Import sorter
- `flake8`: Code linter
- `pytest`: Testing framework

Run the tools:
```bash
# Format code
black .

# Sort imports
isort .

# Run linter
flake8

# Run tests
pytest
```

### Running the Development Servers

1. Backend server:
```bash
cd backend
python manage.py runserver
```

2. Frontend development servers:
```bash
# Mobile app
cd frontend/mobile
npm run start

# Web dashboard
cd frontend/web
npm run start
```

### Troubleshooting

If you encounter any issues:

1. Verify Python version:
```bash
python --version  # Should show 3.11.7
```

2. Check virtual environment:
```bash
which python  # Should point to your venv
```

3. Verify Node.js installation:
```bash
node --version
npm --version
```

4. Database connection:
```bash
python manage.py dbshell  # Should connect to PostgreSQL
```

## Environment Variables

Required environment variables in `.env`:

```env
# Backend
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Firebase
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json

# Blockchain
ETHEREUM_NODE_URL=your_ethereum_node_url
ETHEREUM_PRIVATE_KEY=your_private_key
PAYMENT_CONTRACT_ADDRESS=your_contract_address

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# IoT
MQTT_BROKER_HOST=your_mqtt_broker
MQTT_BROKER_PORT=1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password

# Rasa
RASA_MODEL_PATH=path/to/rasa/model

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_FIREBASE_CONFIG=your_firebase_config
```

## API Documentation

The API documentation is available at `/api/docs/` when running the server in development mode.

## Testing

Run the backend test suite:
```bash
cd backend
python manage.py test
```

### Testing SMS/IVR Integration

To run SMS/IVR specific tests:
```bash
python manage.py test communications.tests
```

For integration testing with Twilio:
1. Set up test credentials in `.env`:
```env
TWILIO_TEST_ACCOUNT_SID=your_test_sid
TWILIO_TEST_AUTH_TOKEN=your_test_token
TWILIO_TEST_PHONE_NUMBER=your_test_number
```

2. Run integration tests:
```bash
python manage.py test communications.tests.test_integration
```

## Development Workflow

### Branch Strategy
```
main           # Production-ready code
├── develop    # Development branch
├── feature/*  # New features
├── bugfix/*   # Bug fixes
└── release/*  # Release preparation
```

### Workflow Guidelines

1. Create Feature Branch:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. Development Process:
- Write tests first (TDD approach)
- Follow code style guidelines
- Keep commits atomic and well-documented

3. Code Review Process:
- Create pull request to develop
- Ensure all tests pass
- Get at least one review approval
- Squash commits before merging

### Code Style

- Python: Follow PEP 8
- JavaScript: Follow Airbnb style guide
- Maximum line length: 100 characters
- Use meaningful variable names

### Common Troubleshooting

#### Backend Issues

1. Database Connection Errors:
```bash
# Check PostgreSQL service
sudo service postgresql status

# Verify database existence
sudo -u postgres psql -l

# Test connection
python manage.py dbshell
```

2. Migration Issues:
```bash
# Reset migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

3. Environment Issues:
```bash
# Verify virtual environment
which python
pip list

# Rebuild virtual environment
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Issues

1. Node Module Issues:
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall node_modules
rm -rf node_modules
rm package-lock.json
npm install
```

2. React Native Build Issues:
```bash
# Clear React Native cache
cd android
./gradlew clean
cd ..
npm start -- --reset-cache
```

## Deployment

### Backend Deployment (AWS)

1. Set up EC2 instance:
```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install nginx postgresql supervisor
```

2. Configure Gunicorn:
```bash
# Create supervisor config
sudo nano /etc/supervisor/conf.d/agrilink.conf

[program:agrilink]
command=/home/ubuntu/agrilink/venv/bin/gunicorn config.wsgi:application
directory=/home/ubuntu/agrilink/backend
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=true
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /home/ubuntu/agrilink/backend/static/;
    }

    location /media/ {
        alias /home/ubuntu/agrilink/backend/media/;
    }
}
```

### Frontend Deployment

#### Mobile App (React Native)

1. Android:
```bash
cd frontend/mobile
npm run build:android
```

2. iOS:
```bash
cd frontend/mobile
npm run build:ios
```

#### Web Dashboard

1. Build production version:
```bash
cd frontend/web
npm run build
```

2. Deploy to S3/CloudFront:
```bash
aws s3 sync build/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Continuous Integration/Deployment

#### GitHub Actions Workflow:
```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11.7
      - name: Run Tests
        run: |
          pip install -r requirements.txt
          python manage.py test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd agrilink
            git pull
            source venv/bin/activate
            pip install -r requirements.txt
            python manage.py migrate
            sudo supervisorctl restart agrilink
```

### Mobile App Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md)

#### Quick Start
```bash
# Android Release Build
cd frontend/mobile/android
./gradlew bundleRelease

# iOS Release Build
cd frontend/mobile/ios
xcodebuild -workspace AgriLink.xcworkspace -scheme AgriLink archive
```

#### Automated Deployment
```bash
# Using Fastlane
cd frontend/mobile
fastlane android deploy  # For Android
fastlane ios deploy      # For iOS
```

