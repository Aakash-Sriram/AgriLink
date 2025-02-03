from rest_framework import permissions

class IsFarmer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'FARMER'

class IsBuyer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'BUYER' 