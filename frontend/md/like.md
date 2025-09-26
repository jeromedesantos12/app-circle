❤️ Sistem Like Toggle dengan Redux + WebSocket

Proyek ini mengimplementasikan fitur Like / Unlike pada thread dengan update real-time (langsung berubah di semua user) menggunakan WebSocket (Socket.IO) dan Redux.

🚩 Masalah Awal

Sebelum pakai Redux + Socket, masalahnya gini:

- **Like hilang setelah refresh**
  Karena disimpan cuma di state React lokal.
  Begitu halaman di-refresh → balik lagi ke angka awal.

- **Angka Like beda-beda di list dan detail thread**
  Contoh: di halaman list kelihatan 5 like, di halaman detail kelihatan 6 like.
  Karena datanya nggak sinkron.

- **User lain nggak lihat perubahan Like**
  Misalnya kamu nge-like, user lain yang buka thread yang sama nggak lihat perubahannya.
  Karena WebSocket nggak dipakai dengan benar.

- **Struktur state jelek**
  Like cuma disimpan di satu variabel → jadi nggak bisa tahu per thread.

💡 Solusi

1. Simpan likes per thread dengan `Record<string, number>`

Kita bikin state global khusus untuk likes.
Bentuknya dictionary (kamus), key-nya `threadId`, value-nya jumlah like.

```typescript
byThread: {} as Record<string, number>
```

📌 Artinya:

- `threadId` = ID thread (string, contoh "thread1")
- `number` = jumlah like (contoh 5)

Contoh isi state:

```json
{
  "thread1": 5,
  "thread2": 10
}
```

2. Aksi Redux untuk Like

```typescript
setLikes: (state, action: PayloadAction<{ threadId: string; count: number }>) => {
  const { threadId, count } = action.payload;
  state.byThread[threadId] = count;
},

removeLikes: (state, action: PayloadAction<string>) => {
  delete state.byThread[action.payload];
},
```

- `setLikes` → update jumlah like di thread tertentu.
- `removeLikes` → hapus entry thread (dipakai kalau thread dihapus).

3. Ambil data likes dari Redux (Selector)

```typescript
const likes = useSelector(
  (state: RootState) => state.likes.byThread[id] ?? number_of_likes
);
```

Artinya:

- Cari jumlah like di Redux `byThread[id]`.
- Kalau belum ada (undefined), pakai `number_of_likes` dari fetch awal API.

4. Update real-time via WebSocket

```typescript
socket.on("newLike", (payload: { thread_id: string; count: number }) => {
  dispatch(setLikes({ threadId: payload.thread_id, count: payload.count }));
});

socket.on("deleteLike", (payload: { thread_id: string; count: number }) => {
  dispatch(setLikes({ threadId: payload.thread_id, count: payload.count }));
});
```

📌 Jadi kalau backend broadcast event:

- Semua user yang buka thread sama → langsung lihat angka likes update.
- Gak perlu refresh halaman.

5. Backend Toggle Like

```typescript
const isExist = await prisma.like.findFirst({ where: { thread_id, user_id } });

if (isExist) {
  // Kalau user sudah like → unlike
  await prisma.like.deleteMany({ where: { thread_id, user_id } });
  io.emit("deleteLike", { thread_id, count: newCount });
} else {
  // Kalau belum like → kasih like baru
  await prisma.like.create({ data: { thread_id, user_id } });
  io.emit("newLike", { thread_id, count: newCount });
}
```

🎯 Alur Lengkap (Step by Step Orang Awam)

1.  Kamu klik tombol ❤️ di sebuah thread.
2.  Frontend kirim request ke backend.
3.  Backend cek:
    - Kalau kamu sudah pernah like → hapus (jadi Unlike).
    - Kalau kamu belum pernah like → tambahin (jadi Like).
4.  Backend hitung ulang total likes.
5.  Backend broadcast event ke semua client lewat WebSocket.
6.  Frontend tiap user nerima event itu → Redux `setLikes` update angka like.
7.  UI otomatis berubah, semua orang lihat angka terbaru tanpa refresh. 🎉

📌 Inti Pentingnya

- `Record<string, number>` dipakai biar gampang mapping `threadId` → jumlah `likes`.
- Pakai Redux supaya angka konsisten di list thread dan detail thread.
- Pakai Socket.IO supaya angka update di semua user real-time.
