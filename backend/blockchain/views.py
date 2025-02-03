from rest_framework import views, status
from rest_framework.response import Response
from .services import BlockchainService
from marketplace.models import Order
from .serializers import TransactionSerializer

class ProcessPaymentView(views.APIView):
    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id, buyer=request.user)
            
            # Initialize blockchain service
            blockchain_service = BlockchainService()
            
            # Process payment
            tx_hash = blockchain_service.process_payment(order)
            
            # Update order status
            order.status = 'CONFIRMED'
            order.transaction_hash = tx_hash
            order.save()
            
            return Response({
                'message': 'Payment processed successfully',
                'transaction_hash': tx_hash
            })
            
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 