import bcryptjs from "bcryptjs";
import {User} from "../models/userModel.js"
import { generateToken } from "../utils/generateToken.js";

export async function signup(req,res){

    const {username,email,password,role}=req.body

    try {
        if(!username || !email || !password || !role){
            return res.status(400).json({success:false,message:"All fields required"})
        }

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if(!emailRegex.test(email)){
            return res.status(400).json({success:false,message:"invalid email"})
        }

        if(password.length<8){
            return res.status(400).json({success:false,message:"password must be atleast 8 characters"})
        }

        const existingEmail= await User.findOne({email:email})
        if(existingEmail){
            return res.status(400).json({success:false,message:"email already exists"})
        }

        const existingUsername= await User.findOne({username:username})
        if(existingUsername){
            return res.status(400).json({success:false,message:"username already exists"})
        }

        const salt= await bcryptjs.genSalt(10)
        const hashedpassword= await bcryptjs.hash(password,salt)

        const newUser= new User({
            username,
            email,
            password:hashedpassword,
            role
        })

        generateToken(newUser._id,role)

        await newUser.save()

        res.status(201).json({
            success:true,
            user:{
                ...newUser. _doc,
                password:"",
            }
        })

    } catch (error) {
        console.log("error in signup controller",error.message);
        res.status(500).json({success:false,message:"internal server error"})       
    }
}