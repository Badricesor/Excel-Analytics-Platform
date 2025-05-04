import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { TrashIcon } from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user?.role === 'admin') {
          const usersRes = await axios.get('/api/version1/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersRes.data);

          const uploadsRes = await axios.get('/api/version1/admin/uploads', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUploads(uploadsRes.data);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Failed to fetch admin data');
        logout();
        navigate('/login');
      }
    };

    fetchAdminData();
  }, [navigate, logout, user?.role]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== userId));
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/uploads/${uploadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads(uploads.filter((u) => u._id !== uploadId));
      setError('');
    } catch (err) {
      console.error('Error deleting upload:', err);
      setError(err.response?.data?.message || 'Failed to delete upload');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user?.role === 'admin') {
    return <div className="flex justify-center items-center min-h-screen">Not authorized as admin.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Logout
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div>
        <h3 className="text-xl font-semibold mb-2">User Management</h3>
        {users.length === 0 ? (
          <p>No users registered.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Username</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Role</th>
                  <th className="py-2 px-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{userItem._id}</td>
                    <td className="py-2 px-4 border-b">{userItem.username}</td>
                    <td className="py-2 px-4 border-b">{userItem.email}</td>
                    <td className="py-2 px-4 border-b">{userItem.role}</td>
                    <td className="py-2 px-4 border-b text-right">
                      {userItem.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(userItem._id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Data Usage (All Uploads)</h3>
        {uploads.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">Filename</th>
                  <th className="py-2 px-4 border-b text-left">Uploaded By</th>
                  <th className="py-2 px-4 border-b text-left">Upload Date</th>
                  <th className="py-2 px-4 border-b text-left">Size (Bytes)</th>
                  <th className="py-2 px-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((upload) => (
                  <tr key={upload._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{upload._id}</td>
                    <td className="py-2 px-4 border-b">{upload.filename}</td>
                    <td className="py-2 px-4 border-b">{upload.userId?.username || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{new Date(upload.uploadDate).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{upload.dataSize}</td>
                    <td className="py-2 px-4 border-b text-right">
                      <button
                        onClick={() => handleDeleteUpload(upload._id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;