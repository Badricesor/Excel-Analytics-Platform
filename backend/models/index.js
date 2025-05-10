import mongoose from 'mongoose';
import UserSchema from './userModel.js';
import UploadSchema from './Upload.js';

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Upload = mongoose.models.Upload || mongoose.model('Upload', UploadSchema);

export { User, Upload };