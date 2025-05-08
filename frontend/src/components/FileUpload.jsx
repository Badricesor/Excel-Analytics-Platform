import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const token = localStorage.getItem('token');
      // const apiUrl = import.meta.env.VITE_API_URL;
      const uploadUrl = 'https://excel-analytics-platform.onrender.com/api/version1/upload'; // Assuming your upload route is directly under /api/v1

      console.log('Sending Token on Upload:', token); 
      const res = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess(res.data.data, res.data.fileId);
      setUploading(false);
      setFile(null); // Clear the selected file
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'File upload failed');
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="mb-2" /><br></br>
      <button
        onClick={handleSubmit}
        className={`bg-red-500 hover:bg-red-400 text-white  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;