from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Listing, Order
from .serializers import ProductSerializer, ListingSerializer, OrderSerializer
from .permissions import IsFarmer, IsBuyer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']

class ListingViewSet(viewsets.ModelViewSet):
    serializer_class = ListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'product__category']
    search_fields = ['product__name', 'location']

    def get_queryset(self):
        if self.request.user.user_type == 'FARMER':
            return Listing.objects.filter(farmer=self.request.user)
        return Listing.objects.filter(status='ACTIVE')

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsFarmer()]
        return [permissions.IsAuthenticated()]

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'FARMER':
            return Order.objects.filter(listing__farmer=user)
        return Order.objects.filter(buyer=user)

    def get_permissions(self):
        if self.action == 'create':
            return [IsBuyer()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def confirm_delivery(self, request, pk=None):
        order = self.get_object()
        if order.status != 'IN_TRANSIT':
            return Response(
                {'error': 'Order is not in transit'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'DELIVERED'
        order.save()
        return Response(OrderSerializer(order).data) 