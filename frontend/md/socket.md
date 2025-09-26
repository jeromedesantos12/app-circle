# 📌 Catatan Integrasi Socket.IO dan React Query untuk Fitur Balasan (Reply)

Dokumen ini menjelaskan alur kerja dan solusi untuk masalah sinkronisasi data secara real-time menggunakan Socket.IO di backend dan React Query di frontend, khususnya untuk fitur penambahan balasan (reply) pada sebuah thread.

---

### 1. Backend: Memastikan Data yang Dikirim Socket Selalu Benar

**🚨 Masalah Awal:**
Query pada backend sebelumnya mengambil semua balasan dari sebuah `thread_id` dan hanya mengambil elemen pertama dari hasilnya (`[0]`). Hal ini berisiko menyebabkan data balasan yang dikirim (`emit`) melalui socket bukanlah balasan yang baru saja dibuat, terutama jika ada latensi atau race condition.

**✅ Solusi: Query Berdasarkan ID Balasan yang Baru Dibuat**
Untuk memastikan data yang dikirim adalah 100% benar, query diubah untuk mengambil balasan secara spesifik menggunakan `id` dari balasan yang baru saja berhasil disimpan ke database.

**Snippet Kode Backend (Prisma & Express):**

```javascript
// Ambil data reply yang baru saja dibuat, lengkap dengan data user
const rawReply = await prisma.$queryRawUnsafe(`
  SELECT
    R.id, U.photo_profile, U.full_name, U.username,
    R.content, R.image, R.created_at, R.created_by,
    R.updated_at, R.updated_by
  FROM "Reply" AS R
  JOIN "User" AS U ON R.user_id = U.id
  WHERE R.id = '''${createdReply.id}'''
`);

// Olah data mentah (misalnya menambahkan 'age' dengan dayjs)
const reply = {
  ...(rawReply as ReplyType[])[0],
  age: dayjs((rawReply as ReplyType[])[0].created_at).fromNow(),
};

// Kirim data reply terbaru ke semua client yang terhubung
io.emit("newReply", reply);

// Kirim response ke client yang melakukan request, sertakan data untuk fallback
res.status(201).json({
  status: "Success",
  message: `Create reply: ${content} success!`,
  data: reply,
});
```

---

### 2. Frontend: Memperbarui Cache React Query dengan Data dari Socket

**🤔 Tantangan:**
Data yang diterima dari endpoint (`getReplyById`) adalah sebuah array balasan (`ReplyType[]`). Namun, data yang diterima dari event socket (`newReply`) adalah sebuah objek balasan tunggal (`ReplyType`). Hal ini menyebabkan inkonsistensi tipe data saat memperbarui cache React Query.

**✅ Solusi: Konsistensi Tipe Data saat Update Cache**
Saat event `newReply` diterima, bungkus objek balasan tunggal tersebut ke dalam sebuah array (`[newReply]`) sebelum menggabungkannya dengan data cache yang lama (`oldData`).

**Snippet Kode Frontend (React Query & Socket.IO Client):**

```typescriptreact
socket.on("newReply", (newReply: ReplyType) => {
  queryClient.setQueryData<ReplyType[] | undefined>(
    repliesKeys.detail(id),
    (oldData) => {
      // Jika cache kosong, buat array baru dengan data dari socket
      if (!oldData) {
        return [newReply];
      }
      // Gabungkan data baru dengan data lama secara immutable
      return [newReply, ...oldData];
    }
  );
});
```

---

### 3. Pentingnya Immutability: `[newReply, ...oldData]` vs `.push()`

**❓ Kenapa tidak menggunakan `oldData.push(newReply)`?**

- `Array.prototype.push()` adalah operasi **mutasi**. Ia mengubah array asli secara langsung (in-place) dan mengembalikan panjang array yang baru.
- React Query (dan React pada umumnya) mendeteksi perubahan dengan membandingkan referensi data. Jika referensi array tidak berubah, React Query mungkin tidak akan mendeteksi adanya pembaruan, sehingga UI tidak akan di-render ulang.

**👍 Kenapa `[newReply, ...oldData]` adalah cara yang benar?**

- Sintaks _spread_ (`...`) ini membuat sebuah **array baru**. Referensi array yang baru ini berbeda dari `oldData`.
- Karena referensinya baru, React Query akan dengan pasti mendeteksi adanya perubahan, memperbarui cache, dan memicu re-render pada komponen yang menggunakan data tersebut.
- Alternatif aman lainnya yang juga bersifat _immutable_ adalah `[newReply].concat(oldData)`.

---

### 4. Bonus: Menjaga Konsistensi Urutan Data

Untuk memastikan urutan balasan selalu konsisten (terbaru di atas), baik saat pertama kali fetch data maupun saat menerima update dari socket, pastikan query di backend selalu menyertakan `ORDER BY`.

**Contoh Query di Backend:**

```sql
SELECT ... FROM "Reply" ... ORDER BY created_at DESC
```

Dengan ini, data yang ditampilkan di frontend akan selalu terurut dari yang paling baru.

---

### ⚡ Ringkasan

- **Backend**: Selalu kirim data terbaru dan paling akurat (berdasarkan ID) melalui socket.
- **Frontend**: Tangani data dari socket dan perbarui cache React Query secara _immutable_ untuk memastikan UI selalu sinkron.

Hasilnya adalah integrasi yang mulus antara Socket.IO dan React Query, menciptakan pengalaman pengguna yang real-time dan data yang selalu up-to-date. 🚀
