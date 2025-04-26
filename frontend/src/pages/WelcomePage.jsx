import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router for navigation


function WelcomePage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate a fade-in effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500); // Adjust delay as needed

    // Redirect to signup page after a delay
    const redirectTimer = setTimeout(() => {
      navigate('/Excel-Analytics-Platform/signup'); // Replace '/signup' with your actual signup route
    }, 3000); // Adjust delay before redirect

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="bg-gray-900 dark:bg-black-800 flex flex-col items-center justify-center h-screen">
      <div className="mb-6">
        <img src="logo.png" alt="Logo" className="h-24 w-auto" /> {/* Adjust logo size as needed */}
      </div>
      <div className={`text-white dark:text-gray-200 text-[24px] font-semibold transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        Excel Analytics Platform
      </div>
    </div>
  );
}

export default WelcomePage;