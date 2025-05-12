import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('excelFile', file);

    const token = localStorage.getItem('token');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const uploadUrl = `${apiUrl}/api/version1/upload`; // Construct the full API endpoint

      const res = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
      const data = await res.json();
      setUploadSuccess('File uploaded successfully!');
      // setUploadError('');
      setUploadId(data.uploadId);
      setFileHeaders(data.headers);
    } else {
      setError(errorData.message || 'File upload failed.');
      console.error('File upload failed on server:', errorData);
    }
      setUploading(false);
      onUploadSuccess(res.data); // Pass the response data to your chart component
      setFile(null); // Clear the selected file

    } catch (err) {
      setUploading(false);
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'File upload failed');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="ml-24 mb-6">
      <input type="file" accept=".xlsx, .xls" className='text-blue-500 text-sm hover:text-blue-600 cursor-pointer' onChange={handleFileChange} />
      </div>
      <button onClick={handleFileUpload} 
      className={`bg-red-500 cursor-pointer hover:bg-red-400 text-white flex justify-center items-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={uploading || !file}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUpload;