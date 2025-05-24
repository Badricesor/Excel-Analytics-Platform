import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/version1/users/profile`,
        { withCredentials: true }
      );
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const login = async (email, password) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/version1/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (username, email, password, role) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/version1/auth/signup`,
        { username, email, password, role },
        { withCredentials: true }
      );
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error.response?.data?.message || 'Signup failed';
    }
  };

  const logout = () => {
    // You may also want to make an API call to /logout and clear cookie on the server
    setUser(null);
    navigate('/login');
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    signup,
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
