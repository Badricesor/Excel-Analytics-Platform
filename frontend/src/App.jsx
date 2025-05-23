import { Routes, Route } from 'react-router-dom';
import React from 'react';
import Signup from './pages/Signup.jsx';
import UserDashboard from './pages/userDashboard.jsx';
import Login from './pages/Login.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; // Import it
import AdminProtectedRoute from './components/AdminprotectedRoute.jsx'; // Import it

function App() {
  return (
    <AuthProvider>
   
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    
    </AuthProvider>
  );
}

export default App;