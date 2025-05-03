import multer from 'multer';
import path from 'path';
import XLSX from 'xlsx';
import Upload from '../models/Upload.js';
import User from '../models/userModel.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Create an 'uploads' folder in the backend
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// @desc    Upload an Excel file and process data
// @route   POST /api/upload
// @access  Private
const uploadFile = async (req, res) => {
  upload.single('excelFile')(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload error', error: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file' });
    }

    try {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const newUpload = await Upload.create({
        userId: req.user._id,
        filename: req.file.originalname,
        filePath: req.file.path,
        dataSize: req.file.size,
      });

      await User.findByIdAndUpdate(req.user._id, {
        $push: { uploadHistory: { fileId: newUpload._id } },
      });

      res.status(200).json({ message: 'File uploaded and processed successfully', data: jsonData, fileId: newUpload._id });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ message: 'Error processing Excel file' });
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
    res.status(500).json({ message: 'Error analyzing data' });
  }
};

export { uploadFile, analyzeData, upload }; // Export upload middleware