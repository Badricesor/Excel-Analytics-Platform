import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import FileUpload from '../components/FileUpload.jsx';
import logo from '../../public/logo.png';
import { ArrowDownTrayIcon, UserCircleIcon, CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
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
    const [allAnalysisResults, setAllAnalysisResults] = useState([]); // This will hold objects { url: base64, type: chartType }
    const { logout } = useContext(AuthContext);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploadId, setUploadId] = useState(''); // This should be the same as selectedFileId after upload
    const [fileHeaders, setFileHeaders] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || ''); // Initialize token from localStorage
    const [errorLoadingHistory, setErrorLoadingHistory] = useState('');
    const [errorGeneratingAllCharts, setErrorGeneratingAllCharts] = useState('');
    // const [chartUrls, setChartUrls] = useState([]); // This state is redundant, allAnalysisResults will hold the URLs

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
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUserProfile(storedToken); // Pass token to fetchUserProfile
        } else {
            logout(); // If no token, log out and navigate to login
            navigate('/login');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const fetchUserProfile = async (authToken) => {
        if (!authToken) {
            console.error("No auth token provided to fetchUserProfile");
            logout();
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setUserProfile(res.data);
            fetchUploadHistory(authToken); // Fetch history AFTER user profile, using the same token
        } catch (err) {
            console.error('Error fetching user profile:', err);
            logout();
            navigate('/login');
        }
    };

    async function fetchUploadHistory(authToken) {
        setLoadingHistory(true);
        setErrorLoadingHistory('');
        console.log("fetchUploadHistory hit with token:", authToken ? "present" : "missing");

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/uploads/history`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log('Response from fetchUploadHistory:', response.data);
            // Assuming userProfile.uploadHistory is updated here
            setUserProfile(prevProfile => ({
                ...prevProfile,
                uploadHistory: response.data // Update history in userProfile state
            }));
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
            setSelectedFileId(data.uploadId); // Ensure selectedFileId is also set
            setFileHeaders(data.headers); // Use headers from the upload response
            setUploadedData(data); // Store the entire response data

            // Set default selected columns if available
            if (data.headers && data.headers.length > 0) {
                setXAxisColumn(data.headers[0]);
                if (data.headers.length > 1) {
                    setYAxisColumn(data.headers[1]);
                } else {
                    setYAxisColumn(data.headers[0]); // Fallback if only one column
                }
            } else {
                setXAxisColumn('');
                setYAxisColumn('');
            }

            // Clear previous analysis results
            setAnalysisResult(null);
            setAllAnalysisResults([]);
            setError('');

            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                fetchUploadHistory(currentToken); // Refresh history immediately after successful upload
            } else {
                console.error("No token found to fetch history after upload.");
            }
        } else {
            console.error("Upload successful, but uploadId or data is missing:", data);
        }
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
        setAnalysisResult(null); // Clear previous single chart
        setAllAnalysisResults([]); // Clear previous all charts

        try {
            const currentToken = localStorage.getItem('token');
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/version1/uploads/${selectedFileId}/analyze`, // Corrected endpoint for single analyze
                { xAxis: xAxisColumn, yAxis: yAxisColumn, chartType: chartType },
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                }
            );
            setAnalysisResult(res.data);
            console.log('Analysis Result (single chart):', res.data);
        } catch (err) {
            console.error('Error during analysis:', err);
            setError(err.response?.data?.message || err.message || 'Error generating insights.');
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleGenerateAllCharts = async (event) => {
        event.preventDefault();
        setAllAnalysisResults([]);
        setErrorGeneratingAllCharts('');

        if (!selectedFileId) {
            setErrorGeneratingAllCharts('Please upload an excel file to generate all charts.');
            return;
        }
        if (!xAxisColumn || !yAxisColumn) {
            setErrorGeneratingAllCharts('Please select both X and Y axes.');
            return;
        }

        setLoadingAnalysis(true);

        const currentToken = localStorage.getItem('token');
        console.log('uploadId for generate all charts:', uploadId);
        console.log(`Sending xAxis: ${xAxisColumn}, yAxis: ${yAxisColumn}`);

        try {
            console.log('GenerateAllCharts function hit!');
            const response = await axios.post( // Changed to axios
                `${import.meta.env.VITE_API_URL}/api/version1/uploads/${selectedFileId}/generate-all`, // Corrected endpoint
                { xAxis: xAxisColumn, yAxis: yAxisColumn },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`,
                    },
                }
            );

            console.log('Response from generate-all-charts:', response.data);
            if (response.data && Array.isArray(response.data.chartDetails)) { // Check for chartDetails and if it's an array
                setAllAnalysisResults(response.data.chartDetails);
                console.log('Chart details received for all charts:', response.data.chartDetails);
                setAnalysisResult(null); // Clear single chart result
            } else {
                setErrorGeneratingAllCharts('No valid chart data received from the server for all charts.');
            }

        } catch (error) {
            setErrorGeneratingAllCharts(`Error generating all chart data: ${error.response?.data?.message || error.message}`);
            console.error('Error generating all chart data:', error);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const handleDownloadChart = (url, type) => { // Added 'type' to differentiate download names
        if (url) {
            const link = document.createElement('a');
            link.href = url; // Use Base64 URL directly
            link.download = `${type || 'chart'}.png`; // Use chart type for filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            setError('No chart URL available to download.');
        }
    };

    const handleViewChart = (fileId) => {
        // This function would be used if you want to load an *existing* analysis
        // from history and display its chart (if pre-generated or if you re-analyze)
        console.log('View chart for:', fileId);
        // To re-display: you'd need to re-fetch the data associated with fileId
        // and potentially re-run analysis if the chart image isn't stored.
        // For simplicity, for now, we'll just set the selectedFileId and headers
        const selectedUpload = userProfile?.uploadHistory.find(item => item._id === fileId);
        if (selectedUpload) {
            setUploadId(selectedUpload._id);
            setSelectedFileId(selectedUpload._id);
            if (selectedUpload.data && selectedUpload.data.length > 0) {
                setFileHeaders(Object.keys(selectedUpload.data[0]));
            } else {
                setFileHeaders([]);
            }
            setAnalysisResult(null);
            setAllAnalysisResults([]);
            // You might want to pre-select columns if the history record stored them
            setXAxisColumn('');
            setYAxisColumn('');
            setActiveSection('Dashboard');
        }
    };

    const handleDeleteChart = async (fileId) => { // Renamed from handleDeleteChart to handleDeleteUpload for clarity
        if (window.confirm('Are you sure you want to delete this upload history?')) {
            try {
                const currentToken = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/version1/uploads/${fileId}`, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                });
                alert('Upload history deleted successfully!');
                fetchUploadHistory(currentToken); // Refresh history
                // If the deleted file was the currently selected one, clear dashboard states
                if (selectedFileId === fileId) {
                    setUploadId('');
                    setSelectedFileId(null);
                    setUploadedData(null);
                    setFileHeaders([]);
                    setAnalysisResult(null);
                    setAllAnalysisResults([]);
                    setXAxisColumn('');
                    setYAxisColumn('');
                    setError('');
                }
            } catch (err) {
                console.error('Error deleting upload history:', err);
                setError('Failed to delete upload history.');
            }
        }
    };

    const handleSetActiveSection = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="bg-gray-900 dark:bg-gray-900 min-h-screen flex">

            {/* Logout Button (Top Right) */}
            <div className="absolute top-6 right-6 flex items-center space-x-2">
                <UserCircleIcon onClick={() => handleSetActiveSection('Profile')} className="h-9 w-9 mr-5 text-gray-500 cursor-pointer hover:text-gray-500 dark:text-gray-400" /> {/* Profile Icon */}
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
                        <h2 className="text-2xl text-gray-200 mb-5 font-semibold">Welcome {userProfile?.username || 'User'}!</h2>
                        <h2 className="text-xl text-gray-400 mb-8">Upload an Excel File</h2>
                        <div className="border-dashed border-2 border-gray-600 rounded-md p-14 flex flex-col items-center ">
                            <CloudArrowUpIcon className="h-9 w-9 text-gray-500 mb-1" /> {/* Upload Icon */}
                            <FileUpload onUploadSuccess={handleFileUploadSuccess} API_URL={import.meta.env.VITE_API_URL} token={token} />
                        </div>
                        {uploadSuccess && <p className="text-green-500 mt-2">{uploadSuccess}</p>}
                        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}


                        {selectedFileId && ( // Use selectedFileId here
                            <div className="mt-8">
                                <h2 className="text-xl text-gray-400 mb-4">Analysis</h2>
                                <AnalysisForm
                                    headers={fileHeaders} // Use fileHeaders state
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
                                {errorGeneratingAllCharts && <p className="text-red-500 mt-2">{errorGeneratingAllCharts}</p>}

                                {analysisResult?.chartUrl && (
                                    <div className="mt-4">
                                        <h3 className="text-lg text-gray-400 mb-2">Generated {analysisResult.chartType} Chart</h3>
                                        <img
                                            src={analysisResult.chartUrl} // Use Base64 URL directly
                                            alt={`${analysisResult.chartType} Chart`}
                                            className="max-w-full"
                                        />
                                        <button onClick={() => handleDownloadChart(analysisResult.chartUrl, analysisResult.chartType)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                                            <ArrowDownTrayIcon className="h-5 w-5 text-sm inline-block mr-2" /> Download
                                        </button>
                                    </div>
                                )}

                                {allAnalysisResults.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-lg text-gray-400 mb-2">All Generated Charts</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {allAnalysisResults.map((chartInfo, index) => ( // Iterate over chartInfo objects
                                                <div key={index} className="border rounded p-4 dark:border-gray-700">
                                                    <h4 className="text-md text-gray-300 mb-2 capitalize">{chartInfo.type} Chart</h4> {/* Display chart type */}
                                                    <img
                                                        src={chartInfo.url} // Use Base64 URL directly
                                                        alt={`${chartInfo.type} Chart`}
                                                        className="w-full h-auto"
                                                        onError={() => console.error('Error loading image:', chartInfo.url)}
                                                    />
                                                    <button onClick={() => handleDownloadChart(chartInfo.url, chartInfo.type)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                                                        <ArrowDownTrayIcon className="h-5 w-5 text-sm inline-block mr-2" /> Download
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedFileId && (
                            <p className="mt-8 text-gray-500">Please upload an Excel file to generate insights.</p>
                        )}
                    </div>
                )}

                {activeSection === 'History' && (
                    <div>
                        <h2 className="text-xl text-gray-400 mb-4">Upload History</h2>
                        {loadingHistory && <p className="text-blue-400">Loading history...</p>}
                        {errorLoadingHistory && <p className="text-red-500">{errorLoadingHistory}</p>}
                        {userProfile?.uploadHistory?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-800 rounded-md shadow-md">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="py-2 px-4 text-left text-gray-300">File Name</th>
                                            <th className="py-2 px-4 text-left text-gray-300">Upload Date</th> {/* Changed from 'Date' to 'Upload Date' */}
                                            <th className="py-2 px-4 text-center text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userProfile.uploadHistory.map((item) => (
                                            <tr key={item._id} className="border-b border-gray-700">
                                                <td className="py-2 px-4 text-gray-400">{item.filename}</td>
                                                <td className="py-2 px-4 text-gray-400">{new Date(item.uploadDate).toLocaleDateString()}</td>
                                                <td className="py-2 px-4 text-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewChart(item._id)} // Changed this to handleViewChart
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        Select
                                                    </button>
                                                    <button onClick={() => handleDeleteChart(item._id)} className="text-red-500 hover:text-red-400">
                                                        <TrashIcon className="h-5 w-5 inline-block" />
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
                        {/* Add integration content here */}
                    </div>
                )}

                {activeSection === 'Profile' && (
                    <div>
                        <h2 className="text-xl text-gray-400 mb-4">Profile</h2>
                        {userProfile && (
                            <div className="bg-gray-800 rounded-md shadow-md p-6">
                                <label className="text-red-500" >Username</label>
                                <p className="text-gray-400"> {userProfile.username}</p>
                                <label className="text-red-500" >Email</label>
                                <p className="text-gray-400">{userProfile.email}</p>
                                {/* Add more profile information or edit options here */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;