import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import {  Chart,  LineController,  BarController,  PieController,  DoughnutController,  RadarController,  BubbleController,  ScatterController,CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,RadialLinearScale,Title,Legend,Tooltip,} from 'chart.js';
Chart.register(LineController,BarController,PieController,DoughnutController,RadarController,BubbleController,ScatterController,CategoryScale,LinearScale,PointElement,LineElement,BarElement,ArcElement,RadialLinearScale,Title,Legend,Tooltip);
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
// import os from 'os';
import XLSX from 'xlsx';
import { User, Upload } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const width = 400; // Width of the chart image
const height = 300; // Height of the chart image
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });


// Function to generate chart configuration based on chart type
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
  
  console.log(`Generating chart of type: ${chartType}`);  // Keep this
  console.log('Labels:', labels);
  console.log('Data Values:', dataValues);
  console.log('jsonData', jsonData);

  const baseConfig = {
    data: {
      labels: labels,
      datasets: [{
        label: `${yAxis} vs ${xAxis}`,
        data: dataValues,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Add more common options here as needed
    },
  };


   // Add this check at the beginning of the function
   if (!jsonData || jsonData.length === 0) {
    return {
        type: chartType,
        data: { labels: [], datasets: [] }, // Return empty data
        options: { responsive: true, maintainAspectRatio: false },
    };
}


  switch (chartType) {
    case 'bar':
      return {
        ...baseConfig,
        type: 'bar',
        data: {
          ...baseConfig.data,
          datasets: [{
            ...baseConfig.data.datasets[0],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
          }],
        },
      };
    case 'line':
      return {
        ...baseConfig,
        type: 'line',
        data: {
          ...baseConfig.data,
          datasets: [{
            ...baseConfig.data.datasets[0],
            borderColor: 'rgba(75, 192, 192, 0.8)',
            fill: false,
          }],
        },
      };
    case 'pie':
      return {
        ...baseConfig,
        type: 'pie',
        data: {
          ...baseConfig.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
        },
      };
      case 'doughnut':
        return {
          ...baseConfig,
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              ...baseConfig.data.datasets[0],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 206, 86, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(153, 102, 255, 0.8)',
              ],
          }],
          },
        };
    case 'radar':
      console.log("Radar jsonData:", jsonData);
      console.log("Radar xAxis:", xAxis, "Radar yAxis:", yAxis);
        return {
            ...baseConfig,
            type: 'radar',
            data: {
                // ...baseConfig.data,
                labels: labels, // Radar uses labels
                datasets: [{
                  label: `${yAxis} vs ${xAxis}`,
                  data: dataValues,  //and dataValues
                  backgroundColor: 'rgba(153, 102, 255, 0.2)',
                  borderColor: 'rgba(153, 102, 255, 1)',
                  pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
              }],
            },
            options: {
                ...baseConfig.options,
                // специфичные опции для графика radar
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: Math.max(...dataValues)
                    }
                }
            }
        };
    case 'bubble':
      console.log("Bubble jsonData:", jsonData); 
      console.log("Bubble xAxis:", xAxis, "Bubble yAxis:", yAxis);
          return {
            ...baseConfig,
            type: 'bubble',
            data: {
              datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: jsonData.map(item => ({
                  x: item[xAxis],
                  y: item[yAxis],
                  r: 10, // You might need a column for radius
                })),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderWidth: 0,
              }],
            },
            options: {
              ...baseConfig.options,
              scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { type: 'linear', position: 'left' },
              },
            },
          };
    case 'scatter':
      console.log("Scatter jsonData:", jsonData); 
      console.log("Scatter xAxis:", xAxis, "Scatter yAxis:", yAxis);
          return {
            ...baseConfig,
            type: 'scatter',
            data: {
              datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: jsonData.map(item => ({
                  x: item[xAxis],
                  y: item[yAxis],
                })),
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
              }],
            },
            options: {
              ...baseConfig.options,
              scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { type: 'linear', position: 'left' },
              },
            },
          };
    default:
      return {
        ...baseConfig,
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            ...baseConfig.data.datasets[0],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
          }],
        },
      };
  }
};

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

    console.log('jsonData:', jsonData); // Add this
    console.log('xAxis:', xAxis, 'yAxis:', yAxis); //and this

    const labels = jsonData.map(item => item[xAxis]);
    const dataValues = jsonData.map(item => item[yAxis] || 0);

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ message: 'No data found in the uploaded file.' });
    }

    console.log('Extracted Labels:', labels);  //and this
    console.log('Extracted Data Values:', dataValues);//and this

    const firstRowKeys = Object.keys(jsonData[0]);
    if (!firstRowKeys.includes(xAxis) || !firstRowKeys.includes(yAxis)) {
      return res.status(400).json({ message: `Selected xAxis (${xAxis}) or yAxis (${yAxis}) not found in data. Available columns are: ${firstRowKeys.join(', ')}` });
    }

    const chartData = {};
    let chartUrl = '';

    // if (chartType === 'bar') {
      // const configuration = {
      //   chartType,
      //   data: {
      //     labels: labels,
      //     datasets: [{
      //       label: `${yAxis} vs ${xAxis}`,
      //       data: dataValues,
      //       backgroundColor: 'rgba(54, 162, 235, 0.8)',
      //     }],
      //   },
      // };
      const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis,);
      console.log('Chart Configuration:', JSON.stringify(configuration, null, 2));
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
      const imageName = `bar_chart_${uploadId}.png`;
      const imagePath = join(process.cwd(), 'uploads', imageName);
      await fs.writeFile(imagePath, imageBuffer);
      chartUrl = `/uploads/${imageName}`; // Serve this static URL
    // }
    
    // ... add similar logic for other chart types ...
    
    res.status(200).json({ chartData: {}, chartType, chartUrl });
    // res.status(200).json({ chartData, chartType, chartUrl });

  } catch (error) {
    console.error('Error analyzing data:', error);
    res.status(500).json({ message: 'Error analyzing data.', error });
  }
};