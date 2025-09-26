# Sistem Follow & Unfollow – Penjelasan Lengkap dan Implementasi

## 🧠 Konsep Dasar

Fitur Follow & Unfollow adalah fitur umum di media sosial yang memungkinkan pengguna untuk mengikuti aktivitas pengguna lain.
Dalam sistem ini terdapat dua istilah penting:

| Istilah   | Arti                                                        |
| --------- | ----------------------------------------------------------- |
| Follower  | Pengguna yang mengikuti orang lain (kita sebagai pengikut). |
| Following | Pengguna yang diikuti (orang lain yang kita ikuti).         |

Setiap hubungan follow disimpan sebagai 1 baris dalam tabel Following.

**Contoh:**

| id  | follower_id | following_id |
| --- | ----------- | ------------ |
| f-1 | u-1         | u-2          |
| f-2 | u-1         | u-3          |

**📌 Artinya:**

- u-1 mengikuti u-2
- u-1 mengikuti u-3

---

## 🧪 Contoh Kasus

Misalkan ada 5 pengguna:

| ID  | Nama  |
| --- | ----- |
| u-1 | Kamu  |
| u-2 | Budi  |
| u-3 | Citra |
| u-4 | Dani  |
| u-5 | Eka   |

Dan kamu (u-1) sudah mengikuti Budi (u-2) dan Citra (u-3):

| id  | follower_id | following_id |
| --- | ----------- | ------------ |
| f-1 | u-1         | u-2          |
| f-2 | u-1         | u-3          |

Maka:

- Kamu punya 2 following → Budi dan Citra
- Budi dan Citra masing-masing punya 1 follower → yaitu kamu

---

## 🔎 SQL: Menemukan Pengguna yang Belum Kamu Ikuti

```sql
SELECT
  id, username, full_name, photo_profile, bio
FROM "User"
WHERE
  id NOT IN (
    SELECT "following_id"
    FROM "Following"
    WHERE "follower_id" = '${user_id}'
  )
  AND id != '${user_id}'
ORDER BY ${sortBy} ${order}
OFFSET ${offset} LIMIT ${limit};
```

**📌 Penjelasan langkah demi langkah:**

1.  **Sub-kueri:**

    ```sql
    SELECT "following_id"
    FROM "Following"
    WHERE "follower_id" = '${user_id}'
    ```

    ➤ Ambil semua ID pengguna yang sudah kamu ikuti.

2.  **NOT IN:**

    ```sql
    WHERE id NOT IN (...)
    ```

    ➤ Tampilkan pengguna yang tidak ada di daftar following-mu.

3.  **AND id != '${user_id}'**
    ➤ Sembunyikan akun kamu sendiri dari hasil pencarian.

**📊 Hasil:**
Daftar semua pengguna yang belum kamu ikuti, cocok untuk fitur “Orang yang Mungkin Kamu Kenal”.

---

## 🔁 Sistem Toggle Follow / Unfollow

Saat kamu menekan tombol Follow, backend harus menentukan apakah kamu sudah mengikuti pengguna tersebut:

1.  **Cek apakah hubungan follow sudah ada:**

    ```sql
    SELECT id
    FROM "Following"
    WHERE "follower_id" = '${user_id}' AND "following_id" = '${target_id}'
    ```

2.  **Jika ada → lakukan Unfollow:**

    ```sql
    DELETE FROM "Following"
    WHERE "follower_id" = '${user_id}' AND "following_id" = '${target_id}'
    ```

3.  **Jika tidak ada → lakukan Follow:**
    ```sql
    INSERT INTO "Following" ("follower_id", "following_id")
    VALUES ('${user_id}', '${target_id}')
    ```

📌 Dengan cara ini, tombol yang sama dapat berfungsi sebagai Follow dan Unfollow tergantung statusnya.

---

## 📊 Menghitung Jumlah Followers & Following

Untuk menampilkan statistik profil, kita perlu menghitung jumlah:

- Orang yang kita ikuti (Following)
- Orang yang mengikuti kita (Followers)

**Contoh implementasi di Express + Prisma:**

```typescript
export async function countFollows(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: profileId } = req.params; // ID profil yang sedang dilihat
    const { id: currentUserId } = (req as any).user; // ID pengguna yang sedang login

    // Jumlah orang yang kita ikuti
    const totalFollowing = await prisma.following.count({
      where: { follower_id: currentUserId },
    });

    // Jumlah orang yang mengikuti profil yang sedang dilihat
    const totalFollowers = await prisma.following.count({
      where: { following_id: profileId },
    });

    res.status(200).json({
      status: "Success",
      message: "Berhasil menghitung followers dan following",
      data: {
        totalFollowing,
        totalFollowers,
      },
    });
  } catch (err) {
    next(err);
  }
}
```

**📌 Logika:**

- `follower_id` = siapa yang mengikuti → hitung jumlah orang yang kamu ikuti
- `following_id` = siapa yang diikuti → hitung jumlah orang yang mengikuti kamu

---

## 🧭 Ringkasan Alur

| Tujuan                                 | Kolom yang Dicek                                                  |
| -------------------------------------- | ----------------------------------------------------------------- |
| Hitung Following kamu                  | `follower_id` = your_id                                           |
| Hitung Followers kamu                  | `following_id` = your_id                                          |
| Temukan pengguna yang belum kamu ikuti | `id` NOT IN (SELECT `following_id` WHERE `follower_id` = your_id) |

---

## 📌 Tips Tambahan

- Gunakan toggle endpoint agar tombol follow/unfollow bekerja otomatis.
- Tambahkan unique constraint di Prisma (`@@unique([follower_id, following_id])`) agar tidak ada duplikasi.
- Optimalkan dengan pagination (`LIMIT` & `OFFSET`) jika jumlah pengguna sangat banyak.
