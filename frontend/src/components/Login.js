import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import './Login.css';

// Login page frontend
const Login = () => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    setFormData({accountNumber:'', password: '' });
  }, []);

  // Check the user's information
  const validationSchema = Yup.object().shape({
    accountNumber: Yup.string()
      .matches(/^[0-9]{10,20}$/, 'Account Number must be between 10 and 20 digits')
      .required('Account Number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: DOMPurify.sanitize(value) });
    // Clear error when user starts typing
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (yupError) {
      const validationErrors = {};
      if (yupError.inner) {
        yupError.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        // Store the token 
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setErrors({ general: data.msg || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Layout for login page
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo-container">
          <img src="/logo.png" alt="Bank Logo" className="bank-logo" />
        </div>
        <h1>Globe Transact - Banking Services</h1>
        <h2>Let Us Help You Make Your International Payments</h2>
      </div>
      <div className="login-right">
        <div className="login-form">
          <h2>Enter your credentials to Login</h2>
          <img src="/logo.png" alt="Bank Logo" className="form-logo" />
          <form onSubmit={handleSubmit} noValidate>
            <div>
              <input
                name="accountNumber"
                type="text"
                onChange={handleChange}
                placeholder="Account Number"
                required
                value={formData.accountNumber}
              />
              {errors.accountNumber && <p className="error-message">{errors.accountNumber}</p>}
            </div>
            <div>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                placeholder="Password"
                required
                value={formData.password}
              />
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            {errors.general && <p className="error-message">{errors.general}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <a href="/register" className="register">Register Here</a>
        </div>
      </div>
    </div>
  );
};

export default Login;