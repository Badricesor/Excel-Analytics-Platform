// In backend/controllers/uploadController.js

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
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { User, Upload } from '../models/index.js'; // Assuming your Upload model path
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a persistent storage directory for Excel files
// Note: This directory will still be used by `uploadFile` to temporarily save the Excel,
// but `analyzeData` and `generateAllCharts` will read data from MongoDB instead of file system.
const EXCEL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'excel');
await fs.mkdir(EXCEL_UPLOAD_DIR, { recursive: true }).catch(console.error);


// Function to generate chart configuration based on chart type
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
    const baseConfig = {
        data: {
            labels: labels,
            datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    title: { display: true, text: xAxis }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true,
                    title: { display: true, text: yAxis }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        },
    };

    switch (chartType) {
        case 'bar':
            return { ...baseConfig, type: 'bar' };
        case 'line':
            return { ...baseConfig, type: 'line', data: { ...baseConfig.data, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(75, 192, 192, 0.8)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: false }] } };
        case 'pie':
        case 'doughnut':
            return {
                type: chartType,
                data: {
                    labels,
                    datasets: [{
                        label: `${yAxis} Distribution`,
                        data: dataValues,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed) {
                                        label += context.parsed;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            };
        case 'radar':
            return {
                ...baseConfig,
                type: 'radar',
                data: {
                    labels,
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
                    }]
                },
                options: {
                    ...baseConfig.options,
                    scales: {
                        r: {
                            angleLines: { display: true },
                            suggestedMin: 0,
                            suggestedMax: Math.max(...dataValues) * 1.2
                        }
                    }
                }
            };
        case 'bubble':
            return {
                ...baseConfig,
                type: 'bubble',
                data: {
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        data: jsonData.map(item => ({ x: item[xAxis], y: item[yAxis], r: 10 })),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 0
                    }]
                },
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: { type: 'linear', position: 'bottom', title: { display: true, text: xAxis } },
                        y: { type: 'linear', position: 'left', title: { display: true, text: yAxis } }
                    }
                }
            };
        case 'scatter':
            return {
                ...baseConfig,
                type: 'scatter',
                data: {
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        data: jsonData.map(item => ({ x: item[xAxis], y: item[yAxis] })),
                        backgroundColor: 'rgba(255, 159, 64, 0.8)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                    }]
                },
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: { type: 'linear', position: 'linear', title: { display: true, text: xAxis } }, // Changed to linear scale
                        y: { type: 'linear', position: 'linear', title: { display: true, text: yAxis } }  // Changed to linear scale
                    }
                }
            };
        case 'area':
            return { ...baseConfig, type: 'line', data: { ...baseConfig.data, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(26, 188, 156, 0.8)', backgroundColor: 'rgba(26, 188, 156, 0.4)', fill: true }] } };
        default:
            return { ...baseConfig, type: 'bar' };
    }
};

