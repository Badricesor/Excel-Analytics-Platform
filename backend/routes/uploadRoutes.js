import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadController, analyzeData } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload', protect, uploadController);

router.post('/analyze/:uploadId', protect, analyzeData);

export default router;