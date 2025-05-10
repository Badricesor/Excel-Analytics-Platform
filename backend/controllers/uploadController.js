import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {
  Chart,
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  BubbleController,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Legend,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  BarController,
  PieController,
  DoughnutController,
  RadarController,
  BubbleController,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Legend,
  Tooltip
);
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import os from 'os';
import xlsx from 'xlsx';
// import mongoose from 'mongoose';
// import UserSchema from './UserModel.js';
// import UploadSchema from './UploadModel.js';
import { User, Upload } from '../models/index.js';
// import User from '../models/UserModel.js';
// import Upload from '../models/Upload.js'; // Adjust the path to your Upload model
// import { v4 as uuidv4 } from 'uuid';

const width = 400; // Width of the chart image
const height = 300; // Height of the chart image
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// Configure multer for file uploads to the OS temporary directory
const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(null, false); // Reject unsupported file types
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadFile = (req, res) => {
  upload.single('excelFile')(req, res, async (err) => {
    if (err) {
      console.error('Multer error during upload:', err);
      return res.status(500).json({ message: 'File upload failed due to server error.', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' });
    }

    const { originalname, path: filePath, size } = req.file;

    const uploadData = new Upload({
      userId: req.user.id, // Assuming you have user authentication middleware
      filename: originalname,
      filePath: filePath,
      fileSize: size,
    });

    try {
      const savedUpload = await uploadData.save();
      console.log('File uploaded successfully (ID):', savedUpload._id, 'Path:', filePath);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const headers = Object.keys(jsonData[0] || {});

      res.status(200).json({ message: 'File uploaded and processed successfully', data: jsonData, uploadId: savedUpload._id, headers });
    } catch (error) {
      console.error('Error saving upload details:', error);
      await fs.unlink(filePath); // Clean up the temporary file
      res.status(500).json({ message: 'Error saving upload details', error: error.message });
    }
  });
};

export const analyzeData = async (req, res) => {
  const { uploadId } = req.params;
  const { xAxis, yAxis, chartType } = req.body;

    // Optionally save analysis details to user history
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        analysisHistory: {
          uploadId: uploadId,
          xAxis: xAxis,
          yAxis: yAxis,
          chartType: chartType,
          timestamp: new Date(),
        },
      },
    });

    try {
      const upload = await Upload.findById(uploadId);
      if (!upload) {
        return res.status(404).json({ message: 'Upload not found.' });
      }
  
      const filePath = upload.filePath;
      console.log('Analyzing file at path:', filePath, 'for chart type:', chartType);
  
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      let chartData = {};
      let chartUrl = '';
  
      if (chartType === 'bar') {
        const configuration = {
          type: 'bar',
          data: {
            labels: jsonData.map(item => item[xAxis]),
            datasets: [{ label: yAxis, data: jsonData.map(item => item[yAxis]), backgroundColor: 'rgba(54, 162, 235, 0.6)' }],
          },
        };
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        const imageName = `bar_chart_${uploadId}.png`;
        const imagePath = path.join(__dirname, '../uploads', imageName); // Create an 'uploads' folder in your backend
        await fs.writeFile(imagePath, imageBuffer);
        chartUrl = `/uploads/${imageName}`; // Serve this static URL
      }
      // ... add similar logic for other chart types ...
  
      res.status(200).json({ chartData, chartType, chartUrl });
  
    } catch (error) {
      console.error('Error analyzing data for', chartType, ':', error);
      res.status(500).json({ message: `Error analyzing data for ${chartType}`, error: error.message });
    }
  };