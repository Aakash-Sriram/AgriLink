from django.utils import timezone
from django.db.models import Count, Avg
from .models import Course, Module, Progress

class TrainingService:
    @staticmethod
    def get_recommended_courses(user):
        """Get personalized course recommendations based on user profile and progress"""
        # Get user's completed courses
        completed_modules = Progress.objects.filter(
            user=user, 
            completed=True
        ).values_list('module__course', flat=True)
        
        # Get courses appropriate for user's level
        if not completed_modules:
            # New user - recommend beginner courses
            return Course.objects.filter(
                level='BEGINNER',
                is_published=True
            )
        
        # Find popular courses in user's current level
        user_level = 'INTERMEDIATE' if completed_modules.count() > 5 else 'BEGINNER'
        
        return Course.objects.filter(
            level=user_level,
            is_published=True
        ).exclude(
            id__in=completed_modules
        ).annotate(
            completion_count=Count('modules__progress')
        ).order_by('-completion_count')
    
    @staticmethod
    def track_progress(user, module_id):
        """Track user's progress in a module"""
        progress, created = Progress.objects.get_or_create(
            user=user,
            module_id=module_id
        )
        
        if not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()
        
        return progress
    
    @staticmethod
    def get_user_progress(user, course_id):
        """Get user's progress in a specific course"""
        total_modules = Module.objects.filter(course_id=course_id).count()
        completed_modules = Progress.objects.filter(
            user=user,
            module__course_id=course_id,
            completed=True
        ).count()
        
        return {
            'total_modules': total_modules,
            'completed_modules': completed_modules,
            'progress_percentage': (completed_modules / total_modules * 100) if total_modules > 0 else 0
        } 