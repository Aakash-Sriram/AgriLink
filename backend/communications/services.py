import boto3
from twilio.rest import Client
from django.conf import settings
from .models import SMSTemplate, IVRPrompt, CommunicationLog

class CommunicationService:
    def __init__(self):
        # Initialize Twilio client for SMS and voice calls
        self.twilio_client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        
        # Initialize AWS Polly for text-to-speech
        self.polly_client = boto3.client('polly')
    
    def send_sms(self, user, template_type, context, language='en'):
        """Send SMS using template"""
        try:
            template = SMSTemplate.objects.get(
                template_type=template_type,
                language=language
            )
            
            # Format message with context
            message = template.content.format(**context)
            
            # Send SMS via Twilio
            response = self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=user.phone_number
            )
            
            # Log communication
            CommunicationLog.objects.create(
                user=user,
                channel='SMS',
                template=template,
                phone_number=user.phone_number,
                content=message,
                status='SENT',
                metadata={'twilio_sid': response.sid}
            )
            
            return True
            
        except Exception as e:
            print(f"SMS sending failed: {str(e)}")
            return False
    
    def initiate_ivr_call(self, user, prompt_type, language='en'):
        """Initiate IVR call"""
        try:
            prompt = IVRPrompt.objects.get(
                prompt_type=prompt_type,
                language=language
            )
            
            # Create TwiML for the call
            twiml = f"""
                <?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <Play>{prompt.audio_file.url}</Play>
                    <Gather numDigits="1" action="/api/communications/handle-ivr-input/">
                        <Say language="{language}">{prompt.script}</Say>
                    </Gather>
                </Response>
            """
            
            # Initiate call via Twilio
            response = self.twilio_client.calls.create(
                twiml=twiml,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=user.phone_number
            )
            
            # Log communication
            CommunicationLog.objects.create(
                user=user,
                channel='IVR',
                ivr_prompt=prompt,
                phone_number=user.phone_number,
                content=prompt.script,
                status='SENT',
                metadata={'twilio_sid': response.sid}
            )
            
            return True
            
        except Exception as e:
            print(f"IVR call failed: {str(e)}")
            return False
    
    def generate_voice_prompt(self, text, language='en'):
        """Generate voice prompt using AWS Polly"""
        try:
            response = self.polly_client.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                VoiceId='Joanna' if language == 'en' else 'Aditi'  # For Hindi
            )
            
            return response['AudioStream'].read()
            
        except Exception as e:
            print(f"Voice generation failed: {str(e)}")
            return None 