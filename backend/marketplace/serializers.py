from rest_framework import serializers
from .models import Product, Listing, Order
from users.serializers import UserSerializer

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'description', 'created_at', 'updated_at']

class ListingSerializer(serializers.ModelSerializer):
    farmer = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Listing
        fields = [
            'id', 'farmer', 'product', 'product_id', 'quantity', 
            'price_per_unit', 'unit', 'location', 'status',
            'harvest_date', 'available_from', 'created_at', 'updated_at'
        ]
        read_only_fields = ['farmer', 'status']

    def create(self, validated_data):
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    listing = ListingSerializer(read_only=True)
    listing_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'listing', 'listing_id', 'quantity',
            'total_price', 'delivery_address', 'status',
            'transaction_hash', 'created_at', 'updated_at'
        ]
        read_only_fields = ['buyer', 'status', 'transaction_hash', 'total_price']

    def create(self, validated_data):
        listing = validated_data['listing']
        quantity = validated_data['quantity']
        
        # Calculate total price
        validated_data['total_price'] = listing.price_per_unit * quantity
        validated_data['buyer'] = self.context['request'].user
        
        return super().create(validated_data) 