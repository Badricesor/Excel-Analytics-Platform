import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import { TrashIcon,EyeIcon , UserGroupIcon, PencilSquareIcon, FolderIcon } from '@heroicons/react/24/outline';
import logo from "../../public/logo.png";
import { UserCircleIcon} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard'); // State to control the visible section

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user?.role === 'admin') {
          const usersRes = await axios.get('/api/version1/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersRes.data);

          setUsers(usersRes.data.filter(u => u.role !== 'admin'));

          const uploadsRes = await axios.get('/api/version1/admin/uploads', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUploads(uploadsRes.data);

          // const activitiesRes = await axios.get('/api/version1/admin/activities', {
          //   headers: { Authorization: `Bearer ${token}` },
          // });
          // setUserActivities(activitiesRes.data);
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
      await axios.delete(`/api/version1/admin/users/${userId}`, {
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
      await axios.delete(`/api/version1/admin/uploads/${uploadId}`, {
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
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Not authorized as admin.</div>;
  }

  return (
    <div className="bg-gray-900 dark:bg-gray-900 min-h-screen flex">

      <div className="absolute top-6 right-6 flex items-center  space-x-2">
              {/* <UserCircleIcon onClick={() => handleSetActiveSection('Profile')} className="h-9 w-9 mr-5  text-gray-500 cursor-pointer hover:text-gray-500 dark:text-gray-400" />  */}
              <button
                onClick={logout}
                className="bg-red-500 text-gray-300 font-bold py-2 px-3 cursor-pointer rounded hover:bg-red-400 focus:outline-none focus-shadow-outline"
              >
                Logout
              </button>
            </div>
      
      {/* Sidebar */}
      <aside className="bg-gray-800 dark:bg-gray-800 w-64 flex-shrink-0 p-4">
       <div className="flex items-center mt-2 mb-9">
                 {logo && <img src={logo} alt="Logo" className="h-12 w-auto mr-2" />}
                 <h2 className="text-sm font-semibold dark:text-white">Excel Analytics Platform</h2>
               </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
               <button onClick={() => setActiveSection('dashboard')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'dashboard' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 01-1-1h-2a1 1 0 00-1 1v4a1 1 0 011 1h2a1 1 0 001-1v-4c0-1.1-.9-2-2-2h-2a1 1 0 011 1v2a1 1 0 001-1z" /></svg>
            <span>Dashboard</span>
          </button>
            </li>
            <li>
               <button onClick={() => setActiveSection('manageUsers')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'manageUsers' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Manage Users</span>
          </button>
            </li>
            <li>
              {/* <button
                onClick={() => setActiveSection('manageData')}
                className={`block py-2 px-4 rounded-md hover:bg-gray-700 text-gray-400 w-full text-left font-semibold ${activeSection === 'manageData' ? 'bg-gray-700' : ''}`}
              >
                Manage Data
              </button> */}
              <button onClick={() => setActiveSection('manageData')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'manageData' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>Manage Users</span>
          </button>
            </li>
          </ul>
        </nav>
        
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* <h2 className="text-2xl font-semibold mb-6">Admin Dashboard</h2> */}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-4 mt-15 mb-1">
            <h2 className="text-xl text-gray-300  font-semibold mb-4">Admin Dashboard</h2> <br />
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow  rounded-lg p-8 flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-300">Total Users</h3>
                <p className="text-xl text-gray-300 font-bold">{users.length}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow rounded-lg p-6 flex items-center">
              <FolderIcon className="h-8 w-8 text-green-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-300">Uploaded Excel Files</h3>
                <p className="text-xl text-gray-300 font-bold">{uploads.length}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-300">User Activities</h3>
              {userActivities.length === 0 ? (
                <p className="text-gray-400">No user activities recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 text-gray-300">
                      <tr>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Activity</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {userActivities.map((activity) => (
                        <tr key={activity._id} className="hover:bg-gray-700">
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-400">{activity._id}</td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-400">{activity.userId?.username || 'N/A'}</td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-400">{activity.action}</td>
                          <td className="py-2 px-4 whitespace-nowrap text-sm text-gray-400">{new Date(activity.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'manageUsers' && (
          <div className="bg-gray-900  mt-15 shadow  rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Manage Users</h3>
            {users.length === 0 ? (
              <p className="text-gray-400">No regular users registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-4  ">
                {users.map((userItem) => (
                  <div
                    key={userItem._id}
                    className=" bg-gradient-to-br from-gray-900 to-gray-800 border-1 border-cyan-800 rounded-md shadow-md p-4"
                  >
                    <h4 className="text-lg font-semibold text-gray-300 mb-2"><span className='text-gray-300'>{userItem.username}</span></h4>
                    <p className="text-gray-400 mb-1">ID: <span className='text-sm text-blue-700'>{userItem._id}</span></p>
                    <p className="text-gray-400 mb-1">Email: <span className='text-sm text-blue-700'>{userItem.email}</span></p>
                    <p className="text-gray-400 mb-2">Role: <span className='text-sm text-blue-700'>{userItem.role}</span></p>
                    <div className="flex justify-end space-x-2">
                      {userItem.role !== 'admin' && (
                        <>
                          {/* Placeholder for Edit functionality */}
                          <button
                            className="text-gray-400 hover:text-blue-700 focus:outline-none"
                            onClick={() => {
                              // Implement your edit logic here
                              console.log(`Edit user ${userItem._id}`);
                            }}
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem._id)}
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Add any "Add New User" button here if needed */}
          </div>
        )}


       {activeSection === 'manageData' && (
          <div className="bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Manage Data (All Uploads)</h3>
            {uploads.length === 0 ? (
              <p className="text-gray-400">No files uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto rounded-md overflow-hidden shadow-md">
                  <thead className="bg-gray-700 text-gray-300 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Filename</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Uploaded By</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Upload Date</th>
                      {/* Removed Size (Bytes) Header */}
                      <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y border-1 border-gray-700 divide-gray-700">
                    {uploads.map((upload) => (
                      <tr key={upload._id} className="hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{upload._id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{upload.filename}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{upload.userId?.username || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{new Date(upload.uploadDate).toLocaleDateString()}</td>
                        {/* Removed Size (Bytes) Data */}
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              // Implement your view logic here
                              console.log(`View upload ${upload._id}`);
                            }}
                            className="border-1 border-teal-600 hover:bg-teal-600 text-sm text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUpload(upload._id)}
                            className="border-1 border-rose-500 hover:bg-red-500 text-sm text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Add any data management controls here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

//  <div className="mb-4 flex justify-end">
//       <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
//         Add New User
//       </button>
//     </div>