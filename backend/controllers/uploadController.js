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


// Configure multer storage (using the /tmp directory as shown in your screenshot)
const storage = multer.diskStorage({
  destination: '/tmp',
  filename: (req, file, cb) => {
    cb(null, `excelFile-${Date.now()}${path.extname(file.originalname)}`);
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

export const uploadFile = async (req, res) => {
   console.log('Inside uploadFile function');
  upload.single('file')(req, res, async (err) => {
    console.log('After multer middleware');
    if (err) {
      return res.status(500).json({ message: 'Error uploading file.', error: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path; // Get the temporary file path
    const originalName = req.file.originalname;

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const uploadRecord = new Upload({
        filename: originalName,
        filePath: filePath, // Store the temporary file path in the database
        uploadDate: new Date(),
        data: jsonData, // You might also store processed data if needed
      });

      const savedUpload = await uploadRecord.save();

      res.status(200).json({
        message: 'File uploaded and processed successfully',
        data: jsonData,
        uploadId: savedUpload._id,
        headers: Object.keys(jsonData[0] || {}),
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      res.status(500).json({ message: 'Error processing uploaded file.', error });
    }
  });
};

export const analyzeData = async (req, res) => {
  const { uploadId } = req.params;
  const { xAxis, yAxis, chartType } = req.body;

  try {
    const uploadRecord = await Upload.findById(uploadId);
    if (!uploadRecord) {
      return res.status(404).json({ message: 'Upload record not found.' });
    }

    const filePath = uploadRecord.filePath; // Retrieve the stored file path

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const labels = jsonData.map(item => item[xAxis]);
    const dataValues = jsonData.map(item => item[yAxis]);

    const chartData = {};
    let chartUrl = '';

    if (chartType === 'bar') {
      const configuration = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: `${yAxis} vs ${xAxis}`,
            data: dataValues,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
          }],
        },
      };
      const canvasRenderService = new CanvasRenderService(600, 400);
      const imageBuffer = await canvasRenderService.renderToBuffer(configuration);
      const imageName = `bar_chart_${uploadId}.png`;
      const imagePath = path.join(__dirname, '../../uploads', imageName); // Adjust path as needed
      await fs.writeFile(imagePath, imageBuffer);
      chartUrl = `/uploads/${imageName}`; // Serve this static URL
    }
    // ... add similar logic for other chart types ...

    res.status(200).json({ chartData, chartType, chartUrl });

  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ message: 'Error analyzing data.', error });
  }
};