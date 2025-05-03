import { useState } from 'react';
import axios from 'axios';

const useAnalysis = (selectedFileId) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeData = async (xAxis, yAxis, chartType) => {
    if (!selectedFileId) {
      setAnalysisError('Please upload a file first.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `/api/upload/analyze/${selectedFileId}`,
        { xAxis, yAxis, chartType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysisResult(res.data);
      setAnalyzing(false);
    } catch (err) {
      console.error('Error during analysis:', err);
      setAnalysisError(err.response?.data?.message || 'Error during analysis');
      setAnalyzing(false);
    }
  };

  return {
    analysisResult,
    analysisError,
    analyzing,
    analyzeData,
  };
};

export default useAnalysis;