import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import FileUpload from '../components/FileUpload.jsx';
import logo from '../../public/logo.png';
import { ArrowDownTrayIcon, UserCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import AnalysisForm from '../components/AnalysisForm.jsx';

const UserDashboard = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [uploadedData, setUploadedData] = useState(null);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [xAxisColumn, setXAxisColumn] = useState('');
    const [yAxisColumn, setYAxisColumn] = useState('');
    const [chartType, setChartType] = useState('scatter');
    const [activeSection, setActiveSection] = useState('Dashboard');
    const [allAnalysisResults, setAllAnalysisResults] = useState([]);
    const { logout } = useContext(AuthContext);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadId, setUploadId] = useState('');
    const [fileHeaders, setFileHeaders] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [errorLoadingHistory, setErrorLoadingHistory] = useState('');
    const [errorGeneratingAllCharts, setErrorGeneratingAllCharts] = useState('');
    const [chartUrls, setChartUrls] = useState([]);
    const [forceRender, setForceRender] = useState(0);

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const predefinedAnalysisOptions = [
        { label: 'Category', value: 'category' },
        { label: 'Age', value: 'age' },
        { label: 'Revenue', value: 'revenue' },
        { label: 'Profit', value: 'profit' },
        { label: 'Sales', value: 'sales' },
        { label: 'Satisfaction', value: 'satisfaction' },
    ];

    const chartTypeOptions = [
        { label: 'Bar', value: 'bar' },
        { label: 'Line', value: 'line' },
        { label: 'Area', value: 'area' },
        { label: 'Pie', value: 'pie' },
        { label: 'Radar', value: 'radar' },
        { label: 'Bubble', value: 'bubble' },
        { label: 'Doughnut', value: 'doughnut' },
        { label: 'Scatter', value: 'scatter' },
    ];

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/version1/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserProfile(res.data);
                fetchUploadHistory(token);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                logout();
                navigate('/login');
            }
        } else {
            logout();
            navigate('/login');
        }
    };

    async function fetchUploadHistory(authToken) {
        setLoadingHistory(true);
        setErrorLoadingHistory('');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/version1/uploads/history`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setUserProfile(prevProfile => ({ ...prevProfile, uploadHistory: response.data }));
        } catch (error) {
            setErrorLoadingHistory('Failed to load upload history.');
            console.error('Error loading upload history:', error);
        } finally {
            setLoadingHistory(false);
        }
    }

    const handleFileUploadSuccess = (data) => {
        setUploadSuccess('File uploaded successfully!');
        setUploadError('');
        if (data && data.uploadId) {
            setUploadId(data.uploadId);
            const token = localStorage.getItem('token');
            fetchUploadHistory(token);
        } else {
            console.error("Upload successful, but uploadId is missing:", data);
        }

        setFileHeaders(data.headers);
        setUploadedData(data);
        setSelectedFileId(data?.uploadId);
        setAnalysisResult(null);
        setAllAnalysisResults([]);
        setError('');
        setXAxisColumn('');
        setYAxisColumn('');
        setChartType('scatter');
    };

    const handleGenerateAnalysis = async (event) => {
        event.preventDefault();
        if (!selectedFileId) {
            setError("Please upload an excel file to generate insights.");
            return;
        }
        if (!xAxisColumn || !yAxisColumn) {
            setError("Please select both X and Y axes.");
            return;
        }

        setLoadingAnalysis(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `${API_BASE_URL}/api/version1/analyze/${selectedFileId}`,
                { xAxis: xAxisColumn, yAxis: yAxisColumn, chartType: chartType },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAnalysisResult(res.data);
        } catch (err) {
            console.error('Error during analysis:', err);
            setError(err.response?.data?.message || err.message || 'Error generating insights.');
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleGenerateAllCharts = async (event) => {
        event.preventDefault()
        setAllAnalysisResults([]);
        setErrorGeneratingAllCharts('');

        if (!selectedFileId) {
            setErrorGeneratingAllCharts("Please upload an Excel file first.");
            return;
        }

        if (!xAxisColumn || !yAxisColumn) {
            setErrorGeneratingAllCharts('Please select both X and Y axes.');
            return;
        }
        setLoadingAnalysis(true);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/api/version1/uploads/${selectedFileId}/generate-all-charts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ xAxis: xAxisColumn, yAxis: yAxisColumn }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate charts');
            }

            const data = await response.json();
            setAnalysisResult(null);
            setChartUrls(data.chartUrls || []);
            setAllAnalysisResults([...data.chartUrls || []]);

        } catch (error) {
            setErrorGeneratingAllCharts(`Error generating chart data: ${error.message}`);
            console.error('Error generating all chart data:', error);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleDownloadChart = (url, format = 'png') => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `chart.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            setError('No chart URL available to download.');
        }
    };

    const handleDeleteChart = async (uploadRecordId) => {
        if (!window.confirm('Are you sure you want to delete this upload history record and its associated files/charts? This action cannot be undone.')) {
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }

            await axios.delete(`${API_BASE_URL}/api/version1/uploads/${uploadRecordId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Upload history and associated files deleted successfully!');
            fetchUploadHistory(token);
            if (selectedFileId === uploadRecordId) {
                setUploadedData(null);
                setSelectedFileId(null);
                setAnalysisResult(null);
                setAllAnalysisResults([]);
                setChartUrls([]);
            }
        } catch (error) {
            console.error('Error deleting upload history:', error);
            setError('Failed to delete upload history: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be lost.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication token missing. Please log in.');
                logout();
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            };
            await axios.delete(`${API_BASE_URL}/api/version1/users/delete-account`, config);

            alert('Account and all associated data deleted successfully!');
            logout();
            navigate('/login');
        } catch (err) {
            console.error('Error deleting account:', err);
            alert(err.response?.data?.message || 'Failed to delete account.');
        }
    };

    const handleSetActiveSection = (section) => {
        setActiveSection(section);
    };

    useEffect(() => {
        if (allAnalysisResults.length > 0) {
            setForceRender(prev => prev + 1);
        }
    }, [allAnalysisResults]);


    return (
        <div className="bg-gray-900 dark:bg-gray-900 min-h-screen flex">

            {/* Logout Button (Top Right) */}
            <div className="absolute top-6 right-6 flex items-center space-x-2">
                <UserCircleIcon onClick={() => handleSetActiveSection('Profile')} className="h-9 w-9 mr-5 text-gray-500 cursor-pointer hover:text-gray-500 dark:text-gray-400" />
                <button
                    onClick={logout}
                    className="bg-red-500 text-gray-300 font-bold py-2 px-3 cursor-pointer rounded hover:bg-red-400 focus:outline-none focus-shadow-outline"
                >
                    Logout
                </button>
            </div>

            {/* Left Sidebar */}
            <div className="bg-gray-800 dark:bg-gray-800 w-64 flex-shrink-0 p-4">
                <div className="flex items-center mt-2 mb-9">
                    {logo && <img src={logo} alt="Logo" className="h-12 w-auto mr-2" />}
                    <h2 className="text-sm font-semibold dark:text-white">Excel Analytics Platform</h2>
                </div>

                <nav className="space-y-2">
                    <button onClick={() => handleSetActiveSection('Dashboard')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Dashboard' ? 'bg-gray-700 text-red-500' : ''}`}>
                        <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 01-1-1h-2a1 1 0 00-1 1v4a1 1 0 011 1h2a1 1 0 001-1v-4c0-1.1-.9-2-2-2h-2a1 1 0 011 1v2a1 1 0 001-1z" /></svg>
                        <span>Dashboard</span>
                    </button>
                    <button onClick={() => handleSetActiveSection('History')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'History' ? 'bg-gray-700 text-red-500' : ''}`}>
                        <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span>History</span>
                    </button>
                    <button onClick={() => handleSetActiveSection('Integration')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Integration' ? 'bg-gray-700 text-red-500' : ''}`}>
                        <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 16M21 21l-4-4m4 4l-4 4" /></svg>
                        <span>Integration</span>
                    </button>
                    <button onClick={() => handleSetActiveSection('Profile')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Profile' ? 'bg-gray-700 text-red-500' : ''}`}>
                        <svg className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Profile</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 mt-14 p-8">
                {activeSection === 'Dashboard' && (
                    <div>
                        <h2 className="text-2xl text-gray-200 mb-5 font-semibold">Welcome User!</h2>
                        <h2 className="text-xl text-gray-400 mb-8">Upload an Excel File</h2>
                        <div className="border-dashed border-2 border-gray-600 rounded-md p-14 flex flex-col items-center ">
                            <CloudArrowUpIcon className="h-9 w-9 text-gray-500 mb-1" />
                            <FileUpload onUploadSuccess={handleFileUploadSuccess} />
                        </div>


                        {uploadedData?.uploadId && (
                            <div className="mt-8">
                                <h2 className="text-xl text-gray-400 mb-4">Analysis</h2>
                                <AnalysisForm
                                    headers={uploadedData?.headers || Object.keys(uploadedData?.data?.[0] || {})}
                                    xAxisChange={setXAxisColumn}
                                    yAxisChange={setYAxisColumn}
                                    chartTypeChange={setChartType}
                                    selectedXAxis={xAxisColumn}
                                    selectedYAxis={yAxisColumn}
                                    selectedChartType={chartType}
                                    chartTypeOptions={chartTypeOptions}
                                />
                                <div className="mt-4 space-x-2">
                                    <button
                                        onClick={handleGenerateAnalysis}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        disabled={loadingAnalysis || !xAxisColumn || !yAxisColumn}
                                    >
                                        {loadingAnalysis ? 'Generating...' : 'Generate Chart'}
                                    </button>

                                    <button
                                        onClick={handleGenerateAllCharts}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                        disabled={loadingAnalysis || !xAxisColumn || !yAxisColumn}
                                    >
                                        {loadingAnalysis ? 'Generating All...' : 'Generate All Charts'}
                                    </button>
                                </div>
                                {error && <p className="text-red-500 mt-2">{error}</p>}

                                {analysisResult?.chartUrl && (
                                    <div className="mt-4">
                                        <h3 className="text-lg text-gray-400 mb-2">Generated {chartType} Chart</h3>
                                        <img
                                            src={analysisResult.chartUrl}
                                            alt={`${chartType} Chart`}
                                            className="max-w-full"
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-error-image.png'; console.error('Error loading image (single chart):', analysisResult.chartUrl, e); }}
                                        />

                                        <button onClick={() => handleDownloadChart(analysisResult.chartUrl)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                                            <ArrowDownTrayIcon className="h-5 w-5 text-sm inline-block mr-2" /> Download
                                        </button>
                                    </div>
                                )}

                                {allAnalysisResults.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-lg text-gray-400 mb-2">All Generated Charts</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {allAnalysisResults.map((url, index) => (
                                                <div key={index} className="border rounded p-4 dark:border-gray-700">
                                                    <img
                                                        src={url}
                                                        alt={`Generated Chart ${index + 1}`}
                                                        className="w-full h-auto"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-error-image.png'; console.error('Error loading image (all charts):', url, e); }}
                                                    />
                                                    <button onClick={() => handleDownloadChart(url)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                                                        <ArrowDownTrayIcon className="h-5 w-5 text-sm inline-block mr-2" /> Download
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!uploadedData?.uploadId && (
                            <p className="mt-8 text-gray-500">Please upload an Excel file to generate insights.</p>
                        )}
                    </div>
                )}

                {activeSection === 'History' && (
                    <div>
                        <h2 className="text-2xl text-gray-300 mb-4">History</h2>

                        {loadingHistory && <p className="text-gray-500">Loading history...</p>}
                        {errorLoadingHistory && <p className="text-red-500">{errorLoadingHistory}</p>}
                        {userProfile?.uploadHistory?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-800 rounded-md shadow-md">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-gray-300">File Name</th>
                                            <th className="py-2 px-4 text-left text-gray-300">Date</th>

                                            <th className="py-2 px-4 text-center text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userProfile.uploadHistory.map((item) => (
                                            <tr key={item._id} className="border-b border-gray-400">
                                                <td className="py-2 px-4 text-gray-400">{item.filename}</td>
                                                <td className="py-2 px-4 text-gray-400">{new Date(item.uploadDate).toLocaleString()}</td>
                                                <td className="py-2 px-4 text-center space-x-2">
                                                    <button onClick={() => handleDeleteChart(item._id)} className="text-sm text-gray-300 hover:bg-red-500 pt-1 pb-1 pl-3 pr-3 border-2 border-rose-500">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            !loadingHistory && <p className="text-gray-500">No upload history available.</p>
                        )}
                    </div>
                )}

                {activeSection === 'Integration' && (
                    <div>
                        <h2 className="text-xl text-gray-400 mb-4">Integration</h2>
                        <p className="text-gray-500">This section will handle integrations with other services.</p>
                    </div>
                )}

                {/* Profile Section - ONLY THIS SECTION MODIFIED */}
                {activeSection === 'Profile' && (
                    <div className="flex justify-center items-center py-8">
                        {userProfile ? (
                            <div className="bg-gray-800 shadow-xl rounded-lg p-8 max-w-md w-full border border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
                                <div className="flex flex-col items-center mb-6">
                                    {/* Profile Icon */}
                                    <UserCircleIcon className="w-24 h-24 text-gray-400 mb-4" />

                                    {/* User Details */}
                                    <h2 className="text-3xl font-bold text-gray-200 mb-2">{userProfile.username}</h2>
                                    <p className="text-gray-400 text-lg mb-4">{userProfile.email}</p> {/* Added email */}

                                    {/* User ID */}
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <span className="font-semibold mr-2">ID:</span>
                                        <span>{userProfile._id}</span> {/* Added User ID */}
                                    </div>
                                    {/* Last Login Date/Time */}
                                    {userProfile.lastLogin && (
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <span className="font-semibold mr-2">Last Login:</span>
                                            <span>{new Date(userProfile.lastLogin).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-700 pt-6 mt-6">
                                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Account Details</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Role */}
                                        <div className="flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-inner">
                                            <span className="text-gray-400 font-medium">Role:</span>
                                            <span className="text-gray-200 font-semibold">{userProfile.role}</span>
                                        </div>
                                        {/* Member Since */}
                                        <div className="flex justify-between items-center bg-gray-700 p-3 rounded-md shadow-inner">
                                            <span className="text-gray-400 font-medium">Member Since:</span>
                                            <span className="text-green-500 font-semibold">
                                                {/* {new Date(userProfile.createdAt).toLocaleDateString()} */}
                                                non member
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
                        ) : (
                            <p className="text-gray-400">Loading profile information...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;