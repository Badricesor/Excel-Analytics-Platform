import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import  Signup  from "./pages/Signup.jsx"
import  UserDashboard  from './pages/userDashboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Excel-Analytics-Platform/signup" element={<Signup/>} />
        <Route path="/Excel-Analytics-Platform/dashboard" element={<UserDashboard/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
