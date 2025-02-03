from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet)
router.register(r'messages', views.MessageViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('send-message/', views.send_message),
	path('voice-input/', views.voice_input),
	path('language-detect/', views.detect_language),
]