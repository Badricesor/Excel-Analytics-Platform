import mongoose from "mongoose";

const userSchema= mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required:true,
    },
    role:{
        type: String,
        enum:["user","admin"],
        default:"user"
    },
    uploadHistory: [
        {
          fileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Upload',
          },
          analysisDetails: Object, // Store details of analysis performed
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
}
)

export const User= mongoose.model("User",userSchema)