# Excel Analytics Platform (MERN Stack)

Welcome to the Excel Analytics Platform, a full-stack MERN application designed to help users upload Excel files, analyze their data, and generate various charts and insights. Users can manage their uploaded files, view analysis history, and manage their profile.

## Features

* **User Authentication:** Secure user registration, login, and session management.
* **Excel File Upload:** Easily upload `.xlsx` files for analysis.
* **Dynamic Data Analysis:** Select X and Y axes from uploaded data columns to generate specific charts (e.g., scatter, bar, line, pie).
* **Batch Chart Generation:** Generate multiple charts from a single dataset based on selected axes.
* **Chart Download:** Download generated charts as image files.
* **Upload History:** View a history of all uploaded files.
* **Delete Uploads:** Delete past uploaded files and their associated analysis records.
* **User Profile Management:** View user details including username, email, ID, role, creation date, and last login.
* **Account Deletion:** Option to permanently delete user account and associated data.
* **Responsive Dashboard:** A clean and intuitive user interface built with React and Tailwind CSS.

## Technologies Used

* **Frontend:**
    * **React.js:** JavaScript library for building user interfaces.
    * **Vite:** Fast development build tool for React.
    * **Tailwind CSS:** A utility-first CSS framework for styling.
    * **Axios:** Promise-based HTTP client for making API requests.
    * **React Router DOM:** For client-side routing.
    * **Heroicons:** A set of free MIT-licensed SVG icons.
* **Backend:**
    * **Node.js:** JavaScript runtime environment.
    * **Express.js:** Web application framework for Node.js.
    * **MongoDB:** NoSQL database for data storage.
    * **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
    * **Multer:** Middleware for handling `multipart/form-data`, primarily used for file uploads.
    * **xlsx (js-xlsx):** Library for parsing and writing Excel files.
    * **jsonwebtoken:** For implementing JSON Web Tokens for authentication.
    * **bcryptjs:** For hashing passwords.
    * **chartjs-node-canvas:** To generate chart images on the server-side.
    * **dotenv:** To manage environment variables.
    * **cors:** Node.js package for providing a Connect/Express middleware that can be used to enable CORS.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Live Links
- ** Backend API **:
[https://excel-analytics-platform.onrender.com] (https://excel-analytics-platform.onrender.com) 

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
