from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Vehicle, Route, DeliveryTracking
from .serializers import (
    VehicleSerializer, RouteSerializer, 
    DeliveryTrackingSerializer, RouteOptimizationRequestSerializer
)
from .services import RouteOptimizationService
from .permissions import IsTransporter

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [IsTransporter]
    
    def get_queryset(self):
        return Vehicle.objects.filter(transporter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(transporter=self.request.user)

class RouteOptimizationView(views.APIView):
    def post(self, request):
        serializer = RouteOptimizationRequestSerializer(data=request.data)
        if serializer.is_valid():
            vehicle = serializer.validated_data['vehicle']
            orders = serializer.validated_data['orders']
            
            # Check vehicle availability
            if not vehicle.is_available:
                return Response(
                    {'error': 'Vehicle is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Optimize route
            optimization_service = RouteOptimizationService()
            optimized_route = optimization_service.optimize_route(orders, vehicle)
            
            if optimized_route:
                # Create route record
                route = Route.objects.create(
                    vehicle=vehicle,
                    start_location=vehicle.current_location,
                    end_location=optimized_route[-1]['location'],
                    estimated_distance_km=sum(r['distance'] for r in optimized_route) / 1000,
                    estimated_duration_mins=len(optimized_route) * 30,  # Rough estimate
                    route_data=optimized_route
                )
                route.orders.set(orders)
                
                return Response(RouteSerializer(route).data)
            
            return Response(
                {'error': 'Could not optimize route'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeliveryTrackingViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryTrackingSerializer
    permission_classes = [IsTransporter]
    
    def get_queryset(self):
        return DeliveryTracking.objects.filter(
            route__vehicle__transporter=self.request.user
        ) 