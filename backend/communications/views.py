from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SMSTemplate, IVRPrompt, CommunicationLog
from .services import CommunicationService
from .serializers import (
    SMSTemplateSerializer, 
    IVRPromptSerializer,
    CommunicationLogSerializer
)

class CommunicationViewSet(viewsets.ModelViewSet):
    service = CommunicationService()
    
    @action(detail=False, methods=['post'])
    def send_price_update(self, request):
        """Send price update via SMS"""
        user = request.user
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'Product ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = self.service.send_sms(
            user=user,
            template_type='PRICE_UPDATE',
            context={'product_id': product_id},
            language=request.data.get('language', 'en')
        )
        
        if success:
            return Response({'status': 'Price update sent'})
        return Response(
            {'error': 'Failed to send price update'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @action(detail=False, methods=['post'])
    def initiate_market_check(self, request):
        """Initiate IVR call for market price check"""
        user = request.user
        
        success = self.service.initiate_ivr_call(
            user=user,
            prompt_type='PRICE_CHECK',
            language=request.data.get('language', 'en')
        )
        
        if success:
            return Response({'status': 'IVR call initiated'})
        return Response(
            {'error': 'Failed to initiate IVR call'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @action(detail=False, methods=['post'])
    def handle_ivr_input(self, request):
        """Handle IVR input from user"""
        digit = request.data.get('Digits')
        call_sid = request.data.get('CallSid')
        
        # Update communication log with user response
        log = CommunicationLog.objects.get(
            metadata__twilio_sid=call_sid
        )
        log.response = digit
        log.save()
        
        # Handle different menu options
        if digit == '1':
            return self._handle_price_check()
        elif digit == '2':
            return self._handle_order_status()
        
        return Response({'status': 'Input processed'}) 