import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Signup } from "./pages/Signup.jsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Excel-Analytics-Platform/signup" element={<Signup/>} />
        
      </Routes>
    </Router>
  );
}

export default App;
