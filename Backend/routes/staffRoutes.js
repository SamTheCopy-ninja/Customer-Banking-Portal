const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Staff = require('../models/staff');
const Payment = require('../models/payment');
const VerifiedPayment = require('../models/verifiedPayment');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// Initialize Helmet for secure HTTP headers
const app = express();
app.use(helmet());

// Rate Limiter to restrict the number of login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts from this IP, please try again later.'
});

// Staff login with rate limiting and input sanitization
router.post('/login', loginLimiter, [
  check('employeeId').matches(/^EMP[0-9]{6}$/).withMessage('Invalid employee ID format').escape(),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { employeeId, password } = req.body;
    const staff = await Staff.findOne({ employeeId });

    if (!staff) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Update last login
    staff.lastLogin = new Date();
    await staff.save();

    const token = jwt.sign(
      { id: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending payments
router.get('/pending-payments', auth, async (req, res) => {
  try {
    if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const pendingPayments = await Payment.find({ status: { $in: ['pending', 'pending SWIFT submission'] } })
      .populate('customerId', 'fullName accountNumber');

    res.json(pendingPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit to SWIFT with input sanitization
router.post('/submit-to-swift', auth, [
  check('paymentIds').isArray().withMessage('Payment IDs should be an array').escape()
], async (req, res) => {
  try {
    if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const { paymentIds } = req.body;

    await VerifiedPayment.updateMany(
      { paymentId: { $in: paymentIds } },
      { status: 'submitted_to_swift', swiftSubmissionDate: new Date() }
    );

    await Payment.updateMany(
      { _id: { $in: paymentIds }, status: 'pending SWIFT submission' },
      { status: 'completed' }
    );

    res.json({ msg: 'Payments submitted to SWIFT successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff profile route
router.get('/profile', auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payment stats
router.get('/payment-stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPending, verifiedToday, submittedToSwift] = await Promise.all([
      Payment.countDocuments({ status: 'pending' }),
      VerifiedPayment.countDocuments({ verificationDate: { $gte: today }, status: 'verified' }),
      VerifiedPayment.countDocuments({ status: 'submitted_to_swift' })
    ]);

    res.json({ totalPending, verifiedToday, submittedToSwift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment with input sanitization
router.post('/verify-payment/:paymentId', auth, [
  check('paymentId').isMongoId().withMessage('Invalid payment ID').escape()
], async (req, res) => {
  try {
    if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ msg: 'Payment cannot be verified as it is not pending' });
    }

    const verifiedPayment = new VerifiedPayment({
      paymentId: payment._id,
      verifiedBy: req.user.id,
      status: 'verified'
    });
    await verifiedPayment.save();

    payment.status = 'pending SWIFT submission';
    await payment.save();

    res.json({ msg: 'Payment has been verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject payment with input sanitization
router.post('/reject-payment/:paymentId', auth, [
  check('paymentId').isMongoId().withMessage('Invalid payment ID').escape()
], async (req, res) => {
  try {
    if (req.user.role !== 'verifier' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ msg: 'Payment cannot be rejected as it is not pending' });
    }

    const verifiedPayment = new VerifiedPayment({
      paymentId: payment._id,
      verifiedBy: req.user.id,
      status: 'failed'
    });
    await verifiedPayment.save();

    payment.status = 'failed';
    await payment.save();

    res.json({ msg: 'Payment has been rejected successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
