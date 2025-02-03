from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .services import ChatbotService

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    async def send_message(self, request, pk=None):
        """Send a message to the chatbot"""
        message_text = request.data.get('message')
        language = request.data.get('language', 'en')
        
        if not message_text:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            chatbot = ChatbotService()
            response = await chatbot.process_message(
                user=request.user,
                message_text=message_text,
                language=language
            )
            
            return Response({'response': response})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 