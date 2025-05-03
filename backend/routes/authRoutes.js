import express from "express";
import { login, signup, socialLogin } from "../controllers/authController.js";




const router= express.Router()

router.post('/signup',signup)
router.post('/login', login);
router.post('/social-login', socialLogin);

export default router;