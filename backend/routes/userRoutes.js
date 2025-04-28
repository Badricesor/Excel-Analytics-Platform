import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserProfile, getAllUsers, deleteUser } from '../controllers/userController.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/admin/users', protect, admin, getAllUsers);
router.delete('/admin/users/:id', protect, admin, deleteUser);

export default router;