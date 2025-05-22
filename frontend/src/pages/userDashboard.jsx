import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import FileUpload from '../components/FileUpload.jsx';
import logo from '../../public/logo.png';
import { ArrowDownTrayIcon, UserCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import AnalysisForm from '../components/AnalysisForm.jsx'

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
    const [token, setToken] = useState('');
    const [errorLoadingHistory, setErrorLoadingHistory] = useState('');
    const [errorGeneratingAllCharts, setErrorGeneratingAllCharts] = useState('');
    const [chartUrls, setChartUrls] = useState([]);
    const [forceRender, setForceRender] = useState(0);

    const navigate = useNavigate();

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
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
        console.log("fetchuploadhistory hit")

        try {
            console.log("inside fetchuploadhistory try catch block")
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/uploads/history`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log('Response from fetchUploadHistory:', response.data);
            // Assuming userProfile has a property for uploadHistory
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
        console.log('Data received after upload in handleFileUploadSuccess:', data);

        if (data && data.uploadId) {
            setUploadId(data.uploadId);
            const token = localStorage.getItem('token');
            console.log('Token being used for fetchUploadHistory:', token);
            fetchUploadHistory(token); // Refresh history immediately after successful upload
        } else {
            console.error("Upload successful, but uploadId is missing:", data);
        }

        setUploadSuccess('File uploaded successfully!');
        setUploadError('');
        setUploadId(data.uploadId);
        setFileHeaders(data.headers);
        // fetchUploadHistory(token); // This line is redundant as it's called above inside the if(data.uploadId) block
        setUploadedData(data);
        setSelectedFileId(data?.uploadId);
        setAnalysisResult(null);
        setAllAnalysisResults([]);
        setError('');
        setXAxisColumn('');
        setYAxisColumn('');
        setChartType('scatter');
        console.log('Data received after upload:', data);
        console.log('File Path on Backend:', data?.filePath);
    };

    const handleGenerateAnalysis = async (event) => { // Added 'event' parameter
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
                `${import.meta.env.VITE_API_URL}/api/version1/analyze/${selectedFileId}`,
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

    const handleGenerateAllCharts = async (event) => { // Added 'event' parameter
        console.log('selectedFileId in handleGenerateChart:', selectedFileId);
        event.preventDefault()
        setAllAnalysisResults([]);
        setErrorGeneratingAllCharts('');
        // setChartUrls([]); // Clear previous URLs

        if (!selectedFileId) { // Use selectedFileId here instead of uploadId state as it should be more reliable
            setErrorGeneratingAllCharts("Please upload an Excel file first.");
            return;
        }

        if (!xAxisColumn || !yAxisColumn) {
            setErrorGeneratingAllCharts('Please select both X and Y axes.');
            return;
        }
        setLoadingAnalysis(true);

        const token = localStorage.getItem('token');

        console.log('Using uploadId for all charts:', selectedFileId); // Log which ID is being used

        try {
            console.log('GenerateAllCharts function hit!');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/version1/uploads/${selectedFileId}/generate-all-charts`, {
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
            console.log('Response from generate-all-charts:', data);
            console.log('Chart URLs received:', data.chartUrls);
            setAnalysisResult(null); // Clear single chart analysis
            setChartUrls(data.chartUrls || []); // Set the array of Cloudinary URLs
            setAllAnalysisResults([...data.chartUrls || []]); // Also set allAnalysisResults with the URLs

            // Remove this block as backend now directly sends array of URLs
            // if (response.data && Array.isArray(response.data)) {
            //     setAllAnalysisResults(response.data);
            // } else {
            //     setErrorGeneratingAllCharts('No chart data received from the server.');
            // }

        } catch (error) {
            setErrorGeneratingAllCharts(`Error generating chart data: ${error.message}`);
            console.error('Error generating all chart data:', error);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleDownloadChart = (url, format = 'png') => {
        if (url) {
            // Directly use the Cloudinary URL for download
            const link = document.createElement('a');
            link.href = url; // Cloudinary URL is already a direct link to the image
            link.download = `chart.${format}`; // Suggest a filename for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            setError('No chart URL available to download.');
        }
    };

    const handleViewChart = (fileId) => {
        console.log('View chart for:', fileId);
    };

    const handleDeleteChart = async (uploadRecordId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                return;
            }

            await axios.delete(`${import.meta.env.VITE_API_URL}/api/version1/uploads/${uploadRecordId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Upload history and associated files deleted successfully!');
            fetchUploadHistory(token); // Refresh history
            // Clear current analysis if the deleted file was the active one
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

    const handleSetActiveSection = (section) => {
        setActiveSection(section);
    };

    useEffect(() => {
        console.log('allAnalysisResults state in useEffect:', allAnalysisResults);
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
                                        {/* CRITICAL CHANGE: Use analysisResult.chartUrl directly */}
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
                                                    {/* CRITICAL CHANGE: Use 'url' directly */}
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

                {activeSection === 'Profile' && (
                    <div>
                        <h2 className="text-2xl text-gray-300 mb-4">Profile</h2>
                        {userProfile && (
                            <div className="bg-gray-800 rounded-md shadow-md p-6">
                                <label className="text-red-500 text-xl"  >Username</label>
                                <p className="text-gray-400 text-md"> {userProfile.username}</p>
                                <label className="text-red-500 text-xl" >Email</label>
                                <p className="text-gray-400 text-md">{userProfile.email}</p>
                            </div>
                        )}
                        <button className='mt-10 text-md hover:bg-red-800 border-2 border-red-500 rounded-md p-2 text-gray-100'>Delete Account</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;