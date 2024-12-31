import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Allow users to create payments
const CreatePayment = () => {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: '',
    provider: 'SWIFT',
    recipientAccount: '',
    swiftCode: '',
    cardId: '',
  });
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCards();
  }, []);

  // Fetch all the cards for the current user
  const fetchCards = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/cards', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      } else {
        alert('Error fetching cards');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });
    if (name === 'cardId') {
      const card = cards.find(c => c._id === value);
      setSelectedCard(card);
    }
  };

  // Check to confirm user supplies a formatted code
  const isValidSwiftCode = (code) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(code);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCard) {
      alert('Please select a card');
      return;
    }

    // Validate SWIFT code on the frontend
    if (!isValidSwiftCode(paymentData.swiftCode)) {
      alert('Invalid SWIFT code format.\n' +
            'Please enter a valid SWIFT code in the following format:\n' +
            '1. 6 uppercase letters (e.g., ABCDEF)\n' +
            '2. 2 characters (letters or digits, e.g., 12)\n' +
            '3. (Optional) 3 characters (letters or digits, e.g., 123)');
      return;
    }

    // Validate the payment
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/payments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...paymentData,
          cardId: selectedCard._id,
        }),
      });

      const data = await response.json();

      // Create the payment if validated
      if (response.ok) {
        const createResponse = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...paymentData,
            cardId: selectedCard._id,
          }),
        });

        const createData = await createResponse.json();

        if (createResponse.ok) {
          alert('Payment created successfully!');
          navigate('/dashboard');
        } else {
          alert(createData.error || 'Failed to create payment.');
        }
      } else {
        alert(data.error || 'Invalid payment amount.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Frontend layout for the payments page
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Create Payment</h2>
      <div className="profile-info">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="cardId">Select a Card</label>
            <select
              id="cardId"
              name="cardId"
              value={paymentData.cardId}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a Card</option>
              {cards.map(card => (
                <option key={card._id} value={card._id}>
                  {card.cardType} **** {card.cardNumber.slice(-4)} - Balance: R{card.balance.toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input 
              type="number" 
              id="amount"
              name="amount" 
              value={paymentData.amount} 
              onChange={handleChange} 
              placeholder="Amount" 
              required 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select 
              id="currency"
              name="currency" 
              value={paymentData.currency} 
              onChange={handleChange} 
              required
              className="form-control"
            >
              <option value="" disabled>Select Currency</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ZAR">ZAR</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="provider">Provider</label>
            <input 
              id="provider"
              name="provider" 
              value={paymentData.provider} 
              onChange={handleChange} 
              placeholder="Provider (default: SWIFT)" 
              required 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="recipientAccount">Recipient Account</label>
            <input 
              id="recipientAccount"
              name="recipientAccount" 
              value={paymentData.recipientAccount} 
              onChange={handleChange} 
              placeholder="Recipient Account" 
              required 
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="swiftCode">SWIFT Code</label>
            <input 
              id="swiftCode"
              name="swiftCode" 
              value={paymentData.swiftCode} 
              onChange={handleChange} 
              placeholder="SWIFT Code" 
              required 
              className="form-control"
              title="Format: 6 uppercase letters followed by 2 characters (optional: 3 characters)"
            />
          </div>
          <div className="action-buttons">
            <button type="submit" className="btn btn-primary">Create Payment</button>
          </div>
        </form>
        <div className="info-message">
          <p>SWIFT Code Format: 6 uppercase letters + 2 characters (optional: 3 characters)</p>
        </div>
      </div>
    </div>
  );
};

export default CreatePayment;