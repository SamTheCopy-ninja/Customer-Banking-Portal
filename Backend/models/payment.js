const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, 
  amount: { type: Number, required: true },
  currency: { type: String, required: true, enum: ['USD', 'EUR', 'GBP', 'ZAR'] },
  provider: { type: String, default: 'SWIFT' },
  recipientAccount: { type: String, required: true },
  swiftCode: { type: String, required: true, validate: { validator: value => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(value), message: 'Invalid SWIFT code' }},
  status: { type: String, enum: ['pending', 'completed', 'failed', 'pending SWIFT submission'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', transactionSchema);

// Database schema for payments