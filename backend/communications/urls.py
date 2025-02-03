from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet)
router.register(r'sms-templates', views.SMSTemplateViewSet)
router.register(r'ivr-flows', views.IVRFlowViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('send-sms/', views.send_sms),
	path('initiate-call/', views.initiate_call),
	path('webhook/twilio/', views.twilio_webhook),
]