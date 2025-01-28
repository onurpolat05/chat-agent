# Build stage
FROM node:18.20.5 as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18.20.5

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy environment variables if needed
COPY .env ./

# Expose the port your application runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 