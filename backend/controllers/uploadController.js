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
import { User, Upload } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch'; // Import node-fetch for downloading files

// Cloudinary import and configuration
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Always use HTTPS
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer will now save to the /tmp directory (Render's temporary storage)
// This file will be read and then immediately uploaded to Cloudinary, then deleted.
const tempUploadDir = '/tmp'; // Standard temporary directory on Linux systems like Render

// Function to generate chart configuration (no change needed here from previous versions)
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
    // ... (Your existing getChartConfiguration code - ensure it's up-to-date) ...
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

// Configure multer storage to save to /tmp
const storage = multer.diskStorage({
    destination: tempUploadDir, // Save to /tmp
    filename: (req, file, cb) => {
        cb(null, `excelFile-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only Excel files are allowed.'), false);
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

        const filePath = req.file.path; // Temporary file path in /tmp
        const originalName = req.file.originalname;
        console.log('Temporary File path:', filePath);
        console.log('Original name:', originalName);

        try {
            // 1. Read the Excel file from /tmp to process data
            console.log('Attempting to read workbook...');
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('JSON data (first 5 rows):', jsonData.slice(0, 5)); // Log only a few for brevity

            // 2. Upload the Excel file to Cloudinary
            const excelUploadResult = await cloudinary.uploader.upload(filePath, {
                resource_type: "raw", // Treat as a raw file (not an image)
                folder: "excel_files", // Organize in a specific folder on Cloudinary
                public_id: `excel-${Date.now()}-${path.basename(originalName, path.extname(originalName))}` // Unique ID based on timestamp and original name
            });
            console.log('Excel file uploaded to Cloudinary:', excelUploadResult.secure_url);

            const userId = req.user._id;

            const uploadRecord = new Upload({
                filename: originalName,
                filePath: excelUploadResult.secure_url, // Store the Cloudinary URL in the database
                uploadDate: new Date(),
                // data: jsonData, // OPTIONAL: Only store if you are confident file sizes will be small (less than 16MB per doc)
                userId: userId,
            });

            console.log('Creating upload record:', uploadRecord);
            const savedUpload = await uploadRecord.save();
            console.log('Upload record saved:', savedUpload);
            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonData, // Send parsed data for immediate frontend use (this isn't persisted)
                uploadId: savedUpload._id,
                headers: Object.keys(jsonData[0] || {}),
            });
            console.log('Upload successful response sent.');

        } catch (error) {
            console.error('Error processing uploaded file:', error);
            res.status(500).json({ message: 'Error processing uploaded file.', error: error.message });
            console.log('Error response sent.');
        } finally {
            // ALWAYS delete the temporary file from /tmp after processing/uploading
            await fs.unlink(filePath).catch(e => console.error("Error deleting temporary file:", e));
        }
    });
};

// Helper function to download Excel from Cloudinary to /tmp for processing
async function downloadExcelFromCloudinary(url) {
    console.log(`Downloading Excel from Cloudinary: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download file from Cloudinary: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer

    // Save to a temporary file in /tmp for XLSX.readFile
    const tempFilePath = path.join(tempUploadDir, `downloaded_excel_${Date.now()}.xlsx`);
    await fs.writeFile(tempFilePath, buffer);
    return tempFilePath;
}


export const analyzeData = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis, chartType } = req.body;
    let downloadedFilePath = null; // To track and delete the temporary Excel file

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        const excelCloudinaryUrl = uploadRecord.filePath; // This is the Cloudinary URL from the DB
        console.log(`Retrieving Excel from Cloudinary URL: ${excelCloudinaryUrl}`);

        // Download the Excel file from Cloudinary to a temporary location for XLSX processing
        downloadedFilePath = await downloadExcelFromCloudinary(excelCloudinaryUrl);

        const workbook = XLSX.readFile(downloadedFilePath);
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

        let chartUrl = '';
        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
        console.log('Chart Configuration:', JSON.stringify(configuration, null, 2));
        const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

        // Upload the generated chart image buffer directly to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "charts", // Folder for charts in Cloudinary
                public_id: `${chartType}_chart_${uploadId}_single` // Unique ID for this specific chart type for this upload
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }).end(imageBuffer);
        });

        chartUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary
        console.log('Generated chart Cloudinary URL:', chartUrl);

        res.status(200).json({ chartData: {}, chartType, chartUrl });
        console.log('Chart analysis successful response sent.');

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: 'Error analyzing data.', error: error.message });
    } finally {
        // Clean up the temporary downloaded Excel file
        if (downloadedFilePath) {
            await fs.unlink(downloadedFilePath).catch(e => console.error("Error deleting temporary downloaded excel file:", e));
        }
    }
};

