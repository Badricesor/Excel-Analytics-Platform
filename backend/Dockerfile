# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json from your backend directory
# to the working directory in the container.
# This is done separately to leverage Docker's caching,
# so npm install isn't re-run every time code changes.
COPY package.json package-lock.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your backend application code to the container
# The .dockerignore file (which we'll create next) will prevent node_modules from being copied
COPY . .

# Build client-side assets if necessary (e.g., if you had a build step for embedded UI)
# For a typical MERN backend, this line might not be strictly necessary
# RUN npm run build

# Expose the port your Express app runs on
EXPOSE 8080

# Define the command to run your application
# This maps to "npm start" which your package.json already defines
CMD ["npm", "start"]