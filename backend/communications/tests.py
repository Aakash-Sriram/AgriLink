from django.test import TestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock
from .models import SMSTemplate, IVRPrompt, CommunicationLog
from .services import CommunicationService

User = get_user_model()

class CommunicationTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testfarmer',
            password='testpass123',
            phone_number='+1234567890'
        )
        
        # Create test templates
        self.sms_template = SMSTemplate.objects.create(
            name='Price Update',
            template_type='PRICE_UPDATE',
            content='Current price for {product} is ₹{price}',
            language='en',
            variables={'product': 'str', 'price': 'float'}
        )
        
        self.ivr_prompt = IVRPrompt.objects.create(
            name='Welcome',
            prompt_type='WELCOME',
            script='Welcome to AgriTech. Press 1 for prices, 2 for orders.',
            language='en'
        )
        
        self.service = CommunicationService()

    @patch('twilio.rest.Client')
    def test_send_sms(self, mock_twilio):
        # Mock Twilio response
        mock_message = MagicMock()
        mock_message.sid = 'test_sid'
        mock_twilio.return_value.messages.create.return_value = mock_message
        
        # Test sending SMS
        success = self.service.send_sms(
            user=self.user,
            template_type='PRICE_UPDATE',
            context={'product': 'Tomatoes', 'price': '50.00'},
            language='en'
        )
        
        # Verify SMS was sent
        self.assertTrue(success)
        self.assertEqual(CommunicationLog.objects.count(), 1)
        
        # Verify Twilio was called correctly
        mock_twilio.return_value.messages.create.assert_called_once()

    @patch('twilio.rest.Client')
    def test_initiate_ivr_call(self, mock_twilio):
        # Mock Twilio response
        mock_call = MagicMock()
        mock_call.sid = 'test_call_sid'
        mock_twilio.return_value.calls.create.return_value = mock_call
        
        # Test initiating IVR call
        success = self.service.initiate_ivr_call(
            user=self.user,
            prompt_type='WELCOME',
            language='en'
        )
        
        # Verify call was initiated
        self.assertTrue(success)
        self.assertEqual(CommunicationLog.objects.count(), 1)
        
        # Verify Twilio was called correctly
        mock_twilio.return_value.calls.create.assert_called_once()

    @patch('boto3.client')
    def test_generate_voice_prompt(self, mock_boto3):
        # Mock AWS Polly response
        mock_polly = MagicMock()
        mock_polly.synthesize_speech.return_value = {
            'AudioStream': MagicMock(read=lambda: b'audio_data')
        }
        mock_boto3.return_value = mock_polly
        
        # Test generating voice prompt
        audio_data = self.service.generate_voice_prompt(
            text='Welcome to AgriTech',
            language='en'
        )
        
        # Verify audio was generated
        self.assertIsNotNone(audio_data)
        mock_polly.synthesize_speech.assert_called_once()

    def test_handle_ivr_input(self):
        # Create test communication log
        log = CommunicationLog.objects.create(
            user=self.user,
            channel='IVR',
            ivr_prompt=self.ivr_prompt,
            phone_number=self.user.phone_number,
            content=self.ivr_prompt.script,
            status='SENT',
            metadata={'twilio_sid': 'test_sid'}
        )
        
        # Test handling IVR input
        response = self.client.post('/api/communications/handle-ivr-input/', {
            'Digits': '1',
            'CallSid': 'test_sid'
        })
        
        # Verify response
        self.assertEqual(response.status_code, 200)
        
        # Verify log was updated
        log.refresh_from_db()
        self.assertEqual(log.response, '1') 