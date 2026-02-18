const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticate, authorize, ROLES } = require('../config/auth');
const { Bill, Payment, User } = require('../models');

// Get bills (role-based)
router.get('/bills', authenticate, async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const where = {};

    // Citizens can only see their own bills
    if (req.user.role === ROLES.CITIZEN) {
      where.citizenId = req.user.userId;
    }

    if (status) where.status = status;

    const bills = await Bill.findAll({
      where,
      include: [{
        model: User,
        as: 'citizen',
        attributes: ['id', 'fullName'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json(bills.map(b => ({
      id: b.id,
      billNumber: b.billNumber,
      citizenId: b.citizenId,
      citizenName: b.citizen?.fullName,
      connectionId: b.connectionId,
      billingPeriod: b.billingPeriod,
      previousReading: b.previousReading,
      currentReading: b.currentReading,
      unitsConsumed: b.unitsConsumed,
      baseCharge: b.baseCharge,
      consumptionCharge: b.consumptionCharge,
      tax: b.tax,
      totalAmount: b.totalAmount,
      dueDate: b.dueDate,
      status: b.status,
      paidAt: b.paidAt,
      createdAt: b.createdAt
    })));
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Get bill by ID
router.get('/bills/:id', authenticate, async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'citizen',
          attributes: ['id', 'fullName'],
          required: false
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        }
      ]
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Check permissions
    if (req.user.role === ROLES.CITIZEN && bill.citizenId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// Process payment (simulated)
router.post('/pay', authenticate, authorize(ROLES.CITIZEN), async (req, res) => {
  try {
    const { billId, amount, paymentMethod = 'online' } = req.body;

    if (!billId || !amount) {
      return res.status(400).json({ error: 'Bill ID and amount are required' });
    }

    const bill = await Bill.findByPk(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    if (bill.citizenId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ error: 'Bill already paid' });
    }

    // Simulate payment processing
    const payment = await Payment.create({
      paymentId: `PAY_${Date.now()}`,
      billId: bill.id,
      amount: parseFloat(amount),
      paymentMethod,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'success',
      paymentDate: new Date(),
      metadata: {
        simulated: true,
        gateway: 'demo',
        timestamp: new Date().toISOString()
      }
    });

    // Update bill status
    await bill.update({
      status: 'paid',
      paidAt: new Date()
    });

    res.json({
      success: true,
      payment: {
        id: payment.id,
        paymentId: payment.paymentId,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        paymentDate: payment.paymentDate
      },
      bill: {
        id: bill.id,
        billNumber: bill.billNumber,
        status: bill.status,
        paidAt: bill.paidAt
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
