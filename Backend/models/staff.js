const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Model for staff members 

const staffSchema = new mongoose.Schema({
  employeeId: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: v => /^EMP[0-9]{6}$/.test(v),
      message: 'Invalid employee ID format'
    }
  },
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['admin', 'verifier'], 
    default: 'verifier' 
  },
  lastLogin: { 
    type: Date 
  }
});

// Hash and salt the password before saving
staffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Staff', staffSchema);