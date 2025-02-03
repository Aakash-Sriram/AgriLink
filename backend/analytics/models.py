from django.db import models
from marketplace.models import Product, Listing, Order

class HistoricalPrice(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateField()
    market_price = models.DecimalField(max_digits=10, decimal_places=2)
    volume_traded = models.DecimalField(max_digits=10, decimal_places=2)
    source = models.CharField(max_length=100)  # e.g., "Mandi", "Platform", "External API"
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['product', 'date', 'location']),
        ]
        unique_together = ['product', 'date', 'source', 'location']

class PricePrediction(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    predicted_for = models.DateField()
    min_price = models.DecimalField(max_digits=10, decimal_places=2)
    max_price = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_score = models.FloatField()  # 0 to 1
    factors = models.JSONField()  # Store factors affecting prediction
    created_at = models.DateTimeField(auto_now_add=True)

class DemandForecast(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    forecast_for = models.DateField()
    predicted_demand = models.DecimalField(max_digits=10, decimal_places=2)
    confidence_score = models.FloatField()
    seasonal_factors = models.JSONField()  # Store seasonal influences
    created_at = models.DateTimeField(auto_now_add=True) 