# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies directly
RUN npm install
RUN cd server && npm install && cd ..
RUN cd client && npm install && cd ..

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Copy built client to server public directory
RUN mkdir -p server/public
RUN cp -r client/dist/* server/public/

# Expose port
EXPOSE 5000

# Start server
CMD ["sh", "-c", "cd server && npm start"] 