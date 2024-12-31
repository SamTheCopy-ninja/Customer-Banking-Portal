import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './PaymentVerification.css';

// Payment Dashboard for employees
const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [stats, setStats] = useState({
    totalPending: 0,
    verifiedToday: 0,
    submittedToSwift: 0
  });
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPaymentForReject, setSelectedPaymentForReject] = useState(null);
  const navigate = useNavigate();

  // Fetch the details for the employee who just logged in
  const fetchEmployeeInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployeeInfo(data);
      }
    } catch (err) {
      console.error('Error fetching employee info:', err);
    }
  }, []);

  // Fetch stats about processed payments
  const fetchPaymentStats = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/payment-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching payment stats:', err);
    }
  }, []);

  // Check for pending payments
  const fetchPendingPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/staff/pending-payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staff/login');
        return;
      }

      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchEmployeeInfo();
    fetchPendingPayments();
    fetchPaymentStats();
  }, [fetchEmployeeInfo, fetchPendingPayments, fetchPaymentStats]);

  // Allow the employee to verify a payment
  const handleVerify = async (paymentId) => {
    try {
      const response = await fetch(`/api/staff/verify-payment/${paymentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        // Update the payment status locally to 'pending SWIFT submission'
        setPayments(payments.map(payment => 
          payment._id === paymentId 
            ? { ...payment, status: 'pending SWIFT submission' } 
            : payment
        ));
        fetchPaymentStats();
      } else {
        const error = await response.json();
        alert(`Verification failed: ${error.msg}`);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      alert('Error verifying payment. Please try again.');
    }
  };

  // If an employee is rejecting a payment, ask them to confirm it
  const openRejectModal = (paymentId) => {
    setSelectedPaymentForReject(paymentId);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setSelectedPaymentForReject(null);
    setShowRejectModal(false);
  };

  // Allow an employee to reject a payment
  const handleReject = async () => {
    try {
      const response = await fetch(`/api/staff/reject-payment/${selectedPaymentForReject}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        // Update the payment status locally
        setPayments(payments.map(payment => 
          payment._id === selectedPaymentForReject 
            ? { ...payment, status: 'failed' } 
            : payment
        ));
        fetchPaymentStats();
        closeRejectModal();
      } else {
        const error = await response.json();
        alert(`Rejection failed: ${error.msg}`);
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
      alert('Error rejecting payment. Please try again.');
    }
  };

  // Allow an employee to reject a payment
  const handleSubmitToSwift = async () => {
    try {
      await fetch('/api/staff/submit-to-swift', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('staffToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentIds: selectedPayments })
      });
      fetchPendingPayments();
      fetchPaymentStats();
      setSelectedPayments([]);
    } catch (err) {
      console.error('Error submitting to SWIFT:', err);
    }
  };

  // Sort the payments so they can be displayed in the dashboard
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedPayments = React.useMemo(() => {
    let sortedItems = [...payments];
    if (sortConfig.key !== null) {
      sortedItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedItems;
  }, [payments, sortConfig]);

  const filteredPayments = React.useMemo(() => {
    return sortedPayments.filter(payment => {
      // First check if payment and customerId exist
      const fullName = payment?.customerId?.fullName || '';
      const amount = payment?.amount?.toString() || '';
      const status = payment?.status || '';
      
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        amount.includes(searchTerm) ||
        status.toLowerCase().includes(searchTerm.toLowerCase());
  
      const matchesDate = startDate && endDate
        ? new Date(payment.createdAt) >= startDate && 
          new Date(payment.createdAt) <= endDate
        : true;
  
      return matchesSearch && matchesDate;
    });
  }, [sortedPayments, searchTerm, startDate, endDate]);

  if (loading) return <div>Loading...</div>;

  // Layout for the frontend dashboard
  return (
    <div className="payment-verification-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>Payment Verification Dashboard</h1>
        {employeeInfo && (
          <p className="welcome-message">Welcome, {employeeInfo.fullName}</p>
        )}
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p>{stats.totalPending}</p>
        </div>
        <div className="stat-card">
          <h3>Verified Today</h3>
          <p>{stats.verifiedToday}</p>
        </div>
        <div className="stat-card">
          <h3>Submitted to SWIFT</h3>
          <p>{stats.submittedToSwift}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <input
          type="text"
          placeholder="Search by customer, amount, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          placeholderText="Select date range"
          className="date-picker"
        />
      </div>

      {/* Payments Table */}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th onClick={() => handleSort('customerId.fullName')}>
              Customer {sortConfig.key === 'customerId.fullName' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('amount')}>
              Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th>Currency</th>
            <th>SWIFT Code</th>
            <th>Recipient Account</th>
            <th onClick={() => handleSort('status')}>
              Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map(payment => (
            <tr key={payment._id} className={`status-${payment.status}`}>
              <td>
              <input
                type="checkbox"
                checked={selectedPayments.includes(payment._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPayments([...selectedPayments, payment._id]);
                  } else {
                    setSelectedPayments(selectedPayments.filter(id => id !== payment._id));
                  }
                }}
                disabled={payment.status !== 'pending SWIFT submission'} 
              />
              </td>
              <td>{payment.customerId.fullName}</td>
              <td>{payment.amount.toLocaleString()}</td>
              <td>{payment.currency}</td>
              <td>{payment.swiftCode}</td>
              <td>{payment.recipientAccount}</td>
              <td>
                <span className={`status-badge ${payment.status}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleVerify(payment._id)}
                    disabled={payment.status !== 'pending'}
                    className="verify-button"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => openRejectModal(payment._id)}
                    disabled={payment.status !== 'pending'}
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

        {/* Reject Modal */}
       {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject Payment</h3>
            <p>Are you sure you want to reject this payment?</p>
            <div className="modal-buttons">
              <button onClick={handleReject} className="confirm-reject-button">
                Confirm Rejection
              </button>
              <button onClick={closeRejectModal} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmitToSwift}
        disabled={selectedPayments.length === 0}
        className="submit-swift-button"
      >
        Submit Selected to SWIFT
      </button>
    </div>
  );
};

export default PaymentVerification;