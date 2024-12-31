import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Navigation for staff memebers
const StaffNavigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('staffToken');
    navigate('/staff/login');
  };

  return (
    <nav className="navigation staff-navigation">
      <div className="nav-content">
        <img src="/logo.png" alt="Bank Logo" className="nav-logo" />
        <ul>
          <li><Link to="/staff/dashboard">Dashboard</Link></li>
          <li><Link to="/staff/verify-payments">Verify Payments</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default StaffNavigation;