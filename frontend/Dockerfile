# Gunakan image Node resmi
FROM node:trixie

# Set working directory
WORKDIR /usr/src/app

# Copy file dependency
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua source code
COPY . .

# Expose port Vite default: 5173
EXPOSE 5173

# Jalankan Vite dev server
CMD ["npm", "run", "dev"]
