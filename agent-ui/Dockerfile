# Build stage
FROM node:18.20.5 as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

#set env variables
ENV REACT_APP_API_URL=https://tw-dashboard.vercel.app/api

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
COPY --from=builder /app/build ./build

FROM nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html

COPY ./default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# docker build -t agent-ui .
# docker run -d -p 80:80 --name agent-ui agent-ui
# docker stop agent-ui
# docker rm agent-ui
# docker rmi agent-ui