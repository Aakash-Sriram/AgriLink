import firebase_admin
from firebase_admin import credentials, auth
from django.conf import settings

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred) 