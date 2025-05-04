import User from '../models/userModel.js';
import Upload from '../models/Upload.js';

// @desc    Get user profile
const getUserProfile = async (req, res) => {

  console.log('*** getUserProfile Controller Start ***');
  console.log('req.user:', req.user);
  
  try {
    const user = await User.findById(req.user.id).select('-password').populate('uploadHistory.fileId', 'filename originalname');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User profile fetched:', user);
    res.json(user);
    console.log('*** getUserProfile Controller End - Success ***');
  } catch (error) {
    console.error('*** getUserProfile Controller Error ***:', error);
    res.status(500).json({ message: error.message });
    console.log('*** getUserProfile Controller End - Error ***');
  }
};
// @desc    Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Optionally delete their uploads as well
    await Upload.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all uploads (admin only)
const getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find().populate('userId', 'username email');
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an upload (admin only)
// @route   DELETE /api/admin/uploads/:id
// @access  Private (Admin)
const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findByIdAndDelete(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    // Optionally delete the file from the server as well
    // fs.unlinkSync(upload.filePath);
    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getUserProfile, getAllUsers, deleteUser, getAllUploads, deleteUpload };