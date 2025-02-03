from firebase_admin import auth
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        try:
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            
            try:
                user = User.objects.get(username=uid)
            except User.DoesNotExist:
                # Create a new user if they don't exist
                email = decoded_token.get('email', '')
                user = User.objects.create(
                    username=uid,
                    email=email,
                    is_active=True
                )
            
            return (user, None)
            
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}') 