from django.db import models
from django.contrib.auth import get_user_model
from marketplace.models import Product, Listing, Order

User = get_user_model()

class SMSTemplate(models.Model):
    """Templates for different types of SMS notifications"""
    TEMPLATE_TYPES = [
        ('PRICE_UPDATE', 'Price Update'),
        ('ORDER_STATUS', 'Order Status'),
        ('PAYMENT_CONFIRM', 'Payment Confirmation'),
        ('DELIVERY_UPDATE', 'Delivery Update'),
        ('MARKET_ALERT', 'Market Alert'),
    ]
    
    name = models.CharField(max_length=100)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    content = models.TextField()
    language = models.CharField(max_length=10)  # ISO language code
    variables = models.JSONField()  # Store template variables
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class IVRPrompt(models.Model):
    """Voice prompts for IVR system"""
    PROMPT_TYPES = [
        ('WELCOME', 'Welcome Message'),
        ('MENU', 'Menu Options'),
        ('PRICE_CHECK', 'Price Check'),
        ('ORDER_STATUS', 'Order Status'),
        ('CONFIRMATION', 'Confirmation'),
    ]
    
    name = models.CharField(max_length=100)
    prompt_type = models.CharField(max_length=20, choices=PROMPT_TYPES)
    audio_file = models.FileField(upload_to='ivr_prompts/')
    language = models.CharField(max_length=10)
    script = models.TextField()  # Text version of the prompt
    created_at = models.DateTimeField(auto_now_add=True)

class CommunicationLog(models.Model):
    """Log all SMS and IVR communications"""
    CHANNEL_CHOICES = [
        ('SMS', 'SMS'),
        ('IVR', 'IVR'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('DELIVERED', 'Delivered'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    channel = models.CharField(max_length=5, choices=CHANNEL_CHOICES)
    template = models.ForeignKey(
        SMSTemplate, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    ivr_prompt = models.ForeignKey(
        IVRPrompt, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    phone_number = models.CharField(max_length=20)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    response = models.TextField(null=True, blank=True)  # Store user response
    metadata = models.JSONField(default=dict)  # Additional data 