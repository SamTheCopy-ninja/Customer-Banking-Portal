const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  idNumber: { type: String, required: true, unique: true, validate: { validator: v => /^[0-9]{13}$/.test(v), message: props => `${props.value} is not a valid ID number!` }},
  accountNumber: { type: String, required: true, unique: true, validate: { validator: v => /^[0-9]{10,20}$/.test(v), message: props => `${props.value} is not a valid account number!` }},
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['customer', 'staff'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

module.exports = mongoose.model('Customer', userSchema);

// Customer schema