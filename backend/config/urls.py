from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
	openapi.Info(
		title="AgriLink API",
		default_version='v1',
		description="API documentation for AgriLink platform",
		contact=openapi.Contact(email="support@agrilink.com"),
		license=openapi.License(name="MIT License"),
	),
	public=True,
	permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
	path('admin/', admin.site.urls),
	path('api/v1/marketplace/', include('marketplace.urls')),
	path('api/v1/users/', include('users.urls')),
	path('api/v1/logistics/', include('logistics.urls')),
	path('api/v1/blockchain/', include('blockchain.urls')),
	path('api/v1/analytics/', include('analytics.urls')),
	path('api/v1/training/', include('training.urls')),
	path('api/v1/chatbot/', include('chatbot.urls')),
	path('api/v1/communications/', include('communications.urls')),
	path('api/v1/iot/', include('iot.urls')),
	
	# API Documentation
	path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0)),
	path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
]

if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
	urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)