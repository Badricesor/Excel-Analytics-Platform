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
import { User, Upload } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a persistent storage directory for Excel files
const EXCEL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'excel');
await fs.mkdir(EXCEL_UPLOAD_DIR, { recursive: true });

// Function to generate chart configuration based on chart type
const getChartConfiguration = (chartType, labels, dataValues, xAxis, yAxis, jsonData) => {
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
                    title: { display: true, text: xAxis }
                },
                y: {
                    type: 'linear',
                    beginAtZero: true,
                    title: { display: true, text: yAxis }
                }
            },
        },
    };

    switch (chartType) {
        case 'bar':
            return { ...baseConfig, type: 'bar', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], backgroundColor: 'rgba(54, 162, 235, 0.8)' }] } };
        case 'line':
            return { ...baseConfig, type: 'line', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(75, 192, 192, 0.8)', fill: false }] } };
        case 'pie':
        case 'doughnut':
            return { ...baseConfig, type: chartType, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } },
                data: { labels, datasets: [{ ...baseConfig.data.datasets[0], backgroundColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)'] }] } };
        case 'radar':
            return { ...baseConfig, type: 'radar', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], backgroundColor: 'rgba(153, 102, 255, 0.2)', borderColor: 'rgba(153, 102, 255, 1)', pointBackgroundColor: 'rgba(153, 102, 255, 1)', pointBorderColor: '#fff', pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgba(153, 102, 255, 1)' }] },
                options: { scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: Math.max(...dataValues) } } } };
        case 'bubble':
            return { ...baseConfig, type: 'bubble', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], data: jsonData.map(item => ({ x: item[xAxis], y: item[yAxis], r: 10 })), backgroundColor: 'rgba(255, 99, 132, 0.6)', hoverBackgroundColor: 'rgba(255, 99, 132, 0.8)', borderWidth: 0 }] },
                options: { scales: { x: { type: 'linear', position: 'bottom' }, y: { type: 'linear', position: 'left' } } } };
        case 'scatter':
            return { ...baseConfig, type: 'scatter', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], data: jsonData.map(item => ({ x: item[xAxis], y: item[yAxis] })), backgroundColor: 'rgba(255, 159, 64, 0.8)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 }] },
                options: { scales: { x: { type: 'linear', position: 'bottom' }, y: { type: 'linear', position: 'left' } } } };
        case 'area':
            return { ...baseConfig, type: 'line', data: { labels, datasets: [{ ...baseConfig.data.datasets[0], borderColor: 'rgba(26, 188, 156, 0.8)', backgroundColor: 'rgba(26, 188, 156, 0.4)', fill: true }] } };
        default:
            return { ...baseConfig, type: 'bar' };
    }
};

// Configure multer storage to save initially to /tmp
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
        cb(null, false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadFile = async (req, res) => {
    upload.single('excelFile')(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(500).json({ message: 'Error uploading file.', error: err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

       try {
            const { originalname } = req.file;
            const tempFilePath = req.file.path;
            const uniqueId = uuidv4();
            const persistentFileName = `excel-${uniqueId}${path.extname(originalname)}`;
            const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFileName);

            await fs.copy(tempFilePath, persistentFilePath);

            const workbook = XLSX.readFile(persistentFilePath);
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false });

             // Check if jsonData is not empty and has data.
            let headers = [];
            if (jsonData && jsonData.length > 0) {
                // If the first row contains headers, use it.
                if (typeof jsonData[0] === 'object') {
                    headers = Object.keys(jsonData[0]);
                } else {
                    // Otherwise, generate default headers like "Column1", "Column2", etc.
                    headers = Array.from({ length: jsonData[0].length }, (_, i) => `Column${i + 1}`);
                }
            }

            // Convert to the desired format, handling potential issues
            const validJsonData = [];
            if (jsonData && jsonData.length > 1) { //  && jsonData[0] is an array of headers
                 const rawHeaders = headers;
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (typeof row === 'object') {
                        const rowObject = {};
                         rawHeaders.forEach((header, index) => {
                            rowObject[header] = row[index] ?? '';
                        });
                        validJsonData.push(rowObject);
                    }
                }
            }
            const userId = req.user._id;  // Get the user ID from the request

            const uploadRecord = new Upload({
                filename: originalname,
                filePath: persistentFilePath,
                uploadDate: new Date(),
                data: validJsonData, // Use the cleaned data
                userId: userId, // Store the user ID
            });

            const savedUpload = await uploadRecord.save();

            await fs.unlink(tempFilePath); // Clean up the temporary file

            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: validJsonData,
                uploadId: savedUpload._id,
                headers: headers,
                filePath: persistentFilePath
            });
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            res.status(500).json({message: "error processing upload file"})
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

        const filePath = uploadRecord.filePath; // Retrieve the persistent file path
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file.' });
        }

        const labels = jsonData.map(item => item[xAxis]?.toString() || '');
        const dataValues = jsonData.map(item => Number(item[yAxis]) || 0);

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
        res.status(500).json({ message: 'Error analyzing data.', error });
    }
};

export const generateAllCharts = async (req, res) => {
    const { uploadId } = req.params;
    const { xAxis, yAxis } = req.body;
    const chartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'bubble', 'scatter', 'area'];
    const generatedChartUrls = [];

    try {
        const uploadRecord = await Upload.findById(uploadId);
        if (!uploadRecord) {
            return res.status(404).json({ message: 'Upload record not found.' });
        }

        const filePath = uploadRecord.filePath; // Retrieve the persistent file path
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!jsonData || jsonData.length === 0 || !jsonData[0].hasOwnProperty(xAxis) || !jsonData[0].hasOwnProperty(yAxis)) {
            return res.status(400).json({ message: 'No data found or selected columns missing in the uploaded file for generating charts.' });
        }

        const labels = jsonData.map(item => item[xAxis]?.toString() || '');
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
                generatedChartUrls.push({ url: chartUrl, type: chartType });
            } catch (renderError) {
                console.error(`Error rendering ${chartType} chart:`, renderError);
            }
        }

        res.status(200).json({ message: 'All charts generated successfully.', chartUrls: generatedChartUrls });

    } catch (error) {
        console.error('Error generating all charts:', error);
        res.status(500).json({ message: 'Error generating all charts.', error });
    }
};

// --- ADD THIS FUNCTION HERE ---
export const getUploadHistory = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have user authentication middleware that populates req.user
        const uploadHistory = await Upload.find({ userId }).sort({ uploadDate: -1 }); // Find uploads for the current user, sorted by date (newest first)
        res.status(200).json(uploadHistory);
    } catch (error) {
        console.error('Error fetching upload history:', error);
        res.status(500).json({ message: 'Failed to fetch upload history.', error: error.message });
    }
};
// --- END OF ADDED FUNCTION ---

export const deleteUpload = async (req, res) => {
    const { id } = req.params;
    try {
        const upload = await Upload.findByIdAndDelete(id);
        if (!upload) {
            return res.status(404).json({ message: 'Upload history not found.' });
        }
        res.status(200).json({ message: 'Upload history deleted successfully.' });
    } catch (error) {
        console.error('Error deleting upload history:', error);
        res.status(500).json({ message: 'Failed to delete upload history.', error: error.message });
    }
};