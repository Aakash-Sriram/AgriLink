from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'price-predictions', views.PricePredictionViewSet)
router.register(r'demand-forecasts', views.DemandForecastViewSet)
router.register(r'market-trends', views.MarketTrendViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('historical-prices/', views.historical_prices),
	path('generate-report/', views.generate_report),
]