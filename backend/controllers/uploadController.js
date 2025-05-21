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

const EXCEL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'excel');
await fs.mkdir(EXCEL_UPLOAD_DIR, { recursive: true }).catch(console.error);


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
                        x: { type: 'linear', position: 'linear', title: { display: true, text: xAxis } },
                        y: { type: 'linear', position: 'linear', title: { display: true, text: yAxis } }
                    }
                }
            };
        case 'area':
            return { ...baseConfig, type: 'line', data: { ...baseConfig.data, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(26, 188, 156, 0.8)', backgroundColor: 'rgba(26, 188, 156, 0.4)', fill: true }] } };
        default:
            return { ...baseConfig, type: 'bar' };
    }
};

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
        cb(new Error('Invalid file type, only Excel files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });


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
        const tempFilePath = req.file.path;

        const uniqueId = uuidv4();
        const persistentFileName = `excel-${uniqueId}${path.extname(originalname)}`;
        const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFileName);

        try {
            await fs.copyFile(tempFilePath, persistentFilePath);

            const workbook = XLSX.readFile(persistentFilePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Option 1: Read all data including headers as arrays (for header extraction)
            const raw_data_with_headers = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            if (!raw_data_with_headers || raw_data_with_headers.length === 0) {
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'No data found in the Excel file.' });
            }

            let headers = raw_data_with_headers[0];

            // Clean and validate headers
            if (!Array.isArray(headers) || headers.length === 0) {
                // If the first row is not a valid header, try to infer or create default
                // This scenario might happen if the Excel is just data, no explicit header row.
                // For simplicity, we'll assume the first row IS headers.
                // If it's still empty, it's an error.
                await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'Invalid or missing headers in the Excel file. Ensure the first row contains valid column names.' });
            }

            // Clean headers: convert to string, trim whitespace, replace problematic characters
            // Replace spaces with underscores or remove them for cleaner property access in JS
            const cleanedHeaders = headers.map(h => {
                if (h === undefined || h === null) return '';
                let cleaned = String(h).trim();
                // Optional: Replace problematic characters or spaces with underscores
                // cleaned = cleaned.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                return cleaned;
            }).filter(h => h !== ''); // Remove any headers that became empty after cleaning

            if (cleanedHeaders.length === 0) {
                 await fs.unlink(persistentFilePath).catch(e => console.error("Error unlinking persistent file:", e));
                 await fs.unlink(tempFilePath).catch(e => console.error("Error unlinking temp file:", e));
                return res.status(400).json({ message: 'No valid column headers found after cleaning. Please ensure the first row has proper names.' });
            }

            // Option 2: Convert data to JSON objects using the cleaned headers
            // Ensure data rows are skipped from the raw_data_with_headers
            const dataRows = raw_data_with_headers.slice(1); // All rows AFTER the header

            const jsonDataObjects = dataRows.map(row => {
                const obj = {};
                cleanedHeaders.forEach((header, index) => {
                    // Map values using cleaned headers and their original indices
                    obj[header] = row[index] ?? ''; // Use ?? '' to handle undefined/null values gracefully
                });
                return obj;
            });


            const userId = req.user._id;

            const uploadRecord = new Upload({
                filename: originalname,
                filePath: persistentFilePath,
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
                headers: cleanedHeaders, // Send the cleaned headers to the frontend
                filePath: persistentFilePath
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
        const imageName = `${chartType}_chart_${uploadId}_single.png`;
        const imagePath = join(__dirname, '..', 'uploads', imageName);
        await fs.writeFile(imagePath, imageBuffer);
        chartUrl = `/uploads/${imageName}`; // Serve this static URL

        res.status(200).json({ chartData: {}, chartType, chartUrl }); // Send back the chartUrl

    } catch (error) {
        console.error('Error analyzing data:', error);
        res.status(500).json({ message: 'Error analyzing data.', error });
    }
};

export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area']; // Include 'area'
    const generatedChartUrls = [];

    try {
        console.log(`Generating all charts for upload ID: ${uploadId}`);
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }
        console.log('Upload Record:', uploadRecord);
        const filePath = uploadRecord.filePath; // Retrieve the stored file path
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
                const imagePath = join(__dirname, '..', 'uploads', imageName);
                await fs.writeFile(imagePath, imageBuffer);
                const chartUrl = `/uploads/${imageName}`;
                generatedChartUrls.push(chartUrl);

            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart:`, renderError);
                // Optionally, you could skip this chart and continue with others
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
        if (upload.filePath) {
            await fs.unlink(upload.filePath).catch(e => console.error("Error deleting physical file:", e));
        }
        res.status(200).json({ message: 'Upload history deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};