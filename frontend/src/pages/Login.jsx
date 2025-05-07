import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = await login(email, password);
      if (success) {
        // Navigation will now happen in the useEffect when 'user' state updates
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 dark:bg-black-800 ">
      <div className="rounded-3xl px-8 py-6 mt-6 p-8 bg-gray-800 text-left border-1 border-gray-300 border-solid shadow-lg w-full max-w-md">
        
      <img src="logo.png" alt="Logo" className="w-24 mx-auto mb-2" />
      <h2 className=" text-2xl text-white font-bold font-serif text-center mb-4">Excel Analytics Platform</h2>

        <h3 className="text-2xl text-red-500 font-bold font-serif text-center mb-6">Login</h3>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label> */}
            <input
              className="shadow border-gray-400 appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            {/* <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label> */}
            <input
              className="shadow border-gray-400  appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="bg-red-500 hover:bg-blue-700 w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Log In
            </button>
            <div className="mt-4 text-center">
              <Link to="/signup" className="inline-block align-baseline font-semibold text-sm text-gray-400  hover:text-red-500">
                Don't have an account? Sign Up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;