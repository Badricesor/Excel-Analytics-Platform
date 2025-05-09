import fs from 'node:fs/promises';
import multer from 'multer';
import path from 'path';
import XLSX from 'xlsx';
import Upload from '../models/Upload.js';
import User from '../models/userModel.js';


// Configure multer for file uploads
// Configure multer for file upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists and has write permissions
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Handle file size and type restrictions if needed
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(null, false); // Reject unsupported file types
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Example: 10MB limit
});

export const uploadFile = upload.single('excelFile'); // Export the middleware

export const uploadController = async (req, res) => {
  console.log('*** uploadController invoked ***');

  uploadFile(req, res, async (err) => { // Call the middleware
    if (err) {
      console.error('Multer error during upload:', err);
      return res.status(500).json({ message: 'File upload failed due to server error.', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' });
    }

    console.log('File uploaded successfully (middleware):', req.file);

    try {
      console.log('*** Starting file processing ***');
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!jsonData || jsonData.length === 0) {
        return res.status(400).json({ message: 'No data found in the Excel file.' });
      }

      const headers = Object.keys(jsonData[0] || {});
      if (!headers.includes('item') || !headers.includes('xaxis')) {
        return res.status(400).json({ message: 'Selected sheet does not have the data in the required format (missing "item" or "xaxis" columns).' });
      }

      console.log('req.file in uploadController:', req.file);
      const upload = await Upload.create({
        userId: req.user._id,
        filename: req.file.originalname,
        filepath: req.file.path,
        filesize: req.file.size,
      });

      console.log('**** File processing completed successfully ****');
      res.status(200).json({ message: 'File uploaded and processed successfully', data: jsonData, uploadId: upload._id });

    } catch (error) {
      console.error('Error processing excel file:', error);
      // Optionally delete the uploaded file if processing fails
      // fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Error processing excel file', error: error.message });
    }
  });
};


// @desc    Analyze data and generate chart data
// @route   POST /api/analyze/:uploadId
// @access  Private
const analyzeData = async (req, res) => {
  const { uploadId } = req.params;
  const { xAxis, yAxis, chartType } = req.body;

  try {
    const upload = await Upload.findById(uploadId);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    if (upload.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to analyze this file' });
    }

    const workbook = XLSX.readFile(upload.filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ message: 'No data found in the Excel file' });
    }

    if (!jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
      return res.status(400).json({ message: 'Selected axes not found in the data' });
    }

    let chartData = {
      labels: jsonData.map((item) => item[xAxis]),
      datasets: [
        {
          label: yAxis,
          data: jsonData.map((item) => item[yAxis]),
          // Add more styling options based on chartType
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };

    // Optionally save analysis details to user history
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        'uploadHistory.$[elem].analysisDetails': {
          xAxis,
          yAxis,
          chartType,
          timestamp: new Date(),
        },
      },
    }, {
      arrayFilters: [{ 'elem.fileId': uploadId }],
    });

    res.status(200).json({ chartData, chartType });
  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ message: 'Error analyzing data', error: error.message });
  }
};

export { analyzeData, upload }; // Export upload middleware