FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 6969

# Start the application
CMD ["node", "server.js"]
