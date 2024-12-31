const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const Card = require('../models/card');
const auth = require('../middleware/auth');


// Simple currency conversion rates to simulate payments and update card balance
const conversionRates = {
  ZAR: 1,
  USD: 0.067,
  EUR: 0.056,
  GBP: 0.048,
};

// Helper function to convert currency to ZAR
const convertToZAR = (amount, fromCurrency) => {
  return amount / conversionRates[fromCurrency];
};


// Validate SWIFT code format
const isValidSwiftCode = (code) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(code);

// Validate payment
router.post('/validate', auth, async (req, res) => {
  const { amount, currency, cardId } = req.body;

  try {
    const card = await Card.findOne({ _id: cardId, customerId: req.user.id });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Convert amount to ZAR for comparison
    const amountInZAR = convertToZAR(amount, currency);

    if (amountInZAR > card.balance) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    res.json({ message: 'Payment amount is valid' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new payment
router.post('/create', auth, async (req, res) => {
  const { amount, currency, provider, recipientAccount, swiftCode, cardId } = req.body;

  try {
    // Validate SWIFT code
    if (!isValidSwiftCode(swiftCode)) {
      return res.status(400).json({ error: 'Invalid SWIFT code' });
    }

    const card = await Card.findOne({ _id: cardId, customerId: req.user.id });
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Convert amount to ZAR for comparison and balance update
    const amountInZAR = convertToZAR(amount, currency);

    if (amountInZAR > card.balance) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const newPayment = new Payment({
      customerId: req.user.id,
      cardId,
      amount,
      currency,
      provider,
      recipientAccount,
      swiftCode,
      status: 'pending',
    });

    await newPayment.save();

    // Update card balance
    card.balance -= amountInZAR;
    await card.save();

    res.status(201).json({ 
      message: 'Payment created successfully', 
      payment: newPayment,
      updatedBalance: card.balance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment history (Protected route)
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ customerId: req.user.id });

    // Hide sensitive data
    const obscuredPayments = payments.map(payment => ({
      ...payment.toObject(),
      recipientAccount: payment.recipientAccount.replace(/.(?=.{4})/g, '*'), 
      swiftCode: payment.swiftCode.replace(/.{4}/, '****'), 
    }));

    res.json(obscuredPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;