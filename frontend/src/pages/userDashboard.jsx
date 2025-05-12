import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import FileUpload from '../components/FileUpload.jsx'; // Assuming this component handles file uploads
// import { ArrowUpTrayIcon, ChartBarIcon, DocumentArrowDownIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import logo from '../../public/logo.png'; 
// import defaultChartImage from '../assets/barchart.jpg'; // Replace with your sample bar chart image
// import { cn } from "@/lib/utils" //Utility
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import AnalysisForm from '../components/AnalysisForm.jsx'

const UserDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [allAnalysisResults, setAllAnalysisResults] = useState([]);
  const [error, setError] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [chartType, setChartType] = useState('scatter');
  const [activeSection, setActiveSection] = useState('Dashboard');
  const { logout } = useContext(AuthContext);
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

  const handleFileUploadSuccess = (data) => {
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

  const handleGenerateAnalysis = async (event) => {
    event.preventDefault();

    if (!selectedFileId) {
      setError("Please upload an excel file first.");
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

  const handleGenerateAllCharts = async (event) => {
    console.log('selectedFileId in handleGenerateChart:', selectedFileId);
    event.preventDefault();
    if (!selectedFileId) {
        setError("Please upload an excel file first.");
        return;
    }
    if (!xAxisColumn || !yAxisColumn) {
        setError("Please select both X and Y axes.");
        return;
    }
    setLoadingAnalysis(true);
    setError("");
    setAllAnalysisResults([]); // Clear previous results

    const token = localStorage.getItem('token');

    console.log('selectedFileId:', selectedFileId);
    try {
      console.log('GenerateAllCharts function hit!'); // Add this log
        const res = await fetch(`<span class="math-inline">\{import\.meta\.env\.VITE\_API\_URL\}/api/version1/upload/uploads/</span>{selectedFileId}/generate-all-charts`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ xAxis: xAxisColumn, yAxis: yAxisColumn }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to generate charts');
        }

        const data = await res.json(); // Get the JSON response
        console.log('Response from generate-all-charts:', data); // Log the entire response

        if (data && data.chartUrls && Array.isArray(data.chartUrls)) {
            setAllAnalysisResults(data.chartUrls); // Store the array of URLs
        } else {
            setError("No chart URLs received from the server.");
        }
         res.status(200).send('Generate All Charts endpoint was hit!'); // Send a simple text response
    console.log('Basic text response sent.'); // Add this log
    } catch (err) {
        console.error("Error generating all charts:", err);
        setError(`Error generating charts: ${err.message}`);
    } finally {
        setLoadingAnalysis(false);
    }
};

  const handleDownloadChart = (chartUrl, chartType) => {
    if (chartUrl) {
      const link = document.createElement('a');
      link.href = chartUrl;
      link.download = `chart.${chartType || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setError('No chart available to download.');
    }
  };

  const handleViewChart = (fileId) => {
    // Implement logic to view a previously generated chart
    console.log('View chart for:', fileId);
  };

  const handleDeleteChart = (fileId) => {
    // Implement logic to delete a previously generated chart
    console.log('Delete chart for:', fileId);
  };

  const handleSetActiveSection = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-900 min-h-screen flex">
      {/* Left Sidebar */}
      <div className="bg-gray-800 dark:bg-gray-800 w-64 flex-shrink-0 p-4">
        <h1 className="text-sm font-bold text-gray-300 mb-4">Excel Analytics Platform</h1>
        <nav className="space-y-2">
          <button onClick={() => handleSetActiveSection('Dashboard')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Dashboard' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 01-1-1h-2a1 1 0 00-1 1v4a1 1 0 011 1h2a1 1 0 001-1v-4c0-1.1-.9-2-2-2h-2a1 1 0 011 1v2a1 1 0 001-1z" /></svg>
            <span>Dashboard</span>
          </button>
          <button onClick={() => handleSetActiveSection('History')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'History' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span>History</span>
          </button>
          <button onClick={() => handleSetActiveSection('Integration')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Integration' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l-4 16M21 21l-4-4m4 4l-4 4" /></svg>
            <span>Integration</span>
          </button>
          <button onClick={() => handleSetActiveSection('Profile')} className={`flex items-center space-x-2 py-2 px-4 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-700 ${activeSection === 'Profile' ? 'bg-gray-700 text-red-500' : ''}`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span>Profile</span>
          </button>
        </nav>
        <button onClick={logout} className="mt-4 block w-full py-2 px-4 rounded-md text-red-400 hover:text-red-100 hover:bg-gray-700">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeSection === 'Dashboard' && (
          <div>
            <h2 className="text-xl text-gray-400 mb-4">Upload an Excel File</h2>
            <div className="border-dashed border-2 border-gray-600 rounded-md p-6 flex justify-center items-center">
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
                    {/* <img src={analysisResult.chartUrl} alt={`${chartType} Chart`} className="max-w-full" /> */}
                    <img src={`https://excel-analytics-platform.onrender.com${analysisResult.chartUrl}`} alt="Generated Chart" className="max-w-full" />
                    <button onClick={() => handleDownloadChart(analysisResult.chartUrl, chartType)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                      <ArrowDownTrayIcon className="h-5 w-5 inline-block mr-2" /> Download
                    </button>
                  </div>
                )}

                {allAnalysisResults.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg text-gray-400 mb-2">All Generated Charts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allAnalysisResults.map((result) => (
                        <div key={result.chartType} className="bg-gray-800 rounded-md p-4">
                          <h4 className="text-md text-gray-300 mb-2">{result.chartType} Chart</h4>
                          {result.data?.chartUrl ? (
                            <div>
                              <img src={result.chartUrl} alt={`${result.chartType} Chart`} className="max-w-full" />
                              <button onClick={() => handleDownloadChart(result.data.chartUrl, result.chartType)} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2">
                                <ArrowDownTrayIcon className="h-5 w-5 inline-block mr-2" /> Download
                              </button>
                              {/* Add View option if needed */}
                            </div>
                          ) : (
                            <p className="text-red-500">Error generating this chart.</p>
                          )}
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
            <h2 className="text-xl text-gray-400 mb-4">History</h2>
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
                      <tr key={item._id} className="border-b border-gray-700">
                        <td className="py-2 px-4 text-gray-400">{item.filename}</td>
                        <td className="py-2 px-4 text-gray-400">{new Date(item.uploadDate).toLocaleDateString()}</td>
                        <td className="py-2 px-4 text-center space-x-2">
                          {/* <button onClick={() => handleViewChart(item._id)} className="text-indigo-500 hover:text-indigo-400">
                            <EyeIcon className="h-5 w-5 inline-block" />
                          </button> */}
                          <button onClick={() => handleDeleteChart(item._id)} className="text-red-500 hover:text-red-400">
                            <svg className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No upload history available.</p>
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