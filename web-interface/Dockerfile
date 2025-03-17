# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose gRPC port
EXPOSE 50051

# Start the gRPC server
CMD ["npm", "run", "server"]
