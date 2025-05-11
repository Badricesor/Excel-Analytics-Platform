import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {  Chart,  LineController,  BarController,  PieController,  DoughnutController,  RadarController,  BubbleController,  ScatterController,CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,RadialLinearScale,Title,Legend,Tooltip,} from 'chart.js';
Chart.register(LineController,BarController,PieController,DoughnutController,RadarController,BubbleController,ScatterController,CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,RadialLinearScale,Title,Legend,Tooltip);
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import os from 'os';
import XLSX from 'xlsx';
import { User, Upload } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const width = 400; // Width of the chart image
const height = 300; // Height of the chart image
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

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
  console.log('Received file upload request...');

  upload.single('excelFile')(req, res, async (err) => {
    console.log('After multer middleware');
    console.log('req.file:', req.file);
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'Error uploading file.', error: err });
    }
    if (!req.file) {
      console.log('No file uploaded.');
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path; // Get the temporary file path
    const originalName = req.file.originalname;
    console.log('File path:', filePath);
    console.log('Original name:', originalName);

    try {
      console.log('Attempting to read workbook...')
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      console.log('Sheet name:', sheetName);
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      console.log('JSON data:', jsonData);

      const userId = req.user._id;

      const uploadRecord = new Upload({
        filename: originalName,
        filePath: filePath, // Store the temporary file path in the database
        uploadDate: new Date(),
        data: jsonData, // You might also store processed data if needed
        userId: userId,
      });

      console.log('Creating upload record:', uploadRecord);
      const savedUpload = await uploadRecord.save();
      console.log('Upload record saved:', savedUpload);
      res.status(200).json({
        message: 'File uploaded and processed successfully',
        data: jsonData,
        uploadId: savedUpload._id,
        headers: Object.keys(jsonData[0] || {}),
      });
      console.log('Upload successful response sent.');

    } catch (error) {
      console.error('Error processing uploaded file:', error);
      res.status(500).json({ message: 'Error processing uploaded file.', error });
      console.log('Error response sent.');
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
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
      // const canvasRenderService = new CanvasRenderService(600, 400);
      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
      const imageName = `bar_chart_${uploadId}.png`;
      const imagePath = path.join(__dirname, '../../uploads', imageName); // Adjust path as needed
      await fs.writeFile(imagePath, imageBuffer);
      chartUrl = `/uploads/${imageName}`; // Serve this static URL
    }
    // ... add similar logic for other chart types ...
    res.status(200).json({ chartData: {}, chartType, chartUrl });
    // res.status(200).json({ chartData, chartType, chartUrl });

  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ message: 'Error analyzing data.', error });
  }
};