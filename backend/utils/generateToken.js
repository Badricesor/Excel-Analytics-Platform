import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


export const generateToken= (userId,role)=>{
    return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
    
}