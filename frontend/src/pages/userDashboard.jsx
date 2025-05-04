import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext.jsx';
// import FileUpload from '../components/FileUpload.jsx';
import AnalysisForm from '../components/AnalysisForm.jsx';
import ChartDisplay from '../components/ChartDisplay.jsx';
import useAuth from '../hooks/useAuth.js';
import useFileUpload from '../hooks/useFileUpload.js';
import useAnalysis from '../hooks/useAnalysis.js';

const UserDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const { user, logout, loading: authLoading } = useAuth();
  const {
    uploadFile,
    handleFileChange: handleFileUploadChange,
    uploading: fileUploading,
    error: fileUploadError,
  } = useFileUpload((data, fileId) => {
    setUploadedData(data);
    setSelectedFileId(fileId);
  });
  const {
    analysisResult,
    analyzeData,
    analyzing: isAnalyzing,
    analysisError,
  } = useAnalysis(selectedFileId);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user) {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserProfile(res.data);
        } else if (!authLoading && !token) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        logout();
        navigate('/login');
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [navigate, logout, user, authLoading]);

  const handleAnalysisSubmit = (xAxis, yAxis, chartType) => {
    analyzeData(xAxis, yAxis, chartType);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading || !userProfile) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Welcome, {userProfile.username}!</h2>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Upload Excel File</h3>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUploadChange} className="mb-2" />
        <button
          onClick={uploadFile}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${fileUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={fileUploading}
        >
          {fileUploading ? 'Uploading...' : 'Upload'}
        </button>
        {fileUploadError && <p className="text-red-500 mt-2">{fileUploadError}</p>}
      </div>

      {uploadedData && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Analyze Data</h3>
          <AnalysisForm headers={Object.keys(uploadedData[0] || {})} onAnalyze={handleAnalysisSubmit} />
          {analysisError && <p className="text-red-500 mt-2">{analysisError}</p>}
          {isAnalyzing && <p className="text-gray-500 mt-2">Analyzing...</p>}
        </div>
      )}

      {analysisResult && analysisResult.chartData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Generated Chart</h3>
          <ChartDisplay chartData={analysisResult.chartData} chartType={analysisResult.chartType} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mt-6 mb-2">Upload History</h3>
        {userProfile.uploadHistory.length === 0 ? (
          <p>No uploads yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {userProfile.uploadHistory.map((historyItem) => (
              <li key={historyItem.fileId._id} className="mb-2">
                {historyItem.fileId.filename} (Uploaded on: {new Date(historyItem.fileId.uploadDate).toLocaleDateString()})
                {historyItem.analysisDetails && historyItem.analysisDetails.length > 0 && (
                  <ul className="list-inside list-disc pl-5 mt-1">
                    {historyItem.analysisDetails.map((analysis, index) => (
                      <li key={index}>
                        Analyzed: X-axis: {analysis.xAxis}, Y-axis: {analysis.yAxis}, Chart Type: {analysis.chartType} ({new Date(analysis.timestamp).toLocaleTimeString()})
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;