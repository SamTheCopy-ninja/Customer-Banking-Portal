import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddCard.css';

// Allow users to add their card
const AddCard = () => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: ''
  });
  const navigate = useNavigate();

  // Validation Functions
  const validateInput = () => {
    const cardNumberRegex = /^\d{16}$/; // Card number must be 16 digits
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // Expiry date in MM/YY format
    const cvvRegex = /^\d{3}$/; // CVV must be 3 digits

    if (!cardNumberRegex.test(cardData.cardNumber)) {
      alert('Invalid card number. Must be 16 digits.');
      return false;
    }
    if (!expiryDateRegex.test(cardData.expiryDate)) {
      alert('Invalid expiry date. Use MM/YY format.');
      return false;
    }
    if (!cvvRegex.test(cardData.cvv)) {
      alert('Invalid CVV. Must be 3 digits.');
      return false;
    }
    if (!cardData.cardType) {
      alert('Please select a card type.');
      return false;
    }
    return true;
  };

  // Input Sanitization
  const sanitizeInput = (input) => {
    return input.replace(/[^\d]/g, ''); // Remove non-numeric characters
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData({
      ...cardData,
      [name]: name === 'cardNumber' ? sanitizeInput(value) : value // Sanitize card number
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return; // Prevent form submission if validation fails
    }

    try {
      const response = await fetch('/api/cards/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(cardData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Card added successfully!');
        navigate('/dashboard');
      } else {
        alert(data.error || 'Failed to add card.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Layout for view
  return (
    <div className="add-card-container">
      <h2>Add New Card</h2>
      <form onSubmit={handleSubmit} className="add-card-form">
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={cardData.cardNumber}
            onChange={handleChange}
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={cardData.expiryDate}
              onChange={handleChange}
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={cardData.cvv}
              onChange={handleChange}
              placeholder="123"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="cardType">Card Type</label>
          <select
            id="cardType"
            name="cardType"
            value={cardData.cardType}
            onChange={handleChange}
            required
          >
            <option value="">Select Card Type</option>
            <option value="Visa">Visa</option>
            <option value="MasterCard">MasterCard</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Add Card</button>
      </form>
    </div>
  );
};

export default AddCard;