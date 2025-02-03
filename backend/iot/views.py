from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import IoTDevice, SensorReading
from .serializers import IoTDeviceSerializer, SensorReadingSerializer
from .services import IoTService

class IoTDeviceViewSet(viewsets.ModelViewSet):
    serializer_class = IoTDeviceSerializer
    
    def get_queryset(self):
        return IoTDevice.objects.filter(
            vehicle__transporter=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def configure(self, request, pk=None):
        """Configure IoT device settings"""
        device = self.get_object()
        
        try:
            # Update device configuration
            device.metadata.update(request.data)
            device.save()
            
            return Response(IoTDeviceSerializer(device).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class SensorReadingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SensorReadingSerializer
    
    def get_queryset(self):
        return SensorReading.objects.filter(
            device__vehicle__transporter=self.request.user
        ).order_by('-timestamp') 