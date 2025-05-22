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
import { fileURLToPath } from 'url';
import { dirname } from 'path';

console.log("current env: ",process.env.NODE_ENV);

const app= express()
// const __dirname = path.resolve(); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure CORS to allow requests from your frontend's origin
const corsOptions = {
//      origin: (origin, callback) => {
//     console.log('Request Origin:', origin); // Log the incoming origin
//     const allowedOrigins = ['http://localhost:5173', 'https://excel-analytics-platform.onrender.com'];
//     if (allowedOrigins.includes(origin) || !origin) { // !origin allows same-origin requests in dev
//       callback(null, true);
//     } else {
//        callback(new Error('Not allowed by CORS'));
// }
// },
origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    allowedHeaders: 'Content-Type, Authorization, *', 
  };

//Middleware
app.use(express.json())
app.use(cors(corsOptions));

const UPLOADS_DIR = path.join(__dirname, 'uploads');

//Routes
app.use('/api/version1/auth',authroutes)
app.use('/api/version1', uploadRoutes);
app.use('/api/version1/users', userRoutes);
app.use('/api/version1/admin', adminRoutes);

// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(UPLOADS_DIR));

const PORT= process.env.PORT || 8080

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    connectDb()
})

