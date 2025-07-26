# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

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
CMD ["cd", "server", "&&", "npm", "start"] 