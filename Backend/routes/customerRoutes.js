const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many register attempts from this IP, please try again later.'
});

// Register the user's profile
router.post('/register', registerLimiter, [
  check('fullName').isLength({ min: 2, max: 50 }).trim().escape(),
  check('username').isAlphanumeric().trim().escape(),
  check('idNumber').isLength({ min: 13, max: 13 }).isNumeric().trim(),
  check('accountNumber').isLength({ min: 10, max: 20 }).isNumeric().trim(),
  check('password').isLength({ min: 8 }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, username, idNumber, accountNumber, password } = req.body;

  try {
    let existingCustomer = await Customer.findOne({ accountNumber });
    if (existingCustomer) {
      return res.status(400).json({ msg: 'Customer already exists' });
    }

    // Hash the password and salt it by a factor of 12
    const hashedPassword = await bcrypt.hash(password, 12);
    const newCustomer = new Customer({
      fullName,
      username,
      idNumber,
      accountNumber,
      password: hashedPassword,
    });

    await newCustomer.save();
    res.status(201).json({ msg: 'Customer registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Login route 

router.post('/login', async (req, res) => {
  const { accountNumber, password } = req.body;
  console.log('Received login request:', req.body);
  try {
    const customer = await Customer.findOne({ accountNumber });
    if (!customer) return res.status(400).json({ msg: 'Customer not found' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: customer._id, role: customer.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(token);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer profile 
router.get('/profile', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
