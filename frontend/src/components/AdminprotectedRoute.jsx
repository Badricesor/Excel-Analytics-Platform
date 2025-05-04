import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  // Check if user exists and has the 'admin' role
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

export default AdminProtectedRoute;