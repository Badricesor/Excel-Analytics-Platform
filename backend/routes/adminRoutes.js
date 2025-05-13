import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { getAllUploads, deleteUpload, getUsers } from '../controllers/userController.js'; // Note: Using userController for admin uploads

const router = express.Router();

router.get('/users', protect, admin, getUsers); // Add this line
router.get('/uploads', protect, admin, getAllUploads);
router.delete('/uploads/:id', protect, admin, deleteUpload);

export default router;