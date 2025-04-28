import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFile, analyzeData } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', protect, uploadFile);
router.post('/analyze/:uploadId', protect, analyzeData);

export default router;