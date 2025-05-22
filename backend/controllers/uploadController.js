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
// Register all necessary Chart.js components
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

import fs from 'fs/promises'; // <--- CRITICAL FIX: Ensure this is the correct import for promise-based fs methods
import multer from 'multer';
import path from 'path';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { User, Upload } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a persistent storage directory for Excel files
const EXCEL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'excel');
// Ensure the directory exists. Using try-catch with await fs.access is robust.
try {
    await fs.access(EXCEL_UPLOAD_DIR);
    console.log(`Directory exists: ${EXCEL_UPLOAD_DIR}`);
} catch (error) {
    if (error.code === 'ENOENT') {
        console.log(`Directory does not exist, creating: ${EXCEL_UPLOAD_DIR}`);
        await fs.mkdir(EXCEL_UPLOAD_DIR, { recursive: true });
        console.log(`Directory created: ${EXCEL_UPLOAD_DIR}`);
    } else {
        console.error("Error accessing or creating EXCEL_UPLOAD_DIR:", error);
        // If this fails, your app won't be able to store files, so it's a critical error.
        // Consider re-throwing or exiting the process if this is truly unrecoverable.
    }
}


// Function to generate Chart.js configuration
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
    // Base configuration for most charts
    const baseConfig = {
        data: {
            labels: labels,
            datasets: [{
                label: `${yAxis} vs ${xAxis}`, // Label for the dataset
                data: dataValues,
                backgroundColor: 'rgba(54, 162, 235, 0.8)', // Default background for consistency
                borderColor: 'rgba(54, 162, 235, 1)', // Default border for consistency
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Important for image generation
            plugins: {
                title: { display: true, text: `${chartType.toUpperCase()} Chart: ${yAxis} vs ${xAxis}` },
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    type: 'category', // For categorical X-axis
                    title: { display: true, text: xAxis }
                },
                y: {
                    type: 'linear', // For numerical Y-axis
                    beginAtZero: true,
                    title: { display: true, text: yAxis }
                }
            },
        },
    };

    switch (chartType) {
        case 'bar':
            return { ...baseConfig, type: 'bar' };
        case 'line':
            return { ...baseConfig, type: 'line', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], fill: false, borderColor: 'rgba(75, 192, 192, 1)' }] } };
        case 'pie':
        case 'doughnut':
            // For pie/doughnut, labels are from X-axis, data is from Y-axis.
            // Colors need to be an array for multiple segments.
            return {
                type: chartType,
                data: {
                    labels: labels, // X-axis values as labels for segments
                    datasets: [{
                        data: dataValues, // Y-axis values as segment sizes
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: `${chartType.toUpperCase()} Chart: ${yAxis} by ${xAxis}` },
                        legend: { position: 'top' },
                        tooltip: { enabled: true }
                    }
                }
            };
        case 'radar':
            return { ...baseConfig, type: 'radar', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgba(153, 102, 255, 1)', pointBackgroundColor: 'rgba(153, 102, 255, 1)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(153, 102, 255, 1)' }] },
                options: { ...baseConfig.options, scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: Math.max(...dataValues) || 10 } } }
            };
        case 'bubble':
            // Bubble chart data requires x, y, and r (radius) properties.
            return {
                ...baseConfig,
                type: 'bubble',
                data: {
                    datasets: [{
                        label: `${yAxis} vs ${xAxis}`,
                        data: jsonData.map(item => ({
                            x: Number(item[xAxis]) || 0, // Ensure x is numeric
                            y: Number(item[yAxis]) || 0, // Ensure y is numeric
                            r: 10 // Constant radius, adjust if you have a third data point
                        })),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)',
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
            // Scatter chart data requires x and y properties.
            return {
                ...baseConfig,
                type: 'scatter',
                data: {
                    datasets: [{
                        label: `${yAxis} vs ${xAxis}`,
                        data: jsonData.map(item => ({
                            x: Number(item[xAxis]) || 0, // Ensure x is numeric
                            y: Number(item[yAxis]) || 0  // Ensure y is numeric
                        })),
                        backgroundColor: 'rgba(255, 159, 64, 0.8)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
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
        case 'area': // Area chart is typically a line chart with fill: true
            return { ...baseConfig, type: 'line', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(26, 188, 156, 0.8)', backgroundColor: 'rgba(26, 188, 156, 0.4)', fill: true }] } };
        default:
            return { ...baseConfig, type: 'bar' }; // Fallback to bar chart
    }
};

// Configure multer storage to save initially to /tmp for Render compatibility
const storage = multer.diskStorage({
    destination: '/tmp', // Use /tmp for temporary files on platforms like Render
    filename: (req, file, cb) => {
        // Create a unique file name to prevent conflicts
        cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Only allow Excel MIME types
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only Excel files (.xlsx, .xls) are allowed!'), false);
    }
};

const uploadMiddleware = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

export const uploadFile = async (req, res) => {
    // Use the multer middleware to handle the file upload
    uploadMiddleware.single('excelFile')(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error during file upload:', err);
            return res.status(400).json({ message: `File upload error: ${err.message}` });
        } else if (err) {
            console.error('Unexpected error during file upload:', err);
            return res.status(500).json({ message: `An unexpected error occurred during upload: ${err.message}` });
        }
        if (!req.file) {
            console.log('No file received or file type not allowed.');
            return res.status(400).json({ message: 'No file uploaded or invalid file type.' });
        }

       try {
            const { originalname } = req.file;
            const tempFilePath = req.file.path; // Path where Multer saved the file temporarily
            const uniqueId = uuidv4();
            const persistentFileName = `excel-${uniqueId}${path.extname(originalname)}`;
            const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFileName);

            // FIX 1: Use fs.copyFile correctly with await
            console.log(`Attempting to copy file from ${tempFilePath} to ${persistentFilePath}`);
            await fs.copyFile(tempFilePath, persistentFilePath);
            console.log('File successfully copied to persistent storage.');

            const workbook = XLSX.readFile(persistentFilePath);
            const sheetName = workbook.SheetNames[0]; // Get the first sheet name

            // FIX 2: Parse directly into an array of objects
            // This is the most reliable way: it uses the first row as headers
            // and creates an array of objects like [{ Header1: Value1, Header2: Value2 }, ...]
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('Parsed jsonData (first 2 items):', jsonData.slice(0, 2)); // Debug log for data structure

            if (!jsonData || jsonData.length === 0) {
                console.log('DEBUG: Parsed Excel file is empty or contains no data rows.');
                return res.status(400).json({ message: 'Uploaded Excel file is empty or contains no data rows after parsing.' });
            }
            if (Object.keys(jsonData[0] || {}).length === 0) {
                 console.log('DEBUG: Parsed Excel data has no valid headers in the first row.');
                 return res.status(400).json({ message: 'Uploaded Excel file might be empty or missing headers in the first row.' });
            }

            // Extract headers directly from the keys of the first data object.
            // .map(h => String(h).trim()) ensures keys are strings and trimmed.
            const headers = Object.keys(jsonData[0]).map(h => String(h).trim());
            console.log('Extracted Headers:', headers);

            const userId = req.user._id; // Get the user ID from the authentication middleware

            const uploadRecord = new Upload({
                filename: originalname,
                filePath: persistentFilePath, // Store the persistent path for later retrieval
                uploadDate: new Date(),
                data: jsonData, // Store the correctly parsed array of objects
                userId: userId,
            });

            const savedUpload = await uploadRecord.save();
            console.log('Upload record saved to MongoDB with ID:', savedUpload._id);

            // Clean up the temporary file after successful processing and saving
            await fs.unlink(tempFilePath);
            console.log('Temporary file deleted:', tempFilePath);

            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonData, // Send the parsed object data back to frontend
                uploadId: savedUpload._id,
                headers: headers, // Send extracted headers to frontend for dropdowns
                filePath: persistentFilePath // Optional: send back file path if frontend needs it
            });
        } catch (error) {
            console.error('Error in uploadFile processing block:', error);
            res.status(500).json({message: `Error processing uploaded file: ${error.message}`, error: error.message});
        }
    });
};

export const analyzeData = async (req, res) => {
    console.log('--- Entering analyzeData Controller ---');
    const { uploadId } = req.params;
    const { xAxis, yAxis, chartType } = req.body;
    console.log('Request Params (uploadId):', uploadId);
    console.log('Request Body (xAxis, yAxis, chartType):', { xAxis, yAxis, chartType });

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            console.log('DEBUG: Upload record not found for ID:', uploadId);
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // FIX 3: Use the already stored data from uploadRecord
        const jsonData = uploadRecord.data;
        console.log('Data retrieved from DB for analysis (first 2 items):', jsonData.slice(0, 2));

        if (!jsonData || jsonData.length === 0) {
            console.log('DEBUG: jsonData is empty or null from DB for uploadId:', uploadId);
            return res.status(400).json({ message: 'No data found in the uploaded file for analysis.' });
        }

        // FIX 4: Robust check for headers (trimming to avoid space issues)
        const cleanedXAxis = String(xAxis || '').trim();
        const cleanedYAxis = String(yAxis || '').trim();

        // Check if the first data object has the required properties
        if (!jsonData[0] || !jsonData[0].hasOwnProperty(cleanedXAxis) || !jsonData[0].hasOwnProperty(cleanedYAxis)) {
            console.log(`DEBUG: Missing columns for uploadId: ${uploadId}. xAxis: '${cleanedXAxis}', yAxis: '${cleanedYAxis}'. First data item's keys:`, jsonData[0] ? Object.keys(jsonData[0]) : 'No first item (empty data)');
            return res.status(400).json({ message: `Selected columns '${xAxis}' or '${yAxis}' are missing or malformed in the uploaded file data.` });
        }

        const labels = jsonData.map(item => String(item[cleanedXAxis] || '').trim());
        const dataValues = jsonData.map(item => Number(item[cleanedYAxis]) || 0);
        console.log('Labels generated (first 5):', labels.slice(0, 5));
        console.log('Data Values generated (first 5):', dataValues.slice(0, 5));


        const width = 800; // Increased width for better quality
        const height = 600; // Increased height for better quality
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, background: 'white' }); // Added background for charts
        const configuration = getChartConfiguration(chartType, labels, dataValues, cleanedXAxis, cleanedYAxis, jsonData); // Pass cleaned axes
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
        const imageName = `${chartType}_chart_${uploadId}_single.png`;
        const imagePath = join(__dirname, '..', 'uploads', imageName);
        await fs.writeFile(imagePath, imageBuffer);
        const chartUrl = `/uploads/${imageName}`;
        console.log('Chart generated and saved:', chartUrl);

        res.status(200).json({ chartData: {}, chartType, chartUrl });

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: `Error analyzing data: ${error.message}`, error: error.message });
    }
};

