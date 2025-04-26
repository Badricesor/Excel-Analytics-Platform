// /client/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard"); // redirect after login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 dark:bg-black-800 p-8">
      <div className="bg-white bg-opacity-10   p-8 rounded-lg shadow-lg max-w-sm w-full">
      <img src="logo.png" alt="Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Login to Your Account</h2>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
           
            <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mb-4 border text-gray-700 border-gray-300 rounded-lg "
            required
          />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="password"
              className="w-full p-2 mb-4 border border-gray-300 rounded-lg "
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-600 mt-4">
          <Link to="/forgot-password" className="text-white hover:underline">
            Forgot Password?
          </Link>
          <Link to="/Excel-Analytics-Platform/signup" className="text-white hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
