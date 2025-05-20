import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import logo from "../../public/logo.png"
import { Button } from '@/components/ui/button'; // Assuming you're using shadcn/ui or similar
import { cn } from '@/lib/utils'; // Utility for combining class names

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(username, email, password, role);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic here (using a library like @react-oauth/google)
    console.log('Google login clicked');
    // Placeholder:  You'd typically redirect to Google's auth flow,
    // then handle the callback and create/login the user.
  };

  const handleFacebookLogin = () => {
    // Implement Facebook login logic here (using a library like react-facebook-login)
    console.log('Facebook login clicked');
    // Placeholder: Similar to Google, redirect to Facebook,
    // handle callback, and create/login user.
  };

  return (
    
    <div className="flex justify-center items-center min-h-screen bg-gray-900 dark:bg-black-800 ">

      {/* input box */}
      <div className=" rounded-3xl px-8 py-6 mt-6 p-8 bg-gray-800 text-left border-1 border-gray-300 border-solid shadow-lg w-full max-w-md">
        
      <img src="logo.png" alt="Logo" className="w-24 mx-auto mb-2" />
      <h2 className=" text-2xl text-white font-bold font-serif text-center mb-4">Excel Analytics Platform</h2>

        <h3 className="text-xl text-red-500 font-semibold font-serif text-center mb-4">Sign Up</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label> */}
            <input
              className="shadow border-gray-400 appearance-none border rounded w-full py-2 px-3 text-gray-200  leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
              className="shadow border-gray-400 appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            {/* <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role
            </label> */}
            <select
              id="role"
              className="shadow border-gray-400 appearance-none border bg-gray-700 rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              className={cn(
                "w-full", // Make button take full width
                "bg-red-500 hover:bg-red-700 text-white mb-2 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              )}
            >
              Sign Up
            </Button>
            <Link
              to="/login"
              className="block text-center mt-2 align-baseline font-semibold text-sm text-gray-400 hover:text-red-500"
            >
              Already have an account? Login
            </Link>
          </div>
        </form>

        <div className="mt-4">
          <div className="flex items-center justify-center">
            <div className="border-t border-gray-300 flex-grow mr-3"></div>
            <span className="text-gray-500 text-sm">Or sign up with</span>
            <div className="border-t border-gray-300 flex-grow ml-3"></div>
          </div>
          <div className="mt-2  flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleGoogleLogin}
              className="px-4 text-gray-300 py-2 hover:text-blue-700 rounded-full"
            >
              Google
            </Button>
            <Button
              variant="outline"
              onClick={handleFacebookLogin}
              className="px-4 py-2 text-gray-300 hover:text-blue-700 rounded-full"
            >
              Facebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;