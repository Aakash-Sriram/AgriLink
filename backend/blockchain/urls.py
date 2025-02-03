from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet)
router.register(r'contracts', views.SmartContractViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('verify-transaction/<str:tx_hash>/', views.verify_transaction),
	path('contract-status/<str:contract_address>/', views.contract_status),
]