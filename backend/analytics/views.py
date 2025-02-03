from rest_framework import views, status
from rest_framework.response import Response
from .services import MarketAnalyticsService
from .serializers import PricePredictionSerializer, DemandForecastSerializer
from datetime import datetime, timedelta

class PricePredictionView(views.APIView):
    def get(self, request):
        product_id = request.query_params.get('product_id')
        location = request.query_params.get('location')
        days = int(request.query_params.get('days', 7))
        
        if not all([product_id, location]):
            return Response(
                {'error': 'Missing required parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            analytics_service = MarketAnalyticsService()
            predictions = []
            
            for day in range(days):
                prediction_date = datetime.now().date() + timedelta(days=day)
                predicted_price, confidence = analytics_service.predict_price(
                    product_id, location, prediction_date
                )
                
                predictions.append({
                    'date': prediction_date,
                    'predicted_price': predicted_price,
                    'confidence_score': confidence
                })
            
            return Response(predictions)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class DemandForecastView(views.APIView):
    def get(self, request):
        product_id = request.query_params.get('product_id')
        location = request.query_params.get('location')
        days = int(request.query_params.get('days', 30))
        
        if not all([product_id, location]):
            return Response(
                {'error': 'Missing required parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            analytics_service = MarketAnalyticsService()
            forecasts = []
            
            for day in range(days):
                forecast_date = datetime.now().date() + timedelta(days=day)
                predicted_demand, confidence = analytics_service.predict_demand(
                    product_id, location, forecast_date
                )
                
                forecasts.append({
                    'date': forecast_date,
                    'predicted_demand': predicted_demand,
                    'confidence_score': confidence
                })
            
            return Response(forecasts)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 