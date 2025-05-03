import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../public/logo.png'; // Adjust path if your logo is in a different location

const Header = () => {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {logo && <img src={logo} alt="Logo" className="h-8 w-auto mr-4" />}
        <h1 className="text-xl font-semibold text-blue-500">Excel Analytics Platform</h1>
      </div>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link to="/user/dashboard" className="text-gray-700 hover:text-blue-500">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/analysis" className="text-gray-700 hover:text-blue-500">
              Analysis
            </Link>
          </li>
          <li>
            <Link to="/upload-history" className="text-gray-700 hover:text-blue-500">
              History
            </Link>
          </li>
          <li>
            <Link to="/profile" className="text-gray-700 hover:text-blue-500">
              Profile
            </Link>
          </li>
          {/* Add more menu items as needed */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;