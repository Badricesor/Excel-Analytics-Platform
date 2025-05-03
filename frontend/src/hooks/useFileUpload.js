import { useState } from 'react';
import axios from 'axios';

const useFileUpload = (onUploadSuccess) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
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
      const res = await axios.post('/api/upload', formData, {
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

  return {
    file,
    uploading,
    error,
    handleFileChange,
    uploadFile,
  };
};

export default useFileUpload;