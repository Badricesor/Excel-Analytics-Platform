import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import UserDashboard from '../pages/UserDashboard.jsx';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (token) => {
    console.log('Token in fetchUserProfile:', token);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
        withCredentials:true,
        headers: { Authorization: `Bearer ${token}` }
      },
    );
      setUser(res.data);
      setLoading(false);
      console.log('User profile fetched successfully:', res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
      setLoading(false);
      localStorage.removeItem('token');
    }
  };
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('AuthContext useEffect - Token from localStorage:', token)
      if (token) {
        setLoading(true); // Set loading true before fetching
        await fetchUserProfile(token);
      }
      setLoading(false); // Set loading false after the initial check
    };
  
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/login`, { email, password },{withCredentials:true});
      localStorage.setItem('token', res.data.token);
      console.log('Login successful, token:', res.data.token);
      console.log('Calling fetchUserProfile...');
      await fetchUserProfile(res.data.token); // Fetch profile immediately after login
      console.log('fetchUserProfile completed.');
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (username, email, password, role) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/signup`, { username, email, password, role }, {withCredentials:true});
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

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    signup,
  }), [user, loading]); // Only re-create value when user or loading changes


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
      {/* <UserDashboard /> */}
    </AuthContext.Provider>
  );
};

export default AuthContext;