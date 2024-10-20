# Use Node.js official image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript files (if necessary, but for development ts-node-dev is enough)
RUN npm run build

# Expose the port on which the app will run
EXPOSE 5000

# Command to start the app
CMD ["npm", "run", "dev"]
