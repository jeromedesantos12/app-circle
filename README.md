# 🐳 Docker Setup — Fullstack App (Backend + Frontend)

Dokumentasi ini menjelaskan langkah-langkah membuat dan menjalankan aplikasi Backend (Node.js + Prisma) serta Frontend (React + Vite) di dalam container Docker.

## 📦 1. Struktur Project
```
root/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

## ⚙️ 2. Backend Setup (Node.js + Prisma)

**`Dockerfile (backend/Dockerfile):`**
```dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]
```

Pastikan file `.env` di backend berisi:
```
DATABASE_URL="postgresql://user:password@db:5432/db_name"
```

> 💡 `db` di sini adalah nama service database di `docker-compose.yml`.

## ⚡ 3. Frontend Setup (React + Vite)

**`vite.config.ts`**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
```

**`Dockerfile (frontend/Dockerfile):`**
```dockerfile
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
```

## 🧩 4. Docker Compose Setup

**`docker-compose.yml`**
```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    container_name: app-backend
    ports:
      - "8080:8080"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/usr/src/app
    depends_on:
      - db

  frontend:
    build: ./frontend
    container_name: app-frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/usr/src/app
    depends_on:
      - backend

  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: db_name
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## 🚀 5. Menjalankan Aplikasi

Jalankan build image:
```bash
docker compose build
```

Jalankan semua container:
```bash
docker compose up
```

Akses aplikasi:
-   **Frontend**: `http://localhost:5173`
-   **Backend API**: `http://localhost:8080`

## 🛠️ 6. Troubleshooting Singkat

| Masalah                   | Solusi                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| `MODULE_NOT_FOUND` /src/app.js | Pastikan path `CMD` di Dockerfile sesuai file utama (`src/app.ts` atau `app.js`). |
| `DATABASE_URL` not found  | Tambahkan `.env` di backend dan pastikan `env_file` di-compose sudah benar.     |
| Frontend tidak bisa diakses | Pastikan `vite.config.ts` memiliki `host: true` agar bisa diakses dari luar container. |
| Port bentrok              | Ubah port mapping di Compose (`8081:8080` atau `5174:5173`).                     |

## ❤️ 7. Catatan Akhir

-   Kamu tidak wajib pakai `docker-compose` kalau BE & FE dijalankan terpisah manual, tapi Compose memudahkan sinkronisasi antar-container (BE–FE–DB).
-   Jika ingin menambah cache, Redis, atau service lain, cukup tambahkan di Compose.
-   Untuk development, bisa gunakan bind mount (`./frontend:/usr/src/app`) agar perubahan file langsung ter-update di container.
