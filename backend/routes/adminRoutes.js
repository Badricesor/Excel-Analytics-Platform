import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { getAllUploads, deleteUpload } from '../controllers/userController.js'; // Note: Using userController for admin uploads

const router = express.Router();

router.get('/uploads', protect, admin, getAllUploads);
router.delete('/uploads/:id', protect, admin, deleteUpload);

export default router;