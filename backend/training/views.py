from rest_framework import viewsets, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Module, Progress
from .serializers import CourseSerializer, ModuleSerializer, ProgressSerializer
from .services import TrainingService

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    
    def get_queryset(self):
        return Course.objects.filter(is_published=True)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get user's progress in the course"""
        progress = TrainingService.get_user_progress(request.user, pk)
        return Response(progress)

class ModuleViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ModuleSerializer
    
    def get_queryset(self):
        return Module.objects.filter(course__is_published=True)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark module as completed"""
        progress = TrainingService.track_progress(request.user, pk)
        return Response(ProgressSerializer(progress).data)

class RecommendedCoursesView(views.APIView):
    def get(self, request):
        """Get personalized course recommendations"""
        courses = TrainingService.get_recommended_courses(request.user)
        return Response(CourseSerializer(courses, many=True).data) 