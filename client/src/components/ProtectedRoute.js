// src/components/ProtectedRoute.js
// Redirects unauthenticated users to login
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="text-muted" style={{ fontFamily: 'DM Sans, sans-serif' }}>Loading SpendWise...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
