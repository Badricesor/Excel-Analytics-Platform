import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    uploadHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }],
    analysisHistory: [
      {
        uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
        xAxis: String,
        yAxis: String,
        chartType: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Conditional model definition to prevent OverwriteModelError
let User;

if (mongoose.models.User) {
  // If the 'User' model has already been compiled, use the existing one
  User = mongoose.model('User');
} else {
  // If the 'User' model has not been compiled yet, define and compile it
  User = mongoose.model('User', userSchema);
}

export default User;