import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreatePayment from './components/CreatePayment';
import AddCard from './components/AddCard';
import EmployeeLogin from './components/EmployeeLogin';
import PaymentVerification from './components/PaymentVerification';
import PrivateRoute from './components/PrivateRoute';
import StaffPrivateRoute from './components/StaffPrivateRoute';
import Navigation from './Navigation';
import StaffNavigation from './StaffNavigation';
import './App.css';

const App = () => {

  // Check if user is in the staff section of the app
  const isStaffRoute = window.location.pathname.startsWith('/staff');

  return (
    <Router>
      <div className="app-container">
        {/* Render different navigation based on route */}
        {isStaffRoute ? <StaffNavigation /> : <Navigation />}
        
        <main className="main-content">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={<PrivateRoute><Dashboard /></PrivateRoute>} 
            />
            <Route 
              path="/create-payment" 
              element={<PrivateRoute><CreatePayment /></PrivateRoute>} 
            />
            <Route 
              path="/add-card" 
              element={<PrivateRoute><AddCard /></PrivateRoute>} 
            />

            {/* Staff Routes */}
            <Route path="/staff" element={<Navigate to="/staff/login" />} />
            <Route path="/staff/login" element={<EmployeeLogin />} />
            <Route 
              path="/staff/dashboard" 
              element={
                <StaffPrivateRoute>
                  <PaymentVerification />
                </StaffPrivateRoute>
              } 
            />
            <Route 
              path="/staff/verify-payments" 
              element={
                <StaffPrivateRoute>
                  <PaymentVerification />
                </StaffPrivateRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;