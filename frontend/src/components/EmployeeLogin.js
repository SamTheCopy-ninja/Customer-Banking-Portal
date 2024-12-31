import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import './EmployeeLogin.css';

// Login page for employees

const EmployeeLogin = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('staffToken');
    if (token) {
      navigate('/staff/dashboard');
    }
  }, [navigate]);

  // Validate the employee ID and check the password
  const validationSchema = Yup.object().shape({
    employeeId: Yup.string()
      .matches(/^EMP[0-9]{6}$/, 'Invalid employee ID format')
      .required('Employee ID is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required')
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: DOMPurify.sanitize(value)
    }));
    setErrors({ ...errors, [name]: '' });
  };

  // Use Yup to validate the form
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

  // Allow the employee to login after their credentials have been verified and checked
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('staffToken', data.token);
        navigate('/staff/dashboard');
      } else {
        setErrors({ general: data.msg || 'Login failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Layout for the employee page login
  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo-container">
          <img src="/logo.png" alt="Company Logo" className="company-logo" />
        </div>
        <h1>Employee Access Portal</h1>
        <h2>Secure Login for Authorized Personnel Only</h2>
      </div>
      <div className="login-right">
        <div className="login-form">
          <h2>Employee Portal Login</h2>
          <img src="/logo.png" alt="Company Logo" className="form-logo" />
          <form onSubmit={handleSubmit} noValidate>
            <div>
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
              {errors.employeeId && <p className="error-message">{errors.employeeId}</p>}
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            {errors.general && <p className="error-message">{errors.general}</p>}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;
