import paho.mqtt.client as mqtt
from django.conf import settings
from datetime import datetime
from .models import IoTDevice, SensorReading
from logistics.models import DeliveryTracking

class IoTService:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        # Set up MQTT credentials
        self.client.username_pw_set(
            settings.MQTT_USERNAME,
            settings.MQTT_PASSWORD
        )
        
    def connect(self):
        """Connect to MQTT broker"""
        self.client.connect(
            settings.MQTT_BROKER_HOST,
            settings.MQTT_BROKER_PORT,
            60
        )
        self.client.loop_start()
    
    def on_connect(self, client, userdata, flags, rc):
        """Subscribe to device topics on connect"""
        client.subscribe("devices/+/data")  # Subscribe to all device data topics
    
    def on_message(self, client, userdata, msg):
        """Handle incoming messages from devices"""
        try:
            device_id = msg.topic.split('/')[1]
            payload = json.loads(msg.payload)
            
            device = IoTDevice.objects.get(device_id=device_id)
            device.last_seen = datetime.now()
            device.save()
            
            # Create sensor reading
            reading = SensorReading.objects.create(
                device=device,
                temperature=payload.get('temperature'),
                humidity=payload.get('humidity'),
                latitude=payload.get('latitude'),
                longitude=payload.get('longitude'),
                battery_level=payload.get('battery'),
                signal_strength=payload.get('rssi'),
                raw_data=payload
            )
            
            # Update delivery tracking if location data is available
            if reading.latitude and reading.longitude:
                DeliveryTracking.objects.create(
                    route=device.vehicle.route_set.filter(status='IN_PROGRESS').first(),
                    location=f"{reading.latitude},{reading.longitude}",
                    latitude=reading.latitude,
                    longitude=reading.longitude,
                    temperature=reading.temperature,
                    humidity=reading.humidity
                )
                
        except Exception as e:
            print(f"Error processing message: {str(e)}") 