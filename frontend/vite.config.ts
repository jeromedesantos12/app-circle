import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // biar bisa diakses dari luar container
    port: 5173, // pastikan sama kayak yang di docker-compose.yml
    watch: {
      usePolling: true, // penting di Docker agar perubahan file tetap terdeteksi
    },
  },
});
