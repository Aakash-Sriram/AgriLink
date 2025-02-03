from rasa.core.agent import Agent
from rasa.shared.utils.io import json_to_string
from django.conf import settings
from .models import Conversation, Message
from analytics.models import HistoricalPrice
from marketplace.models import Product

class ChatbotService:
    def __init__(self):
        self.agent = Agent.load(settings.RASA_MODEL_PATH)
        
    async def process_message(self, user, message_text, language='en'):
        # Get or create conversation
        conversation, _ = Conversation.objects.get_or_create(
            user=user,
            defaults={'language': language}
        )
        
        # Save user message
        Message.objects.create(
            conversation=conversation,
            sender='USER',
            content=message_text
        )
        
        # Process with Rasa
        response = await self.agent.handle_text(
            message_text,
            sender_id=str(user.id)
        )
        
        # Handle intents
        if response[0].get('intent', {}).get('name') == 'get_price':
            product_name = response[0].get('entities', [{}])[0].get('value')
            price_info = self._get_price_info(product_name)
            bot_response = self._format_price_response(price_info, language)
        else:
            bot_response = response[0].get('text', "I'm sorry, I didn't understand that.")
        
        # Save bot response
        Message.objects.create(
            conversation=conversation,
            sender='BOT',
            content=bot_response,
            intent=response[0].get('intent', {}).get('name')
        )
        
        return bot_response
    
    def _get_price_info(self, product_name):
        try:
            product = Product.objects.get(name__icontains=product_name)
            latest_price = HistoricalPrice.objects.filter(
                product=product
            ).order_by('-date').first()
            
            return {
                'product': product.name,
                'price': latest_price.market_price if latest_price else None,
                'trend': self._calculate_price_trend(product)
            }
        except Product.DoesNotExist:
            return None
    
    def _calculate_price_trend(self, product):
        # Calculate 7-day price trend
        prices = HistoricalPrice.objects.filter(
            product=product
        ).order_by('-date')[:7]
        
        if len(prices) < 2:
            return 'stable'
            
        first_price = prices.last().market_price
        last_price = prices.first().market_price
        
        if last_price > first_price * 1.05:
            return 'rising'
        elif last_price < first_price * 0.95:
            return 'falling'
        return 'stable' 