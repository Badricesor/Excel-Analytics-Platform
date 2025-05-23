import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to indicate initial auth check
  const navigate = useNavigate();

  // Use useCallback for fetchUserProfile to ensure it's stable across renders
  const fetchUserProfile = useCallback(async (token) => {
    console.log('Token in fetchUserProfile:', token);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      console.log('User profile fetched successfully:', res.data);
      return res.data; // Return user data for caller
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null); // Ensure user is null on fetch error
      localStorage.removeItem('token'); // Clear token on fetch error
      throw error; // Propagate the error for the caller to handle loading state
    }
  }, []); // No external dependencies, so it's stable

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true); // Ensure loading is true at the start of any auth check logic
      const token = localStorage.getItem('token');
      console.log('AuthContext useEffect - Token from localStorage:', token);

      if (token) {
        try {
          await fetchUserProfile(token); // This call handles setting user or clearing token
        } catch (error) {
          // Error already logged by fetchUserProfile
          // User and token already cleared by fetchUserProfile
        } finally {
          setLoading(false); // Always set loading to false *after* async operation is complete
        }
      } else {
        setUser(null); // Explicitly set user to null if no token
        setLoading(false); // No token, no loading needed, user is null.
      }
    };

    checkAuth();
  }, [fetchUserProfile]); // fetchUserProfile is a dependency because it's a useCallback

  const login = useCallback(async (email, password) => {
    setLoading(true); // Set loading to true at the start of login attempt
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      console.log('Login successful, token:', res.data.token);
      await fetchUserProfile(res.data.token); // Fetch profile, which updates user state
      // set user will be set in fetchUserProfile.
      setLoading(false); // Set loading to false *after* user profile is fetched.
      return true; // Indicate success to the calling component (e.g., login form)
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null); // Ensure user is null on login failure
      localStorage.removeItem('token'); // Clear token on login failure
      setLoading(false); // Set loading to false on login failure
      throw error.response?.data?.message || 'Login failed';
    }
  }, [fetchUserProfile]); // fetchUserProfile is a dependency

  const signup = useCallback(async (username, email, password, role) => {
    setLoading(true); // Set loading to true at the start of signup attempt
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/version1/auth/signup`, { username, email, password, role });
      localStorage.setItem('token', res.data.token);
      console.log('Signup successful, token:', res.data.token);
      await fetchUserProfile(res.data.token); // Fetch profile, which updates user state
      // set user will be set in fetchUserProfile.
      setLoading(false); // Set loading to false *after* user profile is fetched.
      return true; // Indicate success to the calling component (e.g., signup form)
    } catch (error) {
      console.error('Signup failed:', error);
      setUser(null); // Ensure user is null on signup failure
      localStorage.removeItem('token'); // Clear token on signup failure
      setLoading(false); // Set loading to false on signup failure
      throw error.response?.data?.message || 'Signup failed';
    }
  }, [fetchUserProfile]); // fetchUserProfile is a dependency

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  }, [navigate]); // navigate is a dependency

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    signup,
  }), [user, loading, login, logout, signup]); // Include all functions in dependencies for consistency

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;