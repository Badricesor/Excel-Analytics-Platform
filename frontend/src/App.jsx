import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import React from 'react';
import  Signup  from "./pages/Signup.jsx"
import  UserDashboard  from './pages/UserDashboard.jsx';
import Login from './pages/Login.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AuthContext from './context/AuthContext.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
       <Route path="/Excel-Analytics-Platform" element={<WelcomePage/>} /> 
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/user/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

const AdminProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

export default App;
