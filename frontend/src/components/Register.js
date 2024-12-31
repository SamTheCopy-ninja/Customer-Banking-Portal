import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import DOMPurify from 'dompurify';
import './Register.css';

// Register page for the app
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    idNumber: '',
    accountNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Check the user's profile information
  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .matches(/^[a-zA-Z\s]*$/, 'Full name should only contain letters and spaces')
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters')
      .required('Full name is required'),
    username: Yup.string()
      .matches(/^[a-zA-Z0-9_]*$/, 'Username should only contain letters, numbers, and underscores')
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters')
      .required('Username is required'),
    idNumber: Yup.string()
      .matches(/^[0-9]{13}$/, 'ID Number must be exactly 13 digits')
      .required('ID Number is required'),
    accountNumber: Yup.string()
      .matches(/^[0-9]{10,20}$/, 'Account Number must be between 10 and 20 digits')
      .required('Account Number is required'),
    password: Yup.string()
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      )
      .required('Password is required'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: DOMPurify.sanitize(value) });
  };

  // Validate the details entered by the user
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

    try {
      const response = await fetch('/api/customers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful!');
        navigate('/login');
      } else {
        alert(data.msg || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };

  // Layout for register page
  return (
    <div className="register-container">
      <div className="register-left">
        <div className="logo-container">
          <img src="/logo.png" alt="Bank Logo" className="bank-logo" />
        </div>
        <h1>Globe Transact - Banking Services</h1>
        <h2>Need to make an international deposit? Join Us</h2>
      </div>
      <div className="register-right">
        <div className="register-form">
          <h2>Create Your Account</h2>
          <img src="/logo.png" alt="Bank Logo" className="form-logo" />
          <form onSubmit={handleSubmit} noValidate>
            {Object.keys(formData).map((field) => (
              <div key={field}>
                <input
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                  required
                />
                {errors[field] && <p className="error-message">{errors[field]}</p>}
              </div>
            ))}
            <button type="submit">Register</button>
          </form>
          <a href="/login" className="login-link">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;