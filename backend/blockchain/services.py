from web3 import Web3
from eth_account import Account
from django.conf import settings
from .models import SmartContract, Transaction

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_NODE_URL))
        self.account = Account.from_key(settings.ETHEREUM_PRIVATE_KEY)
    
    def deploy_payment_contract(self, buyer, seller, amount):
        """Deploy a new payment contract for an order"""
        contract = SmartContract.objects.get(contract_type='PAYMENT')
        
        # Create contract instance
        contract_instance = self.w3.eth.contract(
            abi=contract.abi,
            bytecode=settings.PAYMENT_CONTRACT_BYTECODE
        )
        
        # Build transaction
        transaction = contract_instance.constructor(
            buyer,
            seller,
            self.w3.to_wei(amount, 'ether')
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': 2000000,
            'gasPrice': self.w3.eth.gas_price
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(
            transaction, settings.ETHEREUM_PRIVATE_KEY
        )
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        return self.w3.to_hex(tx_hash)
    
    def process_payment(self, order):
        """Process payment for an order using smart contract"""
        try:
            # Create blockchain transaction
            tx_hash = self.deploy_payment_contract(
                order.buyer.username,
                order.listing.farmer.username,
                float(order.total_price)
            )
            
            # Create transaction record
            Transaction.objects.create(
                order=order,
                contract=SmartContract.objects.get(contract_type='PAYMENT'),
                tx_hash=tx_hash,
                from_address=order.buyer.username,
                to_address=order.listing.farmer.username,
                value=order.total_price,
                status='PENDING'
            )
            
            return tx_hash
            
        except Exception as e:
            raise Exception(f"Payment processing failed: {str(e)}") 