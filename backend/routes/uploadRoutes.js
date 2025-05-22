import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile, analyzeData, generateAllCharts,getUploadHistory, deleteUpload} from '../controllers/uploadController.js';
import cors from 'cors';

const router = express.Router();

const corsOptions = {
    origin: 'http://localhost:5173', // For development
    // origin: 'your-frontend-deployed-url.com', // For production
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  };
  
  router.use(cors(corsOptions));

router.post('/upload', protect, uploadFile);

router.post('/analyze/:uploadId', protect, analyzeData);
// router.post('/:uploadId/generate-all-charts', generateAllCharts);
router.post('/uploads/:uploadId/generate-all-charts', protect, generateAllCharts);
// router.post('/uploads/:uploadId/generate-all-charts-data', protect, generateAllChartsData);
router.get('/uploads/history', protect, getUploadHistory); // **ENSURE THIS LINE EXISTS AND IS CORRECT**
router.delete('/uploads/:id', protect, deleteUpload);

export default router;