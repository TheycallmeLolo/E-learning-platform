FROM node:18-alpine

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
