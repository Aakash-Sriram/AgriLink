from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'devices', views.DeviceViewSet)
router.register(r'sensors', views.SensorViewSet)
router.register(r'readings', views.SensorReadingViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('device-status/<str:device_id>/', views.device_status),
	path('sensor-data/<str:sensor_id>/', views.sensor_data),
	path('alerts/', views.device_alerts),
]