// Configure multer storage to save initially to /tmp
const storage = multer.diskStorage({
    destination: '/tmp', // Multer will save to /tmp first
    filename: (req, file, cb) => {
        cb(null, `excelFile-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only Excel files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });


// --- `uploadFile` Function (No significant changes from last time, already good for headers) ---
export const uploadFile = async (req, res) => {
    upload.single('excelFile')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error during file upload:', err);
            return res.status(400).json({ message: `Multer error: ${err.message}` });
        } else if (err) {
            console.error('Unknown error during file upload:', err);
            return res.status(500).json({ message: 'Error uploading file.', error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please select an Excel file.' });
        }

        const originalname = req.file.originalname;
        const tempFilePath = req.file.path; // Multer's temporary file path

        const uniqueId = uuidv4();
        const persistentFileName = `excel-${uniqueId}${path.extname(originalname)}`;
        const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFileName);

        try {
            await fs.copyFile(tempFilePath, persistentFilePath);

            const workbook = XLSX.readFile(persistentFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const raw_data_with_headers = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            if (!raw_data_with_headers || raw_data_with_headers.length === 0) {
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'No data found in the Excel file.' });
            }

            const headers = raw_data_with_headers[0];

            if (!Array.isArray(headers) || headers.length === 0 || headers.some(h => typeof h !== 'string' || h.trim() === '')) {
                 await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'Invalid or missing headers in the Excel file. Ensure the first row contains valid column names.' });
            }

            const cleanedHeaders = headers.filter(h => h !== undefined && h !== null).map(String).map(h => h.trim());
            const finalHeaders = cleanedHeaders.filter(h => h !== '');

            if (finalHeaders.length === 0) {
                 await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'No valid column headers found after cleaning. Please ensure the first row has proper names.' });
            }

            const dataRows = raw_data_with_headers.slice(1);

            const jsonDataObjects = dataRows.map(row => {
                const obj = {};
                finalHeaders.forEach((header, index) => {
                    obj[header] = row[index] ?? '';
                });
                return obj;
            });

            const userId = req.user._id;

            const uploadRecord = new Upload({
                filename: originalname,
                filePath: persistentFilePath, // Storing the file path for potential future use (e.g. download)
                uploadDate: new Date(),
                data: jsonDataObjects, // Store the parsed JSON data directly in DB
                userId: userId,
            });

            const savedUpload = await uploadRecord.save();

            await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));

            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonDataObjects,
                uploadId: savedUpload._id,
                headers: finalHeaders,
                filePath: persistentFilePath // Send the path back (optional, but consistent)
            });

        } catch (error) {
            console.error('Error processing uploaded file:', error);
            if (fs.access(tempFilePath).then(() => true).catch(() => false)) {
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
            }
            if (persistentFilePath && fs.access(persistentFilePath).then(() => true).catch(() => false)) {
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
            }
            res.status(500).json({ message: 'Error processing uploaded file.', error: error.message });
        }
    });
};


// --- UPDATED `analyzeData` FUNCTION (Returns Base64 image) ---
export const analyzeData = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis, chartType } = req.body;

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // Use the 'data' stored in the upload record, NOT from file system
        const jsonData = uploadRecord.data;

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({ message: 'No data found in the uploaded file for analysis.' });
        }
        if (!jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            return res.status(400).json({ message: `Selected columns '${xAxis}' or '${yAxis}' missing in the uploaded file.` });
        }


        const labels = jsonData.map(item => String(item[xAxis]) || '');
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0);

        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
        const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

        // Convert image buffer to Base64 data URL
        const chartDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

        // Return the Base64 data URL directly
        res.status(200).json({ chartData: {}, chartType, chartUrl: chartDataUrl }); // Send data URL instead of file path

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: 'Error analyzing data.', error: error.message });
    }
};

// --- UPDATED `generateAllCharts` FUNCTION (Returns Base64 images) ---
export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartDetails = [];

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // Use the 'data' stored in the upload record, NOT from file system
        const jsonData = uploadRecord.data;

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({ message: 'No data found in the uploaded file for generating charts.' });
        }
        if (!jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
             return res.status(400).json({ message: `Selected columns '${xAxis}' or '${yAxis}' missing in the uploaded file for generating charts.` });
        }

        const labels = jsonData.map(item => String(item[xAxis]) || '');
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0);

        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        for (const chartType of chartTypes) {
            try {
                const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
                const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
                // Convert image buffer to Base64 data URL
                const chartDataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;

                generatedChartDetails.push({ url: chartDataUrl, type: chartType }); // Send data URL instead of file path
                console.log(`Generated chart: ${chartType}, Base64 URL length: ${chartDataUrl.length}`);
            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart:`, renderError);
            }
        }

        console.log('Final generatedChartDetails (Base64 URLs):', generatedChartDetails.map(d => d.type)); // Log types only for brevity
        res.status(200).json({ message: 'All charts generated successfully.', chartDetails: generatedChartDetails });

    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error: error.message });
    }
};


// --- `getUploadHistory` Function (already good) ---
export const getUploadHistory = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('Error: User not authenticated or user ID missing in request.');
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }
        const userId = req.user._id;
        console.log(`Workspaceing upload history for userId: ${userId}`);
        const uploadHistory = await Upload.find({ userId }).sort({ uploadDate: -1 });
        console.log(`Found ${uploadHistory.length} upload records for user ${userId}`);
        res.status(200).json(uploadHistory);
    } catch (error) {
        console.error('Error fetching upload history:', error);
        res.status(500).json({ message: 'Failed to fetch upload history.', error: error.message });
    }
};

// --- `deleteUpload` Function (Good, keeps physical file deletion optional) ---
export const deleteUpload = async (req, res) => {
    const { id } = req.params;
    try {
        const upload = await Upload.findByIdAndDelete(id);
        if (!upload) {
            return res.status(404).json({ message: 'Upload history not found.' });
        }
        // Optionally, delete the physical Excel file from the server
        if (upload.filePath) {
            await fs.unlink(upload.filePath).catch(e => console.error("Error deleting physical file:", e));
        }
        res.status(200).json({ message: 'Upload history deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};