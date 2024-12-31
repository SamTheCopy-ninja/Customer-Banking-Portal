// Private routes for staff members

import React from 'react';
import { Navigate } from 'react-router-dom';

const StaffPrivateRoute = ({ children }) => {
  const isStaffAuthenticated = !!localStorage.getItem('staffToken');
  return isStaffAuthenticated ? children : <Navigate to="/staff/login" />;
};

export default StaffPrivateRoute;