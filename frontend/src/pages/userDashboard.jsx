import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import FileUpload from '../components/FileUpload.jsx'; // Assuming this component handles file uploads
import { ArrowUpTrayIcon, ChartBarIcon, DocumentArrowDownIcon, EyeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import logo from '../../public/logo.png'; // Replace with your actual logo path
import defaultChartImage from '../assets/barchart.jpg'; // Replace with your sample bar chart image
import { cn } from "@/lib/utils" //Utility

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
 { label: 'Scatter', value: 'scatter' },
];

const UserDashboard = () => {
 const [userProfile, setUserProfile] = useState(null);
 const [uploadedData, setUploadedData] = useState(null);
 const [selectedFileId, setSelectedFileId] = useState(null);
 const [analysisResult, setAnalysisResult] = useState(null); // Will hold the chart image URL or data
 const [error, setError] = useState('');
 const [loadingAnalysis, setLoadingAnalysis] = useState(false);
 const [xAxisColumn, setXAxisColumn] = useState('');
 const [yAxisColumn, setYAxisColumn] = useState('');
 const [chartType, setChartType] = useState('bar');
 const [activeSection, setActiveSection] = useState('dashboard');
 const { user, logout } = useContext(AuthContext);
 const navigate = useNavigate();

 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const token = localStorage.getItem('token');
 if (token) {
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/version1/users/profile`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 setUserProfile(res.data);
 } else {
 navigate('/login');
 }
 } catch (err) {
 console.error('Error fetching user profile:', err);
 logout();
 navigate('/login');
 }
 };

 fetchProfile();
 }, [navigate, logout]);

const handleFileUploadSuccess = (data, fileId) => {
   setUploadedData(data);
   setSelectedFileId(fileId);
   setAnalysisResult(null);
   setError('');
   setXAxisColumn('');
   setYAxisColumn('');
   setChartType('bar');
 };

 const handleAnalysis = async () => {
 if (!selectedFileId) {
 setError('Please upload a file first.');
 return;
 }
 if (!xAxisColumn || !yAxisColumn) {
 setError('Please select both X and Y axes.');
 return;
 }
 setLoadingAnalysis(true);
 try {
 const token = localStorage.getItem('token');
 // In a real scenario, you would send xAxisColumn, yAxisColumn, and chartType to your backend
 // The backend would process the data and return the URL or data for the generated chart image.
 // For this example, we'll simulate a successful response with a placeholder URL.
 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call delay

   // Simulate different chart image URLs based on selections.  Replace these with actual URLs.
   let chartImageUrl = 'url-to-default-chart.png'; // Default
   if (chartType === 'bar') {
     chartImageUrl = 'url-to-bar-chart.png';
   } else if (chartType === 'line') {
     chartImageUrl = 'url-to-line-chart.png';
   } else if (chartType === 'pie') {
       chartImageUrl = 'url-to-pie-chart.png';
   } else if (chartType === 'area'){
       chartImageUrl = 'url-to-area-chart.png';
   } else if (chartType === 'radar'){
       chartImageUrl = 'url-to-radar-chart.png';
   } else if (chartType === 'bubble'){
       chartImageUrl = 'url-to-bubble-chart.png'
   } else if (chartType === 'scatter'){
       chartImageUrl = 'url-to-scatter-chart.png'
   }

 setAnalysisResult({ chartUrl: chartImageUrl, chartType });
 setError('');
 } catch (err) {
 console.error('Error during analysis:', err);
 setError(err.response?.data?.message || 'Error during analysis');
 } finally {
 setLoadingAnalysis(false);
 }
 };

 const handleLogout = () => {
 logout();
 navigate('/login');
 };

 const handleOpenChart = async (fileId) => {
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`/api/admin/uploads/${fileId}`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 const fileData = res.data.fileData;
       setUploadedData(fileData);
       setSelectedFileId(fileId);
       setXAxisColumn(res.data.analysisDetails?.xAxis || '');
       setYAxisColumn(res.data.analysisDetails?.yAxis || '');
       setChartType(res.data.analysisDetails?.chartType || 'bar');
       setAnalysisResult({ chartUrl: res.data.analysisResult?.chartUrl, chartType: res.data.analysisDetails?.chartType });
       setError('');
       setActiveSection('dashboard');
 } catch (err) {
 console.error('Error opening chart:', err);
 setError('Failed to open chart history.');
 }
 };

 const handleGenerateInsights = () => {
 setActiveSection('integration');
 };

 const handleDownloadChart = () => {
 if (analysisResult?.chartUrl) {
 const link = document.createElement('a');
 link.href = analysisResult.chartUrl;
 link.download = `chart.${analysisResult.chartType === 'pie' ? 'png' : 'png'}`; // Adjust extension as needed
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 } else {
 setError('No chart available to download.');
 }
 };

 const handleViewChart = () => {
 if (analysisResult?.chartUrl) {
 window.open(analysisResult.chartUrl, '_blank');
 } else {
 setError('No chart available to view.');
 }
 };

 return (
 <div className="bg-gray-900 dark:bg-black-800 min-h-screen flex">
 {/* Left Sidebar Menu */}
 <div className="bg-gray-800 dark:bg-black-800flex-shrink-0 p-6">
 <div className="flex items-center mb-8">
 <img src={logo} alt="Logo" className="h-8 w-auto mr-2" />
 <h1 className="text-xs font-semibold text-gray-800">Excel Analytics</h1>
 </div>
 <nav className="space-y-3 mt-10">
 <button onClick={() => setActiveSection('dashboard')} className={cn(
           "flex items-center text-gray-300 hover:text-red-500 font-semibold w-full",
           activeSection === 'dashboard' && 'text-red-500'
       )}>
 <ChartBarIcon className="h-5 w-5 mr-2" />
 Dashboard
 </button>
 <button onClick={() => setActiveSection('history')} className={cn(
           "flex items-center text-gray-300 hover:text-red-500 font-semibold w-full",
           activeSection === 'history' && 'text-red-500'
       )}>
 <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
 History
 </button>
 <button onClick={() => setActiveSection('integration')} className={cn(
           "flex items-center text-gray-300 hover:text-red-500 font-semibold w-full",
           activeSection === 'integration' && 'text-red-500'
       )}>
 <EyeIcon className="h-5 w-5 mr-2" />
 Integration
 </button>
 <Link to="/profile" className="flex items-center text-gray-300 hover:text-red-500 font-semibold w-full">
 <UserCircleIcon className="h-5 w-5 mr-2" />
 Profile
 </Link>
 </nav>
 </div>

 {/* Main Content */}
 <div className="flex-1 p-6">
 {/* Top Right Section */}
 <div className="flex justify-end items-center mb-6">
 <Link to="/profile" className="mr-4">
 <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-indigo-600 cursor-pointer" />
 </Link>
 <button
 onClick={handleLogout}
 className="inline-flex items-center px-4 py-2 border  rounded-sm shadow-sm text-sm font-medium text-gray-100 bg-red-500 hover:bg-red-600 focus:outline-none focus-ring-2 focus-ring-offset-2 focus-ring-indigo-500"
 >
 Logout
 </button>
 </div>

 {/* Dashboard Section */}
 {activeSection === 'dashboard' && (
 <div className="bg-gray-800 border-1 mt-10 border-gray-300 border-solid  shadow-md rounded-lg overflow-hidden">
 <div className="px-6 py-5 border-b border-gray-200">
 <h2 className="text-xl font-semibold text-gray-300 mb-2">
 Upload an Excel file
 </h2>
 <p className="text-sm text-gray-300 mb-4">
 Select an Excel file to analyze and visualize its data.
 </p>
 <div className="border-2 border-dashed border-gray-400 rounded-md p-6 flex flex-col items-center justify-center">
 <ArrowUpTrayIcon className="h-10 w-10 text-gray-300" />
 <p className="mt-2 text-sm text-gray-400">
 Drop file here or <button className="text-red-500 hover:text-red-400 focus:outline-none focus-underline">click to browse</button>
 </p>
 <FileUpload onUploadSuccess={handleFileUploadSuccess} />
 </div>
 </div>

 {/* Analysis Section - Always Visible */}
 <div className="px-6 py-5  ">
 <h3 className="text-md font-semibold text-gray-300 mb-4">
 Analysis
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
 <div>
 <label htmlFor="xAxis" className="block text-sm font-medium text-gray-300">X-axis</label>
 <select
 id="xAxis"
 className="mt-1 block w-full py-2 px-3 border text-gray-200 border-gray-300 bg-gray-600 rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
 value={xAxisColumn}
 onChange={(e) => setXAxisColumn(e.target.value)}
 disabled={!uploadedData}
 >
 <option value="">Select an option</option>
 {predefinedAnalysisOptions.map(option => (
 <option key={option.value} value={option.value}>{option.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label htmlFor="yAxis" className="block text-sm font-medium text-gray-300">Y-axis</label>
 <select
 id="yAxis"
 className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
 value={yAxisColumn}
 onChange={(e) => setYAxisColumn(e.target.value)}
 disabled={!uploadedData}
 >
 <option value="">Select an option</option>
 {predefinedAnalysisOptions.map(option => (
 <option key={option.value} value={option.value}>{option.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label htmlFor="chartType" className="block text-sm font-medium text-gray-300">Chart type</label>
 <select
 id="chartType"
 className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-600 text-gray-200 rounded-md shadow-sm focus:outline-none focus-ring-indigo-500 focus-border-indigo-500 sm:text-sm"
 value={chartType}
 onChange={(e) => setChartType(e.target.value)}
 disabled={!uploadedData}
 >
 <option value="">Select a chart type</option>
 {chartTypeOptions.map(option => (
 <option key={option.value} value={option.value}>{option.label}</option>
 ))}
 </select>
 </div>
 <div className="md:col-span-3 mt-4">
 <button
 onClick={handleAnalysis}
 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-ring-2 focus-ring-offset-2 focus-ring-indigo-500"
 disabled={loadingAnalysis || !uploadedData || !xAxisColumn || !yAxisColumn}
 >
 {loadingAnalysis ? 'Generating Chart...' : 'Generate Chart'}
 </button>
 {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
 </div>
 </div>
 <div className="mt-6 border rounded-md p-4 bg-gray-600 flex items-center justify-center">
 <div className="flex items-center">
 <img src={defaultChartImage} alt="Sample Bar Chart" className="h-100  w-auto" />
 </div>
 <div>
 <DocumentArrowDownIcon
                       className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer mr-2"
                       title="Download Chart"
                       onClick={() => alert('Download functionality for default chart')}
                   />
                   <EyeIcon
                       className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer"
                       title="View Chart in Full Screen"
                       onClick={() => alert('View functionality for default chart')}
                   />
 </div>
 </div>
 {analysisResult?.chartUrl && (
 <div className="mt-6">
 <h4 className="text-lg leading-6 font-medium text-gray-900">
 Chart Preview
 </h4>
 <div className="mt-2 relative">
 <img src={analysisResult.chartUrl} alt="Generated Chart" className="w-full rounded-md" />
 <div className="absolute top-2 right-2 flex items-center">
 <DocumentArrowDownIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer mr-2" title="Download Chart" onClick={handleDownloadChart} />
 <EyeIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" title="View Chart in Full Screen" onClick={handleViewChart} />
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {activeSection === 'history' && (
 <div className="bg-gray-600 shadow-md rounded-lg overflow-hidden">
 <div className="px-6 py-5 border-b border-gray-200">
 <h3 className="text-md font-semibold text-gray-800 mb-4">
 History
 </h3>
 <div className="mt-2 overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 FILE NAME
 </th>
 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 DATE
 </th>
 <th scope="col" className="relative px-6 py-3">
 <span className="sr-only">Open</span>
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {userProfile?.uploadHistory.map(historyItem => (
 <tr key={historyItem.fileId._id}>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 {historyItem.fileId.filename}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
 {new Date(historyItem.fileId.uploadDate).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <button
 onClick={() => handleOpenChart(historyItem.fileId._id)}
 className="text-indigo-600 hover:text-indigo-900"
 >
 Open chart
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {activeSection === 'integration' && (
 <div className="bg-white shadow-md rounded-lg overflow-hidden">
 <div className="px-6 py-5 border-b border-gray-200">
 <h3 className="text-md font-semibold text-gray-800 mb-4">
 AI Insights
 </h3>
 <p className="mt-1 text-sm text-gray-500">
 Generate AI-powered insights from the uploaded data.
 </p>
 {uploadedData ? (
 <button
 onClick={handleGenerateInsights}
 className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-ring-2 focus-ring-offset-2 focus-ring-indigo-500"
 >
 Generate Insights
 </button>
 ) : (
 <p className="mt-2 text-sm text-gray-500">Please upload an Excel file to generate insights.</p>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default UserDashboard;
