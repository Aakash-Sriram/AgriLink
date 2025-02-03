from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'vehicles', views.VehicleViewSet)
router.register(r'routes', views.RouteViewSet)
router.register(r'deliveries', views.DeliveryViewSet)
router.register(r'tracking', views.TrackingViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('optimize-route/', views.optimize_route),
	path('track-delivery/<str:tracking_id>/', views.track_delivery),
	path('vehicle-status/<int:vehicle_id>/', views.vehicle_status),
]