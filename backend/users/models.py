from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('FARMER', 'Farmer'),
        ('BUYER', 'Buyer'),
        ('TRANSPORTER', 'Transporter'),
    ]
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15)
    preferred_language = models.CharField(max_length=10, default='en')
    location = models.CharField(max_length=200)
    profile_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.username} - {self.user_type}" 