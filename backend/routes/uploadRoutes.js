import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile, analyzeData } from '../controllers/uploadController.js';
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

export default router;