import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/version1/auth/signup', formData);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-red-50 p-8">
      <div className="bg-white bg-opacity-10   p-8 rounded-lg shadow-lg max-w-sm w-full">
        <img src="logo.png" alt="Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg rounded"
            required
          />
          <button type="submit" className="w-full py-2 bg-red-600 text-white rounded hover:bg-indigo-700">
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-red-600 hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
