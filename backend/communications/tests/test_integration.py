from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from ..models import SMSTemplate, IVRPrompt

User = get_user_model()

class CommunicationIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testfarmer',
            password='testpass123',
            phone_number='+1234567890'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test templates
        self.sms_template = SMSTemplate.objects.create(
            name='Price Update',
            template_type='PRICE_UPDATE',
            content='Current price for {product} is ₹{price}',
            language='en',
            variables={'product': 'str', 'price': 'float'}
        )

    def test_send_price_update_endpoint(self):
        url = reverse('communication-send-price-update')
        response = self.client.post(url, {
            'product_id': 1,
            'language': 'en'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'Price update sent')

    def test_initiate_market_check_endpoint(self):
        url = reverse('communication-initiate-market-check')
        response = self.client.post(url, {
            'language': 'en'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'IVR call initiated')

    def test_handle_ivr_input_endpoint(self):
        url = reverse('communication-handle-ivr-input')
        response = self.client.post(url, {
            'Digits': '1',
            'CallSid': 'test_sid'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'Input processed') 