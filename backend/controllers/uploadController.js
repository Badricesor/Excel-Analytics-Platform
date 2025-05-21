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
const EXCEL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'excel');
// Ensure directory exists
await fs.mkdir(EXCEL_UPLOAD_DIR, { recursive: true }).catch(console.error);


// Function to generate chart configuration based on chart type
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
    const baseConfig = {
        data: {
            labels: labels,
            datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: dataValues,
                // Add default styling here
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
                    type: 'category', // Changed to 'category' for general use, 'linear' for scatter/bubble
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
                        label: `${yAxis} Distribution`, // A more appropriate label for pie/doughnut
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
                            suggestedMax: Math.max(...dataValues) * 1.2 // Add some padding
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
                        data: jsonData.map(item => ({ x: item[xAxis], y: item[yAxis], r: 10 })), // r is bubble radius
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
                        x: { type: 'linear', position: 'bottom', title: { display: true, text: xAxis } },
                        y: { type: 'linear', position: 'left', title: { display: true, text: yAxis } }
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
        cb(new Error('Invalid file type, only Excel files are allowed!'), false); // Changed to throw error for clearer feedback
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });


// --- UPDATED uploadFile FUNCTION ---
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

        // Generate a unique filename for persistent storage
        const uniqueId = uuidv4();
        const persistentFileName = `excel-${uniqueId}${path.extname(originalname)}`;
        const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFileName);

        try {
            // Move the file from temp location to your persistent storage
            await fs.copyFile(tempFilePath, persistentFilePath); // Use fs.copyFile for clarity

            const workbook = XLSX.readFile(persistentFilePath);
            const sheetName = workbook.SheetNames[0]; // Get the first sheet name
            const worksheet = workbook.Sheets[sheetName];

            // 1. Extract Headers explicitly using { header: 1 } and take the first row
            const raw_data_with_headers = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }); // raw:false to get formatted values

            if (!raw_data_with_headers || raw_data_with_headers.length === 0) {
                // If no data, remove the persistent file as well
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e)); // Clean up temp file
                return res.status(400).json({ message: 'No data found in the Excel file.' });
            }

            const headers = raw_data_with_headers[0]; // The first array is your headers

            // Basic validation for extracted headers
            if (!Array.isArray(headers) || headers.length === 0 || headers.some(h => typeof h !== 'string' || h.trim() === '')) {
                 await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'Invalid or missing headers in the Excel file. Ensure the first row contains valid column names.' });
            }

            // Clean headers: remove undefined/null, trim whitespace, ensure they are strings
            const cleanedHeaders = headers.filter(h => h !== undefined && h !== null).map(String).map(h => h.trim());
            // Filter out empty strings if necessary, though trim() should handle most
            const finalHeaders = cleanedHeaders.filter(h => h !== '');

            if (finalHeaders.length === 0) {
                 await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'No valid column headers found after cleaning. Please ensure the first row has proper names.' });
            }


            // 2. Convert data rows (skipping header) to array of objects using the *extracted* headers
            const dataRows = raw_data_with_headers.slice(1); // Get all rows *after* the header

            if (!dataRows || dataRows.length === 0) {
                // If no data rows, but headers exist, still consider it valid for structure
                // But no data means no charts. Handle this gracefully.
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(200).json({
                    message: 'File uploaded successfully, but no data rows found (only headers).',
                    data: [],
                    uploadId: new Upload()._id, // Return a dummy ID or handle on frontend
                    headers: finalHeaders,
                    filePath: persistentFilePath // Path to the saved file
                });
            }

            const jsonDataObjects = dataRows.map(row => {
                const obj = {};
                finalHeaders.forEach((header, index) => {
                    // Use the index from the raw data row to map to the header
                    // Ensure that undefined/null values are handled, e.g., convert to empty string
                    obj[header] = row[index] ?? '';
                });
                return obj;
            });

            const userId = req.user._id; // Get the user ID from the request

            const uploadRecord = new Upload({
                filename: originalname,
                filePath: persistentFilePath,
                uploadDate: new Date(),
                data: jsonDataObjects, // Save the converted array of objects
                userId: userId, // Store the user ID
            });

            const savedUpload = await uploadRecord.save();

            await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e)); // Clean up the temporary file

            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonDataObjects, // Send the cleaned and mapped data
                uploadId: savedUpload._id,
                headers: finalHeaders, // Send the explicitly extracted headers
                filePath: persistentFilePath // Path to the saved file
            });

        } catch (error) {
            console.error('Error processing uploaded file:', error);
            // Robust error handling for file cleanup in case of failure
            if (fs.access(tempFilePath).then(() => true).catch(() => false)) {
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
            }
            if (fs.access(persistentFilePath).then(() => true).catch(() => false)) { // Check if persistent file exists
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
            }
            res.status(500).json({ message: 'Error processing uploaded file.', error: error.message });
        }
    });
};


// --- Your existing analyzeData function needs a minor adjustment ---
export const analyzeData = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis, chartType } = req.body;

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // Use the 'data' stored in the upload record, instead of re-reading the file
        const jsonData = uploadRecord.data;

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file.' });
        }

        const labels = jsonData.map(item => String(item[xAxis]) || ''); // Ensure labels are strings
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0); // Ensure data values are numbers

        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
        const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        const imageName = `${chartType}_chart_${uploadId}_single.png`;
        const imagePath = join(__dirname, '..', 'uploads', imageName);
        await fs.writeFile(imagePath, imageBuffer);
        const chartUrl = `/uploads/${imageName}`;

        res.status(200).json({ chartData: {}, chartType, chartUrl });

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: 'Error analyzing data.', error: error.message });
    }
};

// --- Your existing generateAllCharts function needs a minor adjustment ---
export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartDetails = []; // Renamed from generatedChartUrls for clarity

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // Use the 'data' stored in the upload record, instead of re-reading the file
        const jsonData = uploadRecord.data;

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file for generating charts.' });
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
                const imageName = `${chartType}_chart_${uploadId}.png`;
                const imagePath = join(__dirname, '..', 'uploads', imageName);
                await fs.writeFile(imagePath, imageBuffer);
                const chartUrl = `/uploads/${imageName}`;
                generatedChartDetails.push({ url: chartUrl, type: chartType });
                console.log(`Generated chart: ${chartType}, URL: ${chartUrl}`); // Log each generated chart
            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart:`, renderError);
            }
        }

        console.log('Final generatedChartDetails:', generatedChartDetails); // Log the final array before sending
        res.status(200).json({ message: 'All charts generated successfully.', chartDetails: generatedChartDetails }); // Changed key to chartDetails

    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error: error.message });
    }
};


// --- Your existing getUploadHistory function ---
export const getUploadHistory = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error('Error: User not authenticated or user ID missing in request.');
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }
        const userId = req.user._id; // Assuming you have user authentication middleware that populates req.user
        console.log(`Workspaceing upload history for userId: ${userId}`); // Log the user ID
        const uploadHistory = await Upload.find({ userId }).sort({ uploadDate: -1 }); // Find uploads for the current user, sorted by date (newest first)
        console.log(`Found ${uploadHistory.length} upload records for user ${userId}`); // Log the number of records found
        res.status(200).json(uploadHistory);
    } catch (error) {
        console.error('Error fetching upload history:', error);
        res.status(500).json({ message: 'Failed to fetch upload history.', error: error.message });
    }
};

// --- Your existing deleteUpload function ---
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