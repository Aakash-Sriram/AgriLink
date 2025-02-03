from django.db import models
from django.contrib.auth import get_user_model
from marketplace.models import Order

User = get_user_model()

class Vehicle(models.Model):
    VEHICLE_TYPES = [
        ('MINI_TRUCK', 'Mini Truck'),
        ('TRUCK', 'Truck'),
        ('REFRIGERATED', 'Refrigerated Truck'),
        ('PICKUP', 'Pickup'),
    ]
    
    transporter = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    registration_number = models.CharField(max_length=20, unique=True)
    capacity_kg = models.DecimalField(max_digits=8, decimal_places=2)
    is_available = models.BooleanField(default=True)
    current_location = models.CharField(max_length=200, null=True, blank=True)
    gps_device_id = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.registration_number} ({self.vehicle_type})"

class Route(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    orders = models.ManyToManyField(Order, related_name='routes')
    start_location = models.CharField(max_length=200)
    end_location = models.CharField(max_length=200)
    estimated_distance_km = models.DecimalField(max_digits=8, decimal_places=2)
    estimated_duration_mins = models.IntegerField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    route_data = models.JSONField()  # Stores waypoints and route details
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Route {self.id}: {self.start_location} to {self.end_location}"

class DeliveryTracking(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    humidity = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Tracking {self.route_id} at {self.timestamp}" 