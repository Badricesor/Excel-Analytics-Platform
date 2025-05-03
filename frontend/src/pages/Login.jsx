import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import logo from "../../public/logo.png"

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/user/dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 dark:bg-black-800">
      
            <header className="absolute top-0 left-0 p-6 flex items-center">
              {logo && <img src={logo} alt="Logo" className="h-8 w-auto mr-3" />}
              <h1 className="text-m font-semibold text-red-400">Excel Analytics Platform</h1>
            </header>
      
      <div className="rounded-3xl px-8 py-6 mt-6 p-8 text-left bg-white bg-opacity-10 shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center">Log In</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className=" mt-6">
            <button
              className="w-full bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Log In
            </button>
            <Link to="/signup" className="block text-center mt-4 align-baseline font-semibold text-sm text-blue-500 hover:text-red-500">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;