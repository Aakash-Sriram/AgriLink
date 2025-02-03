from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from firebase_admin import auth

class RegisterUserView(views.APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create custom token for Firebase
            custom_token = auth.create_custom_token(user.username)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': custom_token.decode()
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(views.APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 