# 🐘 Panduan Kalkulasi Waktu di PostgreSQL

Dokumen ini berisi panduan untuk menangani kalkulasi waktu di PostgreSQL, khususnya untuk menghitung umur sebuah data berdasarkan timestamp `created_at`.

---

## 💡 Solusi Error Umum Prisma & Raw Query

Saat menggunakan `.$queryRaw` di Prisma, Anda mungkin menghadapi error deserialisasi karena Prisma tidak mengenali beberapa tipe data spesifik dari PostgreSQL. Berikut adalah beberapa error umum dan solusinya.

### 1. Error Tipe Data `interval`

- **Error:** `Failed to deserialize column of type 'interval'. ... try casting this column to any supported Prisma type such as 
`String
  `.`
- **Penyebab:** Operasi seperti `NOW() - created_at` menghasilkan tipe data `interval` yang tidak didukung langsung oleh Prisma.
- **Solusi:** Ubah (`cast`) `interval` menjadi `text` (string) di dalam query.

**Contoh:**

```sql
-- Sebelum
SELECT NOW() - created_at AS age_interval

-- Sesudah
SELECT (NOW() - created_at)::text AS age_interval
```

### 2. Error Tipe Data `BigInt`

- **Error:** `TypeError: Do not know how to serialize a BigInt`
- **Penyebab:** Fungsi agregat seperti `COUNT()` menghasilkan tipe `bigint`. Prisma mengubahnya menjadi `BigInt` di JavaScript, yang tidak bisa diproses oleh `JSON.stringify()` secara default.
- **Solusi:** Ubah (`cast`) `bigint` menjadi `integer` (atau `int`) di dalam query.

**Contoh:**

```sql
-- Sebelum
SELECT COUNT(id) AS number_of_likes

-- Sesudah
SELECT COUNT(id)::int AS number_of_likes
```

---

## ⏳ Menghitung Waktu Sejak Dibuat dengan `AGE()`

Saat Anda perlu mengetahui sudah berapa lama sebuah data dibuat, fungsi `AGE()` dari PostgreSQL sangatlah berguna. Fungsi ini menghitung interval antara sebuah timestamp dan waktu sekarang (`NOW()`)
.

Hasil dari `AGE()` dikembalikan sebagai tipe data `interval`.

```sql
SELECT AGE(created_at) FROM task12."Thread";
-- atau --
SELECT NOW() - created_at FROM task12."Thread";
```

### 🕒 Kasus 1: Interval **Kurang Dari 1 Hari**

Jika Anda mendapatkan hasil seperti `21:40:15.181`, artinya adalah:

- **21** jam
- **40** menit
- **15.181** detik

Data tersebut dibuat 21 jam, 40 menit, dan 15 detik yang lalu. Formatnya adalah `jam:menit:detik`.

### 📅 Kasus 2: Interval **Lebih Dari 1 Hari**

Jika hasilnya terlihat seperti `1 day 10:59:32.790133`, artinya:

- **1** hari
- **10** jam
- **59** menit
- **32.790133** detik

Ini adalah format `interval` standar yang menyertakan hari.

---

## 🔧 Mengekstrak Unit Waktu Tertentu

Terkadang, Anda tidak memerlukan interval penuh, tetapi hanya unit waktu tertentu seperti total jam atau total hari untuk kalkulasi atau logika tampilan UI (misalnya, "Diposting 5 jam yang lalu").

### Menggunakan `DATE_PART`

Anda bisa mengekstrak bagian tertentu dari sebuah interval.

> **🧠 Catatan:** Ini hanya mengekstrak nilai dari bagian tersebut, bukan _total_ waktu yang dikonversi ke unit itu. Untuk interval `1 day 2 hours`, `DATE_PART('hour', ...)` akan mengembalikan `2`, bukan `26`.

```sql
-- Mengambil bagian 'jam' dari interval
SELECT DATE_PART('hour', AGE(created_at)) AS hours_part
FROM task12."Thread";

-- Mengambil bagian 'menit' dari interval
SELECT DATE_PART('minute', AGE(created_at)) AS minutes_part
FROM task12."Thread";
```

### Menggunakan `EXTRACT(EPOCH ...)` untuk Total ✅

Untuk mendapatkan **total durasi** dalam satu unit (seperti total jam atau total hari), pendekatan terbaik adalah mengubah interval menjadi detik terlebih dahulu menggunakan `EXTRACT(EPOCH ...)` lalu lakukan pembagian.

`EPOCH` memberikan jumlah detik total dalam sebuah interval.

```sql
-- Total detik sejak data dibuat
SELECT EXTRACT(EPOCH FROM NOW() - created_at) AS total_seconds
FROM task12."Thread";

-- Total menit (total detik / 60)
SELECT EXTRACT(EPOCH FROM NOW() - created_at) / 60 AS total_minutes
FROM task12."Thread";

-- Total jam (total detik / 3600)
SELECT EXTRACT(EPOCH FROM NOW() - created_at) / 3600 AS total_hours
FROM task12."Thread";

-- Total hari (total detik / 86400)
SELECT EXTRACT(EPOCH FROM NOW() - created_at) / 86400 AS total_days
FROM task12."Thread";
```

---

## 🚀 Langkah Berikutnya: Logika Helper untuk UI

Berdasarkan query di atas, kita bisa membuat fungsi bantuan atau logika modular untuk memetakan interval ini menjadi teks yang ramah pengguna seperti **“1 hari yang lalu”** atau **“10 jam yang lalu”**. Ini sangat cocok untuk membangun UI yang bersih untuk hal-hal seperti linimasa thread atau postingan.

```

```
