const mongoose = require('mongoose');

// Model for handling verified, rejected and succesfull payments

const verifiedPaymentSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  verificationDate: {
    type: Date,
    default: Date.now
  },
  swiftSubmissionDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['verified', 'submitted_to_swift', 'failed'],
    default: 'verified'
  },
  notes: String
});

module.exports = mongoose.model('VerifiedPayment', verifiedPaymentSchema);