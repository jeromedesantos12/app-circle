# Sinkronisasi Komentar (Replies) dengan Redux + WebSocket

## 📌 Latar Belakang

Aplikasi punya dua halaman utama:

- **Threads (Home)** → list semua thread.
- **ThreadID (Detail)** → detail thread + daftar komentar (reply).

### Masalah awal:

- Angka `number_of_replies` beda-beda antara list & detail.
- Kalau ada user bikin komentar baru → detail naik, tapi list nggak ikut naik.

👉 **Akibatnya, data kelihatan nggak konsisten.**

## ✅ Solusi

Gunakan **Socket.IO + Redux** → biar `number_of_replies` selalu update real-time di semua tempat.

## 🛠️ Perubahan yang Dilakukan

### 1. Backend (Express + Prisma)

Saat user bikin komentar baru (`postReplies`):

```javascript
const totalReplies = await prisma.reply.count({
  where: { thread_id },
});

io.emit("newReply", {
  ...reply, // data komentar baru
  thread_id, // id thread
  totalReplies, // jumlah komentar terbaru
});
```

📌 **Artinya:**

1.  Server simpan komentar.
2.  Server hitung ulang jumlah total reply (`totalReplies`).
3.  Server broadcast event `newReply` ke semua client.

### 2. Redux Slice

#### `threadsSlice.ts`

Update jumlah reply di list thread:

```typescript
updateRepliesCount: (
  state,
  action: PayloadAction<{ threadId: string; count: number }>
) => {
  state.data = state.data.map((thread) =>
    thread.id === action.payload.threadId
      ? { ...thread, number_of_replies: action.payload.count }
      : thread
  );
},
```

👉 Jadi angka komentar di halaman **Threads (list)** ikut update.

#### `threadByIdSlice.ts`

Hapus cara lama `incrementRepliesCount` (cuma `+1` manual).
Ganti sinkronisasi dengan angka asli dari backend:

```typescript
setRepliesCount: (
  state,
  action: PayloadAction<{ threadId: string; count: number }>
) => {
  if (state.data && state.data.id === action.payload.threadId) {
    state.data.number_of_replies = action.payload.count;
  }
},
```

👉 Jadi angka komentar di halaman **ThreadID (detail)** ikut update.

### 3. Frontend (Socket Listener)

#### Di `ThreadID.tsx` (detail thread)

```typescript
socket.on(
  "newReply",
  (newReply: ReplyType & { thread_id: string; totalReplies: number }) => {
    dispatch(addReplies(newReply)); // tambah komentar baru ke list
    dispatch(
      setRepliesCount({
        threadId: newReply.thread_id,
        count: newReply.totalReplies,
      })
    ); // update angka di detail
    dispatch(
      updateRepliesCount({
        threadId: newReply.thread_id,
        count: newReply.totalReplies,
      })
    ); // update angka di list
  }
);
```

#### Di `Threads.tsx` (list thread)

```typescript
socket.on(
  "newReply",
  (payload: { thread_id: string; totalReplies: number }) => {
    dispatch(
      updateRepliesCount({
        threadId: payload.thread_id,
        count: payload.totalReplies,
      })
    );
  }
);
```

## 🔄 Alur Lengkap (Step by Step)

1.  User nulis komentar → klik submit.
2.  Backend simpan komentar baru di DB.
3.  Backend hitung ulang total reply di thread itu.
4.  Backend broadcast event `newReply` dengan data:
    - isi komentar baru (reply)
    - `thread_id`
    - jumlah komentar terbaru (`totalReplies`)
5.  Frontend (`ThreadID` & `Threads`) dengar event `newReply`.
6.  Redux update di 2 tempat:
    - `threadById` → update daftar komentar + angka reply.
    - `threads` → update angka reply di list.
7.  UI di semua halaman langsung sinkron real-time, tanpa refresh.

## 🎯 Hasil Akhir

- Angka `number_of_replies` selalu konsisten di list & detail.
- Angka update real-time (langsung berubah begitu ada komentar baru).
- Tidak ada lagi bug “+1 palsu” → karena angka diambil langsung dari backend (`totalReplies`).
