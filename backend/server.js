// server.js (backend)

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from "cors";
import authroutes from "./routes/authRoutes.js"
import connectDb from './config/db.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';

console.log("Current env: ", process.env.NODE_ENV);
console.log("Backend service starting up...");

const app = express();

// Configure CORS to allow requests from your frontend's origin
const corsOptions = {
    origin: (origin, callback) => {
        console.log('Request Origin:', origin);
        const allowedOrigins = [
            'http://localhost:5173', // For local development
            'https://excel-analytics-platform-frontend-w56n.onrender.com' // Your deployed frontend
        ];

        if (!origin) {
            console.log('Origin is null/undefined. Allowing request.');
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            console.log(`Origin ${origin} is allowed.`);
            return callback(null, true);
        } else {
            console.log(`Origin ${origin} NOT allowed by CORS. Expected one of: ${allowedOrigins.join(', ')}`);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, *',
};

// Middleware
app.use(express.json());

// Apply the standard CORS middleware
app.use(cors(corsOptions));

// *** NEW AGGRESSIVE CORS OVERRIDE (Attempt to force the header) ***
app.use((req, res, next) => {
    // Only set this if it's an actual request from your frontend
    const frontendOrigin = 'https://excel-analytics-platform-frontend-w56n.onrender.com';
    if (req.headers.origin === frontendOrigin) {
        res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
        console.log(`Forcing Access-Control-Allow-Origin to: ${frontendOrigin}`);
    }
    // This is crucial for preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, *');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204); // No Content
    }
    next();
});
// *** END NEW AGGRESSIVE CORS OVERRIDE ***


// Routes
app.use('/api/version1/auth', authroutes);
app.use('/api/version1', uploadRoutes);
app.use('/api/version1/users', userRoutes);
app.use('/api/version1/admin', adminRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDb();
});