export const generateAllCharts = async (req, res) => {
    console.log('--- Entering generateAllCharts Controller ---');
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    console.log('Request Params (uploadId):', uploadId);
    console.log('Request Body (xAxis, yAxis):', { xAxis, yAxis });

    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartDetails = []; // To store details of all generated charts

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            console.log('DEBUG: Upload record not found for ID:', uploadId);
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        // FIX 3: Use the already stored data from uploadRecord
        const jsonData = uploadRecord.data;
        console.log('Data retrieved from DB for all charts (first 2 items):', jsonData.slice(0, 2));

        if (!jsonData || jsonData.length === 0) {
            console.log('DEBUG: jsonData is empty or null from DB for uploadId:', uploadId);
            return res.status(400).json({ message: 'No data found in the uploaded file for generating charts.' });
        }

        // FIX 4: Robust check for headers (trimming to avoid space issues)
        const cleanedXAxis = String(xAxis || '').trim();
        const cleanedYAxis = String(yAxis || '').trim();

        if (!jsonData[0] || !jsonData[0].hasOwnProperty(cleanedXAxis) || !jsonData[0].hasOwnProperty(cleanedYAxis)) {
            console.log(`DEBUG: Missing columns for uploadId: ${uploadId}. xAxis: '${cleanedXAxis}', yAxis: '${cleanedYAxis}'. First data item's keys:`, jsonData[0] ? Object.keys(jsonData[0]) : 'No first item (empty data)');
            return res.status(400).json({ message: `Selected columns '${xAxis}' or '${yAxis}' are missing or malformed in the uploaded file data for generating charts.` });
        }

        const labels = jsonData.map(item => String(item[cleanedXAxis] || '').trim());
        const dataValues = jsonData.map(item => Number(item[cleanedYAxis]) || 0);
        console.log('Labels generated for all charts (first 5):', labels.slice(0, 5));
        console.log('Data Values generated for all charts (first 5):', dataValues.slice(0, 5));

        const width = 800;
        const height = 600;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, background: 'white' });

        // Iterate through each chart type and generate an image
        for (const chartType of chartTypes) {
            try {
                const configuration = getChartConfiguration(chartType, labels, dataValues, cleanedXAxis, cleanedYAxis, jsonData);
                const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
                // Ensure unique image names, especially when generating multiple charts for one upload
                const imageName = `${chartType}_chart_${uploadId}_${uuidv4()}.png`;
                const imagePath = join(__dirname, '..', 'uploads', imageName);
                await fs.writeFile(imagePath, imageBuffer);
                const chartUrl = `/uploads/${imageName}`;
                generatedChartDetails.push({ url: chartUrl, type: chartType });
                console.log(`Successfully rendered ${chartType} chart: ${chartUrl}`);
            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart for uploadId ${uploadId}:`, renderError);
                // Log the error but continue to the next chart type
            }
        }

        res.status(200).json({ message: 'All charts generated successfully.', chartDetails: generatedChartDetails });

    } catch (error) {
        console.error('Error in generateAllCharts controller:', error);
        res.status(500).json({ message: `Error generating all charts: ${error.message}`, error: error.message });
    }
};

export const getUploadHistory = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming req.user is populated by authentication middleware
        const uploadHistory = await Upload.find({ userId }).sort({ uploadDate: -1 }); // Newest first
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
            return res.status(404).json({ message: 'Upload record not found.' });
        }
        // Attempt to delete the physical file from storage
        if (upload.filePath) {
            try {
                await fs.unlink(upload.filePath);
                console.log('Deleted physical Excel file:', upload.filePath);
            } catch (fileDeleteError) {
                console.warn(`Could not delete physical file at ${upload.filePath} (it might not exist or permissions issue):`, fileDeleteError.message);
                // Do not fail the entire request if physical file deletion fails
            }
        }
        res.status(200).json({ message: 'Upload history deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};