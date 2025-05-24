import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from "cors";
import authroutes from "./routes/authRoutes.js"
import  connectDb  from './config/db.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';

console.log("current env: ",process.env.NODE_ENV);

const app= express()

// Configure CORS to allow requests from your frontend's origin
const corsOptions = {
    origin: (origin, callback) => {
        console.log('Request Origin:', origin); // Crucial for debugging on Render logs
        const allowedOrigins = [
            'http://localhost:5173', // For local development
            'https://excel-analytics-platform-frontend-w56n.onrender.com' // Your deployed frontend
        ];

        // If no origin is provided (e.g., same-origin requests, or tools like Postman)
        if (!origin) {
            console.log('Origin is null/undefined. Allowing request.');
            return callback(null, true);
        }

        // Check if the request origin is in our allowed list
        if (allowedOrigins.includes(origin)) {
            console.log(`Origin ${origin} is allowed.`);
            return callback(null, true);
        } else {
            console.log(`Origin ${origin} NOT allowed by CORS. Expected one of: ${allowedOrigins.join(', ')}`);
            // If it's not allowed, create an error.
            return callback(new Error('Not allowed by CORS'));
        }
    },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, *',
};

//Middleware
app.use(express.json())
app.use(cors(corsOptions));

//Routes
app.use('/api/version1/auth',authroutes)
app.use('/api/version1', uploadRoutes);
app.use('/api/version1/users', userRoutes);
app.use('/api/version1/admin', adminRoutes);

const PORT= process.env.PORT || 8080

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    connectDb()
})

