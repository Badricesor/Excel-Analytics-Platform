import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import {
    UserGroupIcon,
    FolderIcon,
    UsersIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [uploadedFiles, setUploadedFiles] = useState(0);
    const [usersData, setUsersData] = useState([]);
    const [uploadedFilesData, setUploadedFilesData] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [activeSection, setActiveSection] = useState<'dashboard' | 'manageUsers' | 'manageData'>('dashboard');
    const { authToken, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            if (!authToken || !user?.isAdmin) {
                navigate('/login');
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                };

                const usersResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/admin/users`, config);
                 console.log('usersResponse.data:', usersResponse.data);

               let usersList = [];
                if (Array.isArray(usersResponse.data)) {
                    usersList = usersResponse.data;
                } else if (usersResponse.data && typeof usersResponse.data === 'object') {
                    usersList = [usersResponse.data]; // Wrap single object in an array
                } else {
                    console.error("Unexpected user data format:", usersResponse.data);
                    setUsersData([]);
                    setTotalUsers(0);
                    setRecentUsers([]);
                    return; // Stop processing if data is invalid
                }

                setUsersData(usersList);
                setTotalUsers(usersList.length);
                setRecentUsers(usersList.slice(0, 5));

                const uploadsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/uploads`, config);
                setUploadedFilesData(uploadsResponse.data);
                setUploadedFiles(uploadsResponse.data.length);

            } catch (error) {
      console.error('Error fetching admin data:', error);
      setUsersData([]);
      setTotalUsers(0);
      setRecentUsers([]);
      setUploadedFilesData([]);
      setUploadedFiles(0);
            }
        };

        fetchAdminData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken, navigate, user?.isAdmin]);

    const handleSort = (column) => {
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(newDirection);
        const sortedData = [...usersData].sort((a, b) => {
            if (a[column] < b[column]) return newDirection === 'asc' ? -1 : 1;
            if (a[column] > b[column]) return newDirection === 'asc' ? 1 : -1;
            return 0;
        });
        setUsersData(sortedData);
        setRecentUsers(sortedData.slice(0, 5));
    };

    const getStatusBadgeVariant = (status) => {
        const lowerStatus = status?.toLowerCase();
        if (lowerStatus === 'active') return 'bg-green-500 text-white';
        if (lowerStatus === 'inactive') return 'bg-red-500 text-white';
        if (lowerStatus === 'pending') return 'bg-yellow-500 text-gray-800';
        return 'bg-gray-400 text-gray-800';
    };

    const handleEditUser = (userId) => {
        console.log('Edit user:', userId);
        navigate(`/admin/users/${userId}/edit`);
    };

    const handleDeleteUser = async (userId) => {
        if (!authToken) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/version1/admin/users/${userId}`, config);
            fetchAdminData();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleViewFile = (fileId) => {
        console.log('View file:', fileId);
        navigate(`/admin/uploads/${fileId}`);
    };

    const handleDeleteFile = async (fileId) => {
        if (!authToken) return;
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/version1/admin/uploads/${fileId}`, config);
            fetchAdminData();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside className="bg-gray-800 w-64 p-4 space-y-6">
                <div className="flex items-center gap-2">
                    <UsersIcon className="h-6 w-6 text-gray-400" />
                    <h1 className="text-xl font-semibold">Admin Panel</h1>
                </div>
                <nav className="space-y-2">
                    <button
                        className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 ${activeSection === 'dashboard' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveSection('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 ${activeSection === 'manageUsers' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveSection('manageUsers')}
                    >
                        Manage Users
                    </button>
                    <button
                        className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 ${activeSection === 'manageData' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                        onClick={() => setActiveSection('manageData')}
                    >
                        Manage Data
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <h2 className="text-3xl font-bold mb-6">
                    {activeSection === 'dashboard' && 'Admin Dashboard'}
                    {activeSection === 'manageUsers' && 'Manage Users'}
                    {activeSection === 'manageData' && 'Manage Data'}
                </h2>

                {activeSection === 'dashboard' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserGroupIcon className="h-5 w-5 text-gray-300" />
                                    <h2 className="text-lg font-semibold text-gray-300">Total Users</h2>
                                </div>
                                <p className="text-2xl font-semibold text-white">{totalUsers}</p>
                            </div>
                            <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderIcon className="h-5 w-5 text-gray-300" />
                                    <h2 className="text-lg font-semibold text-gray-300">Uploaded Excel Files</h2>
                                </div>
                                <p className="text-2xl font-semibold text-white">{uploadedFiles}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2 mb-4">
                                <UsersIcon className="h-5 w-5" />
                                Recent Users
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('username')}>Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800 bg-gray-900">
                                        {recentUsers.map((user) => (
                                            <tr key={user._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user._id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeVariant(user.status)}`}>{user.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeSection === 'manageUsers' && (
                    <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-300 mb-4">Manage Users</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('_id')}>ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('username')}>Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('email')}>Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-gray-900">
                                    {usersData.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeVariant(user.status)}`}>{user.status}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => handleEditUser(user._id)}>Edit</button>
                                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === 'manageData' && (
                    <div className="bg-gray-800 border border-gray-700 rounded-md shadow-md p-6">
                        <h2 className="text-lg font-semibold text-gray-300 mb-4">Uploaded Data</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">File Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Upload Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded By</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 bg-gray-900">
                                    {uploadedFilesData.map((file) => (
                                        <tr key={file._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{file._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{file.filename || file.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(file.uploadDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{file.user?.username || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => handleViewFile(file._id)}>View</button>
                                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDeleteFile(file._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;