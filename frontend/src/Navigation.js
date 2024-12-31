import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

// Navigation for customers

const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <img src="/logo.png" alt="Bank Logo" className="nav-logo" />
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/create-payment">Create Payment</Link></li>
          <li><Link to="/add-card">Add Card</Link></li>
          <li><Link to="/login">Logout</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;