import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx'; // Assuming you have a Header component

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authTokens, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Define the base API URL from environment variables (e.g., .env.development, .env.production)
    // Make sure you have a VITE_API_URL variable set in your frontend's .env file
    // Example: VITE_API_URL=https://your-backend-app.onrender.com
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!authTokens || !authTokens.access) {
                    setError('Authentication token missing. Please log in.');
                    setLoading(false);
                    logoutUser(); // Redirect to login if no token
                    return;
                }

                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authTokens.access}`,
                    },
                };
                // Make sure your backend endpoint is /api/version1/users/profile
                const response = await axios.get(`${API_BASE_URL}/api/version1/users/profile`, config);
                setProfile(response.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
                if (err.response && err.response.status === 401) {
                    logoutUser(); // Token might be expired or invalid
                } else {
                    setError(err.response?.data?.message || 'Failed to load profile.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [authTokens, logoutUser, API_BASE_URL]);

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be lost.')) {
            return;
        }

        try {
            if (!authTokens || !authTokens.access) {
                alert('Authentication token missing. Please log in.');
                logoutUser();
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${authTokens.access}`,
                },
            };
            // Make sure your backend endpoint is /api/version1/users/delete-account
            await axios.delete(`${API_BASE_URL}/api/version1/users/delete-account`, config);

            alert('Account and all associated data deleted successfully!');
            logoutUser(); // Log out the user after successful deletion
            navigate('/login'); // Redirect to login page
        } catch (err) {
            console.error('Error deleting account:', err);
            alert(err.response?.data?.message || 'Failed to delete account.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-300">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
                Error loading profile: {error}
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-500">
                No profile information available.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300">
            <Header /> {/* Include your header component */}
            <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                {/* Main Profile Card Container */}
                <div className="bg-gray-800 shadow-xl rounded-lg p-8 max-w-md w-full border border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                    <div className="flex flex-col items-center mb-6">
                        {/* Profile Icon */}
                        {/* You can replace this SVG with an icon from react-icons if installed, e.g., <FaUserCircle className="w-24 h-24 text-gray-400 mb-4" /> */}
                        <svg className="w-24 h-24 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="Profile Icon">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>

                        {/* User Details */}
                        <h2 className="text-3xl font-bold text-gray-200 mb-2">{profile.username}</h2>
                        <p className="text-gray-400 text-lg">{profile.email}</p>
                    </div>

                    <div className="border-t border-gray-700 pt-6 mt-6">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Account Details</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Role */}
                            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-inner">
                                <span className="text-gray-400 font-medium">Role:</span>
                                <span className="text-gray-200 font-semibold">{profile.role}</span>
                            </div>
                            {/* Member Since */}
                            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-inner">
                                <span className="text-gray-400 font-medium">Member Since:</span>
                                <span className="text-gray-200 font-semibold">
                                    {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {/* You can add more profile information fields here as per your backend's User model */}
                            {/* Example: if you have a 'lastLogin' field */}
                            
                            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-inner">
                                <span className="text-gray-400 font-medium">Last Login:</span>
                                <span className="text-gray-200 font-semibold">
                                    {new Date(profile.lastLogin).toLocaleString()}
                                </span>
                            </div>
                          
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center">
                        <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;