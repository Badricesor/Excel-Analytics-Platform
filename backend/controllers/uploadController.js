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
            scales: { // Define scales here
                x: {
                    type: 'category', // Default to 'category' for x-axis
                    title: {
                        display: true,
                        text: xAxis
                    }
                },
                y: {
                    type: 'linear',   // Default to 'linear' for y-axis
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: yAxis
                    }
                }
            },
            // Add more common options here as needed
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
                options: pieDoughnutOptions, // Use the defined options
            };
        case 'radar':
            console.log("Radar jsonData:", jsonData);
            console.log("Radar xAxis:", xAxis, "Radar yAxis:", yAxis);
            return {
                ...baseConfig,
                type: 'radar',
                data: {
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
        case 'area': // Handle 'area' chart type
            return {
                ...baseConfig,
                type: 'line', // Area charts are based on line charts
                data: {
                    labels: labels,
                    datasets: [{
                        ...baseConfig.data.datasets[0],
                        borderColor: 'rgba(26, 188, 156, 0.8)',
                        backgroundColor: 'rgba(26, 188, 156, 0.4)', // Add background color for the area fill
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
        } finally {
            await fs.unlink(filePath); // Clean up the temporary file
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