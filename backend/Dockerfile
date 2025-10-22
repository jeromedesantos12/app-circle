FROM node:trixie

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# build TypeScript dulu
RUN npm run build

# jalankan hasil build-nya
CMD ["node", "dist/app.js"]
