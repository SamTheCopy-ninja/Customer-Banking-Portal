import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Dashboard.css';

// User dashboard, for managing cards, viewing payments history and profile
const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1); 
  const [loadingDelete, setLoadingDelete] = useState(null); 
  const navigate = useNavigate();

  // Allow users to logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Check the session token and ensure it has not expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      toast.error('Session expired. Please log in again.');
      handleLogout();
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    // Fetch the current user's profile from the server
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/customers/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal
        });
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
        } else {
          throw new Error(data.msg);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Error fetching profile: ' + err.message);
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    // Fetch only payments made by the current user
    const fetchPayments = async (page) => {
      try {
        const response = await fetch(`/api/payments/history?page=${page}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal
        });
        const data = await response.json();
        if (response.ok) {
          // Filter out duplicates based on _id
          setPayments((prevPayments) => {
            const existingIds = new Set(prevPayments.map(payment => payment._id));
            const newPayments = data.filter(payment => !existingIds.has(payment._id));
            return [...prevPayments, ...newPayments];
          });
        } else {
          throw new Error(data.msg);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Error fetching payments: ' + err.message);
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    // Fetch all cards belonging to the user
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal
        });
        const data = await response.json();
        if (response.ok) {
          setCards(data);
        } else {
          throw new Error(data.msg);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Error fetching cards: ' + err.message);
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchProfile();
    fetchPayments(page);
    fetchCards();
    setIsLoading(false);
    
    return () => controller.abort(); 
  }, [navigate, page, handleLogout]);

  // Redirect user to the cards page, if they want to add one
  const handleAddCard = () => {
    navigate('/add-card');
  };

  // Allow users to delete a card
  const handleDeleteCard = async (cardNumber) => {
    setLoadingDelete(cardNumber); // Set loading state for the specific card
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/cards/delete/${cardNumber}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setCards(cards.filter(card => card.cardNumber !== cardNumber));
        toast.success('Card deleted successfully');
      } else {
        toast.error('Error deleting card');
      }
    } catch (error) {
      toast.error('Error deleting card: ' + error.message);
    } finally {
      setLoadingDelete(null); // Clear loading state
    }
  };

  const handleLoadMorePayments = () => {
    setPage(prevPage => prevPage + 1); 
  };

  // Frontend dashboard layout
  return (
    <div className="dashboard">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1 className="dashboard-title">Dashboard</h1>
          {profile && (
            <div className="profile-info">
              <h2>Welcome, {profile.fullName}</h2>
              <div className="profile-details">
                <p><strong>Account Number:</strong> **** **** **** {profile.accountNumber.slice(-4)}</p>
                <p><strong>ID Number:</strong> **** **** {profile.idNumber.slice(-4)}</p>
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Last Login:</strong> {new Date(profile.lastLogin).toLocaleString()}</p>
                <p><strong>Account Created:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}

          <div className="dashboard-section">
            <h2>Payment History</h2>
            <ul className="payment-list">
              {payments.map(payment => (
                <li key={payment._id} className="payment-item">
                  <div className="payment-amount">{payment.amount} {payment.currency}</div>
                  <div className="payment-details">
                    <p><strong>Status:</strong> <span className={`status-${payment.status.toLowerCase()}`}>{payment.status}</span></p>
                    <p><strong>Provider:</strong> {payment.provider}</p>
                    <p><strong>Recipient Account:</strong> {payment.recipientAccount}</p>
                    <p><strong>SWIFT Code:</strong> {payment.swiftCode}</p>
                    <p><strong>Date:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={handleLoadMorePayments}>Load More Payments</button>
          </div>

          <div className="dashboard-section">
            <h2>Your Cards</h2>
            <ul className="card-list">
              {cards.map(card => (
                <li key={card._id} className="card-item">
                  <div className="card-number">**** **** **** {card.cardNumber.slice(-4)}</div>
                  <div className="card-details">
                    <p><strong>Expiry Date:</strong> {card.expiryDate}</p>
                    <p><strong>Card Type:</strong> {card.cardType}</p>
                    <p><strong>Balance:</strong> R{card.balance.toFixed(2)}</p>
                  </div>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeleteCard(card.cardNumber)}
                    disabled={loadingDelete === card.cardNumber}
                  >
                    {loadingDelete === card.cardNumber ? 'Deleting...' : 'Delete Card'}
                  </button>
                </li>
              ))}
            </ul>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleAddCard}>Add New Card</button>
              <button className="btn btn-primary" onClick={() => navigate('/create-payment')}>Create Payment</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;