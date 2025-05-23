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
  // It's highly recommended to uncomment and use the more secure dynamic origin check for production
  origin: (origin, callback) => {
      console.log('Request Origin:', origin); 
      const allowedOrigins = ['http://localhost:5173', 'https://excel-analytics-platform.onrender.com']; 
      if (allowedOrigins.includes(origin) || !origin) { 
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
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