export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartUrls = [];
    let downloadedFilePath = null; // To track and delete the temporary Excel file

    try {
        console.log(`Generating all charts for upload ID: ${uploadId}`);
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }
        console.log('Upload Record:', uploadRecord);
        const excelCloudinaryUrl = uploadRecord.filePath; // This is the Cloudinary URL

        // Download the Excel file from Cloudinary to a temporary location for XLSX processing
        downloadedFilePath = await downloadExcelFromCloudinary(excelCloudinaryUrl);

        const workbook = XLSX.readFile(downloadedFilePath);
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

        const width = 600;
        const height = 400;
        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

        // Use Promise.all to wait for all chart uploads to complete
        const chartUploadPromises = chartTypes.map(async (chartType) => {
            try {
                const configuration = getChartConfiguration(chartType, labels, dataValues, xAxis, yAxis, jsonData);
                const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

                // Upload each generated chart image to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({
                        folder: "charts",
                        public_id: `${chartType}_chart_${uploadId}` // Unique ID for each chart type for this upload
                    }, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }).end(imageBuffer);
                });
                return uploadResult.secure_url;
            } catch (renderError) {
                console.error(`Error rendering or uploading ${chartType} chart:`, renderError);
                return 'error-rendering-chart'; // Return a placeholder URL or error indicator
            }
        });

        // Wait for all chart uploads to finish
        const results = await Promise.all(chartUploadPromises);
        generatedChartUrls.push(...results.filter(url => url !== 'error-rendering-chart')); // Filter out failed ones

        console.log('Generated chart URLs:', generatedChartUrls);
        res.status(200).json({ message: 'All charts generated successfully.', chartUrls: generatedChartUrls });
        console.log("final hit");

    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error: error.message });
    } finally {
        // Clean up the temporary downloaded Excel file
        if (downloadedFilePath) {
            await fs.unlink(downloadedFilePath).catch(e => console.error("Error deleting temporary downloaded excel file:", e));
        }
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
        const uploadRecord = await Upload.findById(id); // Find the record first
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload history not found.' });
        }

        // Delete the Excel file from Cloudinary (if stored there)
        if (uploadRecord.filePath && uploadRecord.filePath.includes('res.cloudinary.com')) {
            // Extract public_id from the Cloudinary URL.
            // Example URL: https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v1234567890/excel_files/excel-1234567890-samplefile.xlsx
            // We need: "excel_files/excel-1234567890-samplefile"
            try {
                const urlParts = uploadRecord.filePath.split('/');
                const versionIndex = urlParts.findIndex(part => part.startsWith('v')) + 1; // Find the version number part
                const publicIdWithExtension = urlParts.slice(versionIndex).join('/'); // Get everything after version
                const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

                console.log('Attempting to delete Excel from Cloudinary. Public ID:', publicId);
                await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
                console.log('Excel file deleted from Cloudinary.');
            } catch (e) {
                console.error("Error parsing Cloudinary Excel URL or deleting from Cloudinary:", e);
            }
        }

        // Delete generated chart images from Cloudinary for this uploadId
        const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
        const deleteChartPromises = chartTypes.map(async (chartType) => {
            const chartPublicId = `charts/${chartType}_chart_${id}`; // Matches the public_id used during upload
            try {
                console.log('Attempting to delete chart from Cloudinary:', chartPublicId);
                await cloudinary.uploader.destroy(chartPublicId);
                console.log(`Chart ${chartPublicId} deleted from Cloudinary.`);
            } catch (e) {
                // It's okay if a chart didn't exist or failed to delete (e.g., if a chart wasn't generated)
                console.warn(`Could not delete Cloudinary chart ${chartPublicId}:`, e.message);
            }
        });
        await Promise.all(deleteChartPromises); // Wait for all chart deletions to attempt

        // Finally, delete the record from your database
        await Upload.findByIdAndDelete(id);

        res.status(200).json({ message: 'Upload history and associated cloud files deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};