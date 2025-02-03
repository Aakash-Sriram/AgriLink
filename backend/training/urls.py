from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'modules', views.ModuleViewSet)
router.register(r'progress', views.UserProgressViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('recommended-courses/', views.recommended_courses),
	path('course-completion/<int:course_id>/', views.mark_course_complete),
	path('download-certificate/<int:course_id>/', views.download_certificate),
]