# 🚀 Implementasi WebSocket di Proyek Sosmed 🚀

Dokumen ini menjelaskan konsep, kegunaan, dan langkah-langkah implementasi WebSocket pada proyek ini.

---

### Apa itu WebSocket? 🤔

Bayangkan komunikasi web standar (HTTP) itu seperti mengirim surat. Kamu mengirim permintaan (surat), lalu menunggu balasan. Gak bisa real-time kan?

Nah, **WebSocket** itu seperti telepon 📞! Sekali koneksi terhubung, kamu dan server bisa saling "bicara" (kirim data) secara langsung, dua arah, dan terus-menerus tanpa harus membuat permintaan baru setiap saat.

Secara teknis, WebSocket adalah protokol komunikasi yang menyediakan kanal komunikasi **full-duplex** (dua arah) melalui satu koneksi TCP yang berjalan lama.

---

### Kegunaannya Apa Aja Sih? 💡

Dengan kemampuannya yang real-time, WebSocket sangat cocok untuk fitur-fitur interaktif. Untuk proyek sosmed kita, kegunaannya bisa untuk:

-   **Notifikasi Real-Time** 🔔: Memberi tahu user secara langsung saat ada like, komentar, atau follower baru tanpa perlu me-refresh halaman.
-   **Live Chat/Messaging** 💬: Membangun fitur obrolan yang cepat dan responsif.
-   **Fitur "User is Typing..."** ✍️: Menampilkan indikator saat user lain sedang mengetik balasan komentar atau pesan.
-   **Update Feed Otomatis** 🔄: Menampilkan postingan baru di feed teman secara real-time.

---

### Instalasi & Konfigurasi 🛠️

Berikut cara instalasi dan konfigurasi `socket.io` (library populer untuk WebSocket) di proyek kita.

#### 1. Backend (Express.js)

**a. Instalasi**

Buka terminal di direktori `backend/` dan jalankan:

```bash
# Jika menggunakan npm
npm install socket.io

# Jika menggunakan bun
bun add socket.io
```

**b. Konfigurasi**

Kita perlu mengubah `backend/src/app.ts` untuk mengintegrasikan `socket.io` dengan server Express.

```typescript
// d:\Job Desk\Web Programming\clone\sosmed\backend\src\app.ts

import express, { Express } from "express";
import cors from "cors";
// Impor modul http dan Server dari socket.io
import http from "http";
import { Server } from "socket.io";

import router from "./routes/error";
import { corsOptions } from "./utils/cors";
import { rateLimit } from "./utils/rate-limit";

const app: Express = express();
const port: number = 3000;

// Buat server HTTP dari aplikasi Express
const server = http.createServer(app);

// Inisialisasi socket.io dengan server HTTP
const io = new Server(server, {
  cors: corsOptions, // Gunakan cors options yang sama
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit);

app.use("/api/v1", router);

// Logika koneksi WebSocket
io.on("connection", (socket) => {
  console.log("✅ User terhubung dengan socket id:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User terputus dari socket");
  });

  // Tambahkan event listener lainnya di sini
  // contoh: socket.on('new_thread', (data) => { ... })
});

// Gunakan `server.listen` bukan `app.listen`
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

```

#### 2. Frontend (React)

**a. Instalasi**

Buka terminal di direktori `frontend/` dan jalankan:

```bash
# Jika menggunakan npm
npm install socket.io-client

# Jika menggunakan bun
bun add socket.io-client
```

**b. Implementasi di Komponen**

Untuk menerima data secara real-time, kita bisa mengimplementasikan koneksi `socket.io-client` langsung di dalam komponen React. Contohnya pada komponen `Threads` yang menampilkan daftar postingan, kita ingin postingan baru dari user lain muncul secara otomatis.

Berikut adalah implementasi praktisnya di dalam file `frontend/src/components/organisms/Threads.tsx`:

```typescript
// d:\Job Desk\Web Programming\clone\sosmed\frontend\src\components\organisms\Threads.tsx

import { useEffect } from "react";
import { io } from "socket.io-client";
import { queryClient } from "@/lib/queryClient"; // Pastikan path import benar
import { threadsKeys } from "../../queries/threads";
import type { ThreadType } from "../../types/thread";

// Ambil URL socket dari environment variables
const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function Threads() {
  // ... (logika fetching data awal dengan useQuery)

  useEffect(() => {
    // 1. Membuat koneksi ke server socket
    const socket = io(socketURL, {
      withCredentials: true, // Mengizinkan pengiriman cookie/kredensial
    });

    // 2. Mendengarkan event 'newThread' dari server
    socket.on("newThread", (newThread: ThreadType) => {
      // 3. Update data di cache React Query secara optimis
      queryClient.setQueryData<ThreadType[]>(threadsKeys.all, (oldData) => {
        // Jika cache kosong, buat array baru
        if (!oldData) {
          return [newThread];
        }
        // Tambahkan thread baru di awal array data yang sudah ada
        return [newThread, ...oldData];
      });
    });

    // 4. Membersihkan koneksi saat komponen di-unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Array dependensi kosong memastikan efek ini hanya berjalan sekali

  // ... (JSX untuk render komponen)
}
```

**Penjelasan Alur:**

1.  **Koneksi**: Saat komponen `Threads` pertama kali di-render, `useEffect` akan membuat koneksi ke server WebSocket. Opsi `withCredentials: true` disertakan untuk proses otentikasi.
2.  **Mendengarkan**: `socket.on("newThread", ...)` membuat listener yang akan menunggu event `"newThread"` dari server.
3.  **Update UI**: Ketika event diterima, `queryClient.setQueryData` langsung memperbarui data di cache React Query. Ini akan secara otomatis memicu re-render pada komponen yang menggunakan data tersebut, sehingga thread baru akan muncul di UI secara instan.
4.  **Cleanup**: Saat user meninggalkan halaman (komponen `unmount`), fungsi `socket.disconnect()` akan dipanggil untuk menutup koneksi dan mencegah kebocoran memori.

Pendekatan ini menunjukkan cara efektif mengintegrasikan data real-time dari WebSocket dengan *state management* modern seperti React Query untuk menciptakan pengalaman pengguna yang dinamis.

---

### Alur Programnya Gimana? 🌊

Mari kita simulasikan alur untuk notifikasi "like" baru.

1.  **Koneksi Awal**:
    -   User membuka aplikasi React.
    -   `socket.connect()` dijalankan di frontend.
    -   Backend di `io.on("connection", ...)` menerima koneksi baru dan mencatat `socket.id` user tersebut.

2.  **User A Memberi Like**:
    -   User A menekan tombol "like" pada sebuah postingan.
    -   Fungsi `handleLike()` di frontend dipanggil.
    -   Selain mengirim request `POST` ke API untuk menyimpan data like, kita juga mengirim event WebSocket.
    -   `socket.emit("new_like", { postId: 123, user: "User A" });`

3.  **Server Menerima & Memproses**:
    -   Backend memiliki listener untuk event `new_like`.
    -   `socket.on("new_like", (data) => { ... })`
    -   Server kemudian menyiarkan (broadcast) event ini ke semua user lain (atau hanya ke user pemilik postingan).
    -   `socket.broadcast.emit("like_notification", { message: "User A menyukai postingan Anda!" });`

4.  **User B Menerima Notifikasi**:
    -   Di frontend semua user (termasuk User B), ada listener yang selalu "mendengar".
    -   `socket.on("like_notification", (data) => { ... })`
    -   Ketika event ini diterima, frontend akan menampilkan notifikasi (misalnya, popup kecil atau mengubah angka di ikon lonceng).

Selesai! Notifikasi terkirim secara real-time tanpa perlu refresh.

Selamat mencoba! 🎉
