import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext.jsx';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout: contextLogout } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUserProfile = async (token) => {
      try {
        const res = await axios.get('/api/version1/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Optionally call context logout if needed
    if (contextLogout) {
      contextLogout();
    }
  };

  return { user, loading, login, signup, logout };
};

export default useAuth;