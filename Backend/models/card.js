const mongoose = require('mongoose');

// Card schema
const cardSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  cardNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    validate: {
      validator: function(v) {
        return /^[0-9]{16}$/.test(v); 
      },
      message: props => `${props.value} is not a valid card number!`
    }
  },
  expiryDate: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(v); // MM/YY format
      },
      message: props => `${props.value} is not a valid expiry date!`
    }
  },
  cvv: { 
    type: String, 
    required: true, 
    validate: {
      validator: function(v) {
        return /^[0-9]{3,4}$/.test(v); 
      },
      message: props => `${props.value} is not a valid CVV!`
    }
  },
  cardType: { 
    type: String, 
    enum: ['Visa', 'MasterCard'], 
    required: true 
  },
  balance: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Card', cardSchema);
