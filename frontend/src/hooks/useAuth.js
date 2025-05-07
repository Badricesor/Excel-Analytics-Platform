import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext.jsx';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout: contextLogout } = useContext(AuthContext);

  const fetchUserProfile = async (token) => {
    setLoading(true); // Set loading to true at the start of the fetch
    try {
      const res = await axios.get('/api/version1/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setLoading(false); // Set loading to false on successful fetch
      console.log('useAuth - Profile fetched successfully, loading set to false');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      localStorage.removeItem('token');
      setLoading(false); // Ensure loading is also set to false on error
      console.log('useAuth - Error fetching profile, loading set to false');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false); // If no token, loading is also false
      console.log('useAuth - No token, loading set to false');
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/version1/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (username, email, password, role) => {
    try {
      const res = await axios.post('/api/version1/auth/register', { username, email, password, role });
      localStorage.setItem('token', res.data.token);
      setUser(res.data);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error.response?.data?.message || 'Signup failed';
    }
  };

  // const logout = () => {
  //   contextLogout();
  //   setUser(null);
  // };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Optionally call context logout if needed
    if (contextLogout) {
      contextLogout();
    }
  };

  return { auth: { user }, loading, login, signup, logout };
};

export default useAuth;