import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (token) => {
    console.log('Token in fetchUserProfile:', token);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setLoading(true);
        await fetchUserProfile(token);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      console.log('Login successful, token:', res.data.token);
      console.log('Calling fetchUserProfile...');
      await fetchUserProfile(res.data.token); // Fetch profile immediately after login
      console.log('fetchUserProfile completed.');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (username, email, password, role) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/register`, { username, email, password, role });
      localStorage.setItem('token', res.data.token);
      await fetchUserProfile(res.data.token); // Fetch profile after signup as well, if needed
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error.response?.data?.message || 'Signup failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;