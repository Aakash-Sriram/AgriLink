import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
from django.db.models import Avg, Count
from .models import HistoricalPrice, PricePrediction, DemandForecast
from marketplace.models import Product, Order

class MarketAnalyticsService:
    def __init__(self):
        self.price_model = None
        self.demand_model = None
        self.scaler = StandardScaler()
    
    def prepare_price_features(self, product_id, location):
        """Prepare features for price prediction"""
        # Get historical prices
        prices = HistoricalPrice.objects.filter(
            product_id=product_id,
            location=location
        ).order_by('date')
        
        df = pd.DataFrame(list(prices.values()))
        
        # Add time-based features
        df['day_of_week'] = pd.to_datetime(df['date']).dt.dayofweek
        df['month'] = pd.to_datetime(df['date']).dt.month
        df['year'] = pd.to_datetime(df['date']).dt.year
        
        # Add moving averages
        df['price_ma7'] = df['market_price'].rolling(window=7).mean()
        df['price_ma30'] = df['market_price'].rolling(window=30).mean()
        
        # Add volume features
        df['volume_ma7'] = df['volume_traded'].rolling(window=7).mean()
        
        return df.dropna()
    
    def train_price_model(self, product_id, location):
        """Train price prediction model"""
        df = self.prepare_price_features(product_id, location)
        
        # Prepare features and target
        features = ['day_of_week', 'month', 'price_ma7', 'price_ma30', 'volume_ma7']
        X = df[features]
        y = df['market_price']
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.price_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.price_model.fit(X_scaled, y)
    
    def predict_price(self, product_id, location, prediction_date):
        """Predict price for a specific date"""
        if not self.price_model:
            self.train_price_model(product_id, location)
        
        # Prepare features for prediction
        df = self.prepare_price_features(product_id, location)
        latest_data = df.iloc[-1:].copy()
        latest_data['date'] = prediction_date
        latest_data['day_of_week'] = pd.to_datetime(prediction_date).dayofweek
        latest_data['month'] = pd.to_datetime(prediction_date).month
        
        # Make prediction
        features = ['day_of_week', 'month', 'price_ma7', 'price_ma30', 'volume_ma7']
        X_pred = self.scaler.transform(latest_data[features])
        predicted_price = self.price_model.predict(X_pred)[0]
        
        # Calculate confidence score based on feature importance
        confidence_score = min(0.95, self.price_model.score(
            self.scaler.transform(df[features]), df['market_price']
        ))
        
        return predicted_price, confidence_score

    def predict_demand(self, product_id, location, forecast_date):
        """Predict demand based on historical orders"""
        # Get historical orders
        orders = Order.objects.filter(
            listing__product_id=product_id,
            listing__location=location
        ).values('created_at', 'quantity')
        
        df = pd.DataFrame(list(orders))
        df['date'] = pd.to_datetime(df['created_at']).dt.date
        
        # Calculate daily demand
        daily_demand = df.groupby('date')['quantity'].sum().reset_index()
        
        # Add seasonal features
        daily_demand['day_of_week'] = pd.to_datetime(daily_demand['date']).dt.dayofweek
        daily_demand['month'] = pd.to_datetime(daily_demand['date']).dt.month
        
        # Train demand model
        features = ['day_of_week', 'month']
        X = daily_demand[features]
        y = daily_demand['quantity']
        
        self.demand_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.demand_model.fit(X, y)
        
        # Prepare prediction features
        pred_features = pd.DataFrame({
            'day_of_week': [pd.to_datetime(forecast_date).dayofweek],
            'month': [pd.to_datetime(forecast_date).month]
        })
        
        predicted_demand = self.demand_model.predict(pred_features)[0]
        confidence_score = min(0.90, self.demand_model.score(X, y))
        
        return predicted_demand, confidence_score 