const express = require('express');
const router = express.Router();
const Card = require('../models/card'); 
const auth = require('../middleware/auth'); 
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const Joi = require('joi'); 

// Log directory path
const logDirectory = path.join(__dirname, '../logs');

// Check log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Log suspicious activity
const suspiciousLogStream = fs.createWriteStream(path.join(logDirectory, 'suspicious.log'), { flags: 'a' });

// Log all requests to console and a file
router.use(morgan('combined', { stream: fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' }) }));

// Validation for card data
const cardSchema = Joi.object({
  cardNumber: Joi.string().length(16).pattern(/^\d+$/).required(),
  expiryDate: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required(),
  cvv: Joi.string().length(3).pattern(/^\d+$/).required(),
  cardType: Joi.string().valid('Visa', 'MasterCard').required(),
});

// Add card route
router.post('/add', auth, async (req, res) => {
  // Validate request body
  const { error } = cardSchema.validate(req.body);
  if (error) {
    const logMessage = `Suspicious add-card attempt by user ${req.user.id} with invalid data: ${JSON.stringify(req.body)} at ${new Date().toISOString()}\n`;
    suspiciousLogStream.write(logMessage); // Log any suspicious activity
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { cardNumber, expiryDate, cvv, cardType } = req.body;

  try {
    // Check if card already exists for this user
    let existingCard = await Card.findOne({ cardNumber, customerId: req.user.id });
    if (existingCard) {
      const logMessage = `User ${req.user.id} attempted to add an existing card ${cardNumber} at ${new Date().toISOString()}\n`;
      suspiciousLogStream.write(logMessage);
      return res.status(400).json({ msg: 'Card already exists for this user' });
    }

    // Generate a random amount for the card balance 
    const randomBalance = Math.floor(Math.random() * (15000 - 1500 + 1)) + 1500;

    // Create a new card with the random balance
    const newCard = new Card({
      customerId: req.user.id,
      cardNumber,
      expiryDate,
      cvv,
      cardType,
      balance: randomBalance, // Set balance to random amount in ZAR
    });

    await newCard.save();
    res.status(201).json({ msg: 'Card added successfully', card: newCard });
  } catch (err) {
    const logMessage = `Error while adding card for user ${req.user.id}: ${err.message} at ${new Date().toISOString()}\n`;
    suspiciousLogStream.write(logMessage); // Log server errors related to card addition
    res.status(500).json({ error: err.message });
  }
});

// Get all cards for the logged-in customer
router.get('/', auth, async (req, res) => {
  try {
    const cards = await Card.find({ customerId: req.user.id }).select('-cvv'); // Exclude CVV in the response
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a card 
router.delete('/delete/:cardNumber', auth, async (req, res) => {
  try {
    const { cardNumber } = req.params;

    // Find the card using cardNumber and ensure it belongs to the authenticated user
    const card = await Card.findOne({
      cardNumber: cardNumber,
      customerId: new mongoose.Types.ObjectId(req.user.id) 
    });

    if (!card) {
      return res.status(404).json({ msg: 'Card not found' });
    }

    // Delete the card
    await card.deleteOne();
    res.json({ msg: 'Card deleted successfully' });

  } catch (err) {
    const logMessage = `Error while deleting card ${req.params.cardNumber} for user ${req.user.id}: ${err.message} at ${new Date().toISOString()}\n`;
    suspiciousLogStream.write(logMessage); // Log server errors during deletion
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;