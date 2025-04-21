import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from "cors";
import authroutes from "./routes/authRoutes.js"
import  connectDb  from './config/db.js';


console.log("current env: ",process.env.NODE_ENV);

const app= express()

const PORT= process.env.PORT || 8080

app.use(express.json())
app.use(cors())

app.use('/api/version1/auth',authroutes)

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
    connectDb()
})

