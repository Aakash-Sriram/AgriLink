// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentContract is ReentrancyGuard, Pausable, Ownable {
    address public buyer;
    address public seller;
    uint256 public amount;
    uint256 public deadline;
    bool public isPaid;
    bool public isDelivered;
    bool public isDisputed;
    
    event PaymentReleased(address seller, uint256 amount);
    event DeliveryConfirmed(address buyer);
    event DisputeRaised(address initiator);
    event DisputeResolved(address resolver, address payee);
    event RefundIssued(address buyer, uint256 amount);
    
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this");
        _;
    }
    
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this");
        _;
    }
    
    modifier notDisputed() {
        require(!isDisputed, "Contract is disputed");
        _;
    }
    
    modifier withinDeadline() {
        require(block.timestamp <= deadline, "Transaction deadline passed");
        _;
    }
    
    constructor(
        address _buyer,
        address _seller,
        uint256 _amount,
        uint256 _deadlineDays
    ) {
        require(_buyer != address(0) && _seller != address(0), "Invalid addresses");
        require(_amount > 0, "Invalid amount");
        require(_deadlineDays > 0, "Invalid deadline");
        
        buyer = _buyer;
        seller = _seller;
        amount = _amount;
        deadline = block.timestamp + (_deadlineDays * 1 days);
        isPaid = false;
        isDelivered = false;
        isDisputed = false;
    }
    
    function confirmDelivery() 
        external 
        onlyBuyer 
        whenNotPaused 
        notDisputed 
        withinDeadline 
    {
        require(!isDelivered, "Delivery already confirmed");
        isDelivered = true;
        emit DeliveryConfirmed(buyer);
    }
    
    function releasePayment() 
        external 
        onlyBuyer 
        nonReentrant 
        whenNotPaused 
        notDisputed 
        withinDeadline 
    {
        require(!isPaid, "Payment already released");
        require(isDelivered, "Delivery not confirmed");
        require(address(this).balance >= amount, "Insufficient contract balance");
        
        isPaid = true;
        (bool success, ) = payable(seller).call{value: amount}("");
        require(success, "Transfer failed");
        emit PaymentReleased(seller, amount);
    }
    
    function raiseDispute() 
        external 
        whenNotPaused 
        withinDeadline 
    {
        require(msg.sender == buyer || msg.sender == seller, "Unauthorized");
        require(!isDisputed, "Dispute already raised");
        require(!isPaid, "Payment already released");
        
        isDisputed = true;
        emit DisputeRaised(msg.sender);
    }
    
    function resolveDispute(address payable payee) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(isDisputed, "No active dispute");
        require(payee == buyer || payee == seller, "Invalid payee");
        require(address(this).balance >= amount, "Insufficient balance");
        
        isDisputed = false;
        isPaid = true;
        
        (bool success, ) = payee.call{value: amount}("");
        require(success, "Transfer failed");
        emit DisputeResolved(msg.sender, payee);
    }
    
    function refundBuyer() 
        external 
        onlyOwner 
        whenNotPaused 
    {
        require(!isPaid, "Payment already released");
        require(address(this).balance >= amount, "Insufficient balance");
        
        isPaid = true;
        (bool success, ) = payable(buyer).call{value: amount}("");
        require(success, "Transfer failed");
        emit RefundIssued(buyer, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    receive() external payable {
        require(msg.sender == buyer, "Only buyer can send funds");
        require(msg.value == amount, "Incorrect payment amount");
        require(!isPaid, "Payment already made");
    }
}