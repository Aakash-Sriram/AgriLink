from django.db import models
from django.conf import settings

class SmartContract(models.Model):
    CONTRACT_TYPES = [
        ('PAYMENT', 'Payment Contract'),
        ('ESCROW', 'Escrow Contract'),
        ('LOGISTICS', 'Logistics Contract'),
    ]
    
    name = models.CharField(max_length=100)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    address = models.CharField(max_length=42)  # Ethereum address is 42 chars
    abi = models.JSONField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.contract_type})"

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('FAILED', 'Failed'),
    ]
    
    order = models.OneToOneField('marketplace.Order', on_delete=models.CASCADE)
    contract = models.ForeignKey(SmartContract, on_delete=models.PROTECT)
    tx_hash = models.CharField(max_length=66)  # Ethereum tx hash is 66 chars
    from_address = models.CharField(max_length=42)
    to_address = models.CharField(max_length=42)
    value = models.DecimalField(max_digits=20, decimal_places=8)  # For ETH amount
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"TX: {self.tx_hash[:10]}... ({self.status})" 