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

        const tempFilePath = req.file.path;
        const originalName = req.file.originalname;

        try {
            const workbook = XLSX.readFile(tempFilePath);
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const userId = req.user._id;

            // Construct a persistent file path
            const persistentFilename = `excel-${Date.now()}-${userId}${path.extname(originalName)}`;
            const persistentFilePath = path.join(EXCEL_UPLOAD_DIR, persistentFilename);

            // Read the file from the temporary location
            const fileData = await fs.readFile(tempFilePath);

            // Save the file to the persistent location
            await fs.writeFile(persistentFilePath, fileData);

            const uploadRecord = new Upload({
                filename: originalName,
                filePath: persistentFilePath, // Store the persistent file path
                uploadDate: new Date(),
                data: jsonData,
                userId: userId,
            });

            const savedUpload = await uploadRecord.save();

            await fs.unlink(tempFilePath); // Clean up the temporary file

            res.status(200).json({
                message: 'File uploaded and processed successfully',
                data: jsonData,
                uploadId: savedUpload._id,
                headers: Object.keys(jsonData[0] || {}),
            });

        } catch (error) {
            console.error('Error processing uploaded file:', error);
            res.status(500).json({ message: 'Error processing uploaded file.', error });
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
                generatedChartUrls.push(chartUrl);
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