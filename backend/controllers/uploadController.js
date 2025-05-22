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
import fs from 'fs/promises'; // Keep fs/promises for async file operations
import multer from 'multer';
import path from 'path';
import XLSX from 'xlsx';
import { User, Upload } from '../models/index.js';
import { fileURLTo__filename } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the permanent upload directory relative to the current file
// Assuming this file is in a 'controllers' folder, and 'uploads' is in the root backend folder
const uploadDir = path.join(__dirname, '..', '..', 'uploads'); // Go up two directories to reach the root backend, then into 'uploads'

// Function to generate chart configuration (no change needed here)
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
    // ... (Your existing getChartConfiguration code) ...
    console.log(`Generating chart of type: ${chartType}`);
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
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: xAxis
                    }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxis
                    }
                }
            },
        },
    };

    switch (chartType) {
        case 'bar':
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
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: baseConfig.options.scales.x,
                        y: baseConfig.options.scales.y,
                    }
                }
            };
        case 'line':
            return {
                ...baseConfig,
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        borderColor: 'rgba(75, 192, 192, 0.8)',
                        fill: false,
                    }],
                },
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: baseConfig.options.scales.x,
                        y: baseConfig.options.scales.y,
                    }
                }
            };
        case 'pie':
        case 'doughnut':
            const pieDoughnutOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                },
            };
            return {
                ...baseConfig,
                type: chartType,
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
                options: pieDoughnutOptions,
            };
        case 'radar':
            console.log("Radar jsonData:", jsonData);
            console.log("Radar xAxis:", xAxis, "Radar yAxis:", yAxis);
            return {
                ...baseConfig,
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${yAxis} vs ${xAxis}`,
                        data: dataValues,
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
                    labels: labels,
                    datasets: [{
                        label: `${yAxis} vs ${xAxis}`,
                        data: jsonData.map(item => ({
                            x: item[xAxis],
                            y: item[yAxis],
                            r: 10, // You might need a column for radius, or calculate dynamically
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
                    labels: labels,
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
        case 'area':
            return {
                ...baseConfig,
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        borderColor: 'rgba(26, 188, 156, 0.8)',
                        backgroundColor: 'rgba(26, 188, 156, 0.4)',
                        fill: true,
                    }],
                },
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: baseConfig.options.scales.x,
                        y: baseConfig.options.scales.y,
                    }
                }
            };
        default:
            return {
                ...baseConfig,
                type: 'bar',
                options: {
                    ...baseConfig.options,
                    scales: {
                        x: baseConfig.options.scales.x,
                        y: baseConfig.options.scales.y,
                    }
                }
            };
    }
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Ensure the directory exists before saving the file
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            console.error('Error creating upload directory:', err);
            cb(err); // Pass error to Multer
        }
    },
    filename: (req, file, cb) => {
        cb(null, `excelFile-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only Excel files are allowed.'), false); // Pass error to Multer
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
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ message: `Multer error: ${err.message}`, error: err });
        } else if (err) {
            console.error('Unknown upload error:', err);
            return res.status(500).json({ message: 'Error uploading file.', error: err.message });
        }
        if (!req.file) {
            console.log('No file uploaded.');
            return res.status(400).json({ message: 'No file uploaded or unsupported file type.' });
        }

        const filePath = req.file.path; // Get the permanent file path
        const originalName = req.file.originalname;
        console.log('File path:', filePath);
        console.log('Original name:', originalName);

        try {
            console.log('Attempting to read workbook...');
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            console.log('Sheet name:', sheetName);
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('JSON data:', jsonData);

            const userId = req.user._id;

            const uploadRecord = new Upload({
                filename: originalName,
                filePath: filePath, // Store the permanent file path in the database
                uploadDate: new Date(),
                // You can still store jsonData here if you want faster access for small files
                // but for larger files, re-reading from disk is the purpose of Option 2.
                // data: jsonData, // Optional: for faster access if file size is small
                userId: userId,
            });

            console.log('Creating upload record:', uploadRecord);
            const savedUpload = await uploadRecord.save();
            console.log('Upload record saved:', savedUpload);
            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonData, // Send parsed data for immediate frontend use
                uploadId: savedUpload._id,
                headers: Object.keys(jsonData[0] || {}),
            });
            console.log('Upload successful response sent.');

        } catch (error) {
            console.error('Error processing uploaded file:', error);
            // If an error occurs during processing, consider deleting the partially uploaded file
            await fs.unlink(filePath).catch(e => console.error("Error deleting partial upload:", e));
            res.status(500).json({ message: 'Error processing uploaded file.', error });
            console.log('Error response sent.');
        }
        // IMPORTANT: NO `finally` block with `fs.unlink(filePath)` here.
        // The file is meant to persist in the `uploads` folder.
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

        const filePath = uploadRecord.filePath; // Retrieve the stored permanent file path
        console.log(`Attempting to read file from stored path: ${filePath}`);

        // Check if the file exists before trying to read it
        try {
            await fs.access(filePath); // Checks if file exists and is accessible
        } catch (accessError) {
            console.error(`File not found at path: ${filePath}`, accessError);
            return res.status(404).json({ message: 'Uploaded Excel file not found on server. It might have been deleted or moved.' });
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('jsonData:', jsonData);
        console.log('xAxis:', xAxis, 'yAxis:', yAxis);

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            console.error('Error: jsonData is empty, undefined, or missing selected columns.');
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file.' });
        }

        const labels = jsonData.map(item => item[xAxis]?.toString() || '');
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0);

        console.log('Extracted Labels:', labels);
        console.log('Extracted Data Values:', dataValues);

        let chartUrl = '';
        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
        console.log('Chart Configuration:', JSON.stringify(configuration, null, 2));
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        // Save chart images to the same 'uploads' folder for consistency
        const imageName = `${chartType}_chart_${uploadId}_single.png`;
        const imagePath = join(uploadDir, imageName); // Use the permanent upload directory
        await fs.writeFile(imagePath, imageBuffer);
        chartUrl = `/uploads/${imageName}`; // This URL must be served statically

        res.status(200).json({ chartData: {}, chartType, chartUrl });
        console.log('Chart analysis successful response sent.');

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: 'Error analyzing data.', error });
    }
};

export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartUrls = [];

    try {
        console.log(`Generating all charts for upload ID: ${uploadId}`);
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }
        console.log('Upload Record:', uploadRecord);
        const filePath = uploadRecord.filePath; // Retrieve the stored permanent file path
        console.log(`Attempting to read file from stored path: ${filePath}`);

        // Check if the file exists before trying to read it
        try {
            await fs.access(filePath);
        } catch (accessError) {
            console.error(`File not found at path: ${filePath}`, accessError);
            return res.status(404).json({ message: 'Uploaded Excel file not found on server. It might have been deleted or moved.' });
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log('JSON Data:', jsonData);
        console.log('xAxis:', xAxis, 'yAxis:', yAxis);

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            console.error('Error: jsonData is empty, undefined, or missing selected columns for generating all charts.');
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file for generating charts.' });
        }

        const labels = jsonData.map(item => item[xAxis]?.toString() || '');
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0);

        console.log('Extracted Labels:', labels);
        console.log('Extracted Data Values:', dataValues);

        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        for (const chartType of chartTypes) {
            try {
                const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
                const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
                const imageName = `${chartType}_chart_${uploadId}.png`;
                const imagePath = join(uploadDir, imageName); // Use the permanent upload directory
                await fs.writeFile(imagePath, imageBuffer);
                const chartUrl = `/uploads/${imageName}`;
                generatedChartUrls.push(chartUrl);

            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart for uploadId ${uploadId}:`, renderError);
                // Continue with other charts even if one fails
            }
        }
        console.log('Generated chart URLs:', generatedChartUrls);
        res.status(200).json({ message: 'All charts generated successfully.', chartUrls: generatedChartUrls });
        console.log("final hit");
    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error });
    }
};

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

export const deleteUpload = async (req, res) => {
    const { id } = req.params;
    try {
        const upload = await Upload.findByIdAndDelete(id);
        if (!upload) {
            return res.status(404).json({ message: 'Upload history not found.' });
        }
        // Delete the physical Excel file from the server
        if (upload.filePath) {
            await fs.unlink(upload.filePath).catch(e => console.error("Error deleting physical Excel file:", e));
        }

        // Also delete any generated chart images associated with this uploadId
        // This is a more robust way to clean up
        const chartImagePattern = `*_chart_${id}*.png`; // Match images like bar_chart_UPLOADID.png, scatter_chart_UPLOADID_single.png
        const chartImagesToDelete = await fs.readdir(uploadDir);
        for (const file of chartImagesToDelete) {
            if (file.includes(`_chart_${id}`)) { // More robust check
                const imagePathToDelete = join(uploadDir, file);
                await fs.unlink(imagePathToDelete).catch(e => console.error(`Error deleting chart image ${file}:`, e));
            }
        }

        res.status(200).json({ message: 'Upload history and associated files deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};