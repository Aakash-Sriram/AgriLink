from django.db import models
from logistics.models import Vehicle

class IoTDevice(models.Model):
    DEVICE_TYPES = [
        ('TEMP_SENSOR', 'Temperature Sensor'),
        ('HUMIDITY_SENSOR', 'Humidity Sensor'),
        ('GPS_TRACKER', 'GPS Tracker'),
        ('COMBINED', 'Combined Sensor'),
    ]
    
    PROTOCOL_CHOICES = [
        ('LORAWAN', 'LoRaWAN'),
        ('MQTT', 'MQTT'),
        ('HTTP', 'HTTP'),
    ]
    
    device_id = models.CharField(max_length=50, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    protocol = models.CharField(max_length=10, choices=PROTOCOL_CHOICES)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='iot_devices')
    is_active = models.BooleanField(default=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict)  # Store device-specific configuration
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.device_id} ({self.device_type})"

class SensorReading(models.Model):
    device = models.ForeignKey(IoTDevice, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(auto_now_add=True)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    humidity = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    battery_level = models.IntegerField(null=True)  # Battery percentage
    signal_strength = models.IntegerField(null=True)  # RSSI value
    raw_data = models.JSONField()  # Store complete raw data from device
    
    class Meta:
        indexes = [
            models.Index(fields=['device', 'timestamp']),
        ] 