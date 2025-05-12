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


// Function to generate chart configuration based on chart type
// Helper function for chart configuration (remains the same)
const getChartConfiguration = (chartType, labels, dataValues, xAxisLabel, yAxisLabel) => {
    switch (chartType) {
        case 'bar':
        case 'line':
        default:
            return {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${yAxisLabel} vs ${xAxisLabel}`,
                        data: dataValues,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)',
                            'rgba(255, 0, 0, 0.6)',
                            'rgba(0, 255, 0, 0.6)',
                            'rgba(0, 0, 255, 0.6)',
                            'rgba(192, 192, 192, 0.6)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 0, 0, 1)',
                            'rgba(0, 255, 0, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(192, 192, 192, 1)'
                        ],
                        borderWidth: 1,
                        fill: chartType === 'line' ? false : true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${yAxisLabel} vs ${xAxisLabel} (${chartType.toUpperCase()} Chart)`,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: yAxisLabel,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: xAxisLabel,
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            };

        case 'pie':
        case 'doughnut':
            return {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: yAxisLabel,
                        data: dataValues,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(255, 0, 0, 0.8)',
                            'rgba(0, 255, 0, 0.8)',
                            'rgba(0, 0, 255, 0.8)',
                            'rgba(192, 192, 192, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 0, 0, 1)',
                            'rgba(0, 255, 0, 1)',
                            'rgba(0, 0, 255, 1)',
                            'rgba(192, 192, 192, 1)'
                        ],
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${yAxisLabel} Distribution (${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart)`,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }
                }
            };

        case 'radar':
            return {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${yAxisLabel} vs ${xAxisLabel}`,
                        data: dataValues,
                        backgroundColor: 'rgba(179, 157, 219, 0.2)',
                        borderColor: 'rgba(179, 157, 219, 1)',
                        pointBackgroundColor: 'rgba(179, 157, 219, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179, 157, 219, 1)',
                        fill: true
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${yAxisLabel} vs ${xAxisLabel} (Radar Chart)`,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        r: {
                            angleLines: {
                                display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: dataValues && dataValues.length > 0 ? Math.max(...dataValues) * 1.1 : 10, // Provide a default max
                        }
                    }
                }
            };


        case 'bubble':
            return {
                type: 'bubble',
                data: {
                    datasets: [{
                        label: `${yAxisLabel} vs ${xAxisLabel}`,
                        data: data.map(row => ({
                            x: row[headers.indexOf(xAxisLabel)],
                            y: row[headers.indexOf(yAxisLabel)],
                            r: 10, // You might need a column for radius
                        })),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${yAxisLabel} vs ${xAxisLabel} (Bubble Chart)`,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: xAxisLabel,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: yAxisLabel,
                                font: {
                                    size: 14
                                }
                            },
                            beginAtZero: true
                        }
                    }
                }
            };


        case 'scatter':
            return {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: `${yAxisLabel} vs ${xAxisLabel}`,
                        data: data.map(row => ({
                            x: row[headers.indexOf(xAxisLabel)],
                            y: row[headers.indexOf(yAxisLabel)],
                        })),
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        pointRadius: 5,
                        pointHoverRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `${yAxisLabel} vs ${xAxisLabel} (Scatter Chart)`,
                            font: {
                                size: 16
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: {
                                display: true,
                                text: xAxisLabel,
                                font: {
                                    size: 14
                                }
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: yAxisLabel,
                                font: {
                                    size: 14
                                }
                            },
                            beginAtZero: true
                        }
                    }
                }
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
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('jsonData:', jsonData); // Add this
    console.log('xAxis:', xAxis, 'yAxis:', yAxis); //and this

    // const labels = jsonData.map(item => item[xAxis]);
    // const dataValues = jsonData.map(item => item[yAxis] || 0);

    // Manually extract headers
    let headers = [];
    if (sheet && sheet['!ref']) {  // Ensure sheet and ref exist
        const range = XLSX.utils.decode_range(sheet['!ref']);
        if (range.s.r === 0) { // Check if the first row is the header row
            headers = [];
            for (let c = range.s.c; c <= range.e.c; ++c) {
                const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: c })];
                if (cell && cell.v) {
                    headers.push(cell.v);  // Get the cell value as header
                } else {
                   headers.push(`Column${c}`); //make up a name
                }
            }
        }
    }
    console.log('Headers from Excel:', headers);

    if (!jsonData || jsonData.length === 0) {
      console.error('Error: jsonData is empty or undefined.');
      return res.status(400).json({ message: 'No data found in the uploaded file.' });
    }

    let labels = [];
        let dataValues = [];

        if(headers && headers.length > 0){
          labels = jsonData.slice(1).map(row => row[headers.indexOf(xAxis)] || '');
          dataValues = jsonData.slice(1).map(row => row[headers.indexOf(yAxis)] || 0);
     }
     else{
          console.error('Headers are empty')
          return res.status(400).json({message: 'No headers found in excel file'})
     }

    console.log('Extracted Labels:', labels);  //and this
    console.log('Extracted Data Values:', dataValues);//and this

    // const chartData = {};
    let chartUrl = '';
    const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
   
      const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis,  jsonData);
      console.log('Chart Configuration:', JSON.stringify(configuration, null, 2));
      // const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
      const imageName = `${chartType}_chart_${uploadId}.png`;
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

export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter'];
    const generatedChartUrls = [];

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        const filePath = uploadRecord.filePath;
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = jsonData[0] || [];
        const data = jsonData.slice(1);

        // Error handling for empty headers or data
        if (!headers || headers.length === 0) {
            return res.status(400).json({ message: 'No headers found in the Excel file.' });
        }
        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'No data found in the Excel file.' });
        }

        // Validate xAxis and yAxis
        if (!headers.includes(xAxis)) {
            return res.status(400).json({ message: `X-axis column "${xAxis}" not found in headers.` });
        }
        if (!headers.includes(yAxis)) {
            return res.status(400).json({ message: `Y-axis column "${yAxis}" not found in headers.` });
        }


        const labels = data.map(row => row[headers.indexOf(xAxis)]);
        const dataValues = data.map(row => row[headers.indexOf(yAxis)]);

        const width = 400;
        const height = 300;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        for (const chartType of chartTypes) {
            try {
                const chartConfiguration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis);
                const imageBuffer = await chartJSNodeCanvas.renderToBuffer(chartConfiguration);
                const imageName = `${chartType}_chart_${uploadId}.png`;
                const imagePath = join(process.cwd(), 'uploads', imageName);
                await fs.writeFile(imagePath, imageBuffer);
                const chartUrl = `/uploads/${imageName}`;
                generatedChartUrls.push(chartUrl);
            } catch (chartError) {
                console.error(`Error generating ${chartType} chart:`, chartError);
                // Consider handling this error more gracefully, e.g., skip this chart
                // and continue with the others, or send a partial response.
            }
        }

        res.status(200).json({ message: 'All charts generated successfully', chartUrls: generatedChartUrls });
    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error });
    }
};
