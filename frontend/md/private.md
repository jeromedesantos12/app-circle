# Analisis dan Solusi Infinite Loop pada Private & Public Routes

Dokumen ini menganalisis penyebab dan memberikan solusi untuk masalah *infinite loop* yang terjadi pada komponen `PrivateRoute` dan `PublicRoute` dalam aplikasi React.

---

## Studi Kasus 1: Penanganan Infinite Loop pada `PrivateRoute`

### Deskripsi Masalah

`PrivateRoute` mengalami *infinite loop* setelah pengguna berhasil login. Alur status Redux yang diamati adalah sebagai berikut:

-   **Sebelum Login:** `idle` → `loading` → `failed`. Perilaku ini sesuai harapan, karena pengguna belum terautentikasi dan akan diarahkan ke halaman login.
-   **Setelah Login:** Status langsung berubah menjadi `failed`, yang memicu pengalihan (redirect) kembali ke halaman login. Hal ini menyebabkan *infinite loop* dan UI tidak pernah me-render komponen yang seharusnya dilindungi.

### Analisis Penyebab

Akar masalah terletak pada logika `useEffect` yang hanya memeriksa status `idle` untuk memverifikasi token.

```javascript
// Implementasi Awal yang Bermasalah
useEffect(() => {
  if (status === "idle") {
    dispatch(verifyToken());
  }
}, [dispatch, status]);
```

Setelah proses login, pengguna dialihkan ke *private route*. Namun, status token di Redux store masih `failed` dari sesi sebelumnya (sebelum login). Karena status bukan `idle`, `verifyToken()` tidak pernah dieksekusi kembali untuk memvalidasi token yang baru. Akibatnya, komponen tetap menganggap pengguna tidak sah dan terus-menerus mengalihkannya.

### Perbandingan Metode Pengalihan

-   **`window.location.href`**: Metode ini memaksa *full page reload*, yang mengakibatkan Redux store direset. Meskipun ini menyelesaikan masalah, ini bukanlah praktik yang efisien dalam SPA (Single Page Application).
-   **`<Navigate>` dari React Router**: Komponen ini melakukan pengalihan di sisi klien tanpa me-refresh halaman, sehingga state Redux tetap persisten. Jika state tidak diperbarui dengan benar, *loop* akan terjadi.

### Rekomendasi Solusi

Prinsip utama perbaikan adalah memastikan verifikasi token dijalankan setiap kali rute privat diakses tanpa data pengguna yang valid, bukan hanya saat status `idle`.

**Implementasi yang Direkomendasikan:**

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { verifyToken } from './path/to/tokenSlice'; // Ganti dengan path yang benar
import { AppDispatch, RootState } from './path/to/store'; // Ganti dengan path yang benar

// Asumsi tipe state
interface TokenStateType {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: any; // Ganti dengan tipe data token yang sesuai
}

export function PrivateRoute() {
  const { status, data } = useSelector((state: RootState) => state.token as TokenStateType);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    // Jalankan verifikasi jika belum ada data token dan tidak sedang dalam proses loading.
    if (!data && status !== "loading") {
      dispatch(verifyToken());
    }
  }, [dispatch, data, status]);

  if (status === "loading") {
    return <div>Auth checking...</div>; // Atau komponen <Loading />
  }

  if (status === "failed") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

**Penjelasan Solusi:**

-   Kondisi `!data && status !== "loading"` memastikan `verifyToken()` dieksekusi jika data token belum ada, terlepas dari status sebelumnya (`idle` atau `failed`).
-   Ini mencegah pemanggilan berulang jika proses verifikasi sedang berlangsung (`loading`).
-   Dengan menampilkan komponen `loading` dan melakukan pengalihan hanya saat status `failed`, alur autentikasi menjadi lebih robust dan terhindar dari *infinite loop*.

---

## Studi Kasus 2: Penanganan Infinite Loop pada `PublicRoute`

### Deskripsi Masalah

`PublicRoute` (misalnya halaman login/register) mengalami *infinite loop* ketika token pengguna yang tersimpan di *local storage* tidak valid atau kedaluwarsa.

### Analisis Penyebab

Logika `useEffect` yang sama seperti pada `PrivateRoute` menyebabkan masalah serupa.

```javascript
// Logika yang menyebabkan loop
if (!data && status !== "loading") {
  dispatch(verifyToken());
}
```

1.  Komponen dimuat, `status` adalah `idle`. `verifyToken()` dijalankan.
2.  Server merespons dengan error (misal: 401 Unauthorized), sehingga `status` menjadi `failed`.
3.  Karena `status` kini `failed` (bukan `loading`), kondisi `useEffect` kembali terpenuhi pada render berikutnya.
4.  `verifyToken()` dipanggil berulang kali, menciptakan *infinite loop*.

### Rekomendasi Solusi

Solusinya adalah memastikan `verifyToken()` hanya dipanggil **satu kali** saat komponen pertama kali dimuat dan statusnya masih `idle`.

**Implementasi yang Direkomendasikan:**

```javascript
useEffect(() => {
  // Hanya jalankan verifikasi saat status masih 'idle'.
  if (status === "idle") {
    dispatch(verifyToken());
  }
}, [dispatch, status]);

// Jika verifikasi gagal (status === 'failed'),
// komponen akan lanjut me-render <Outlet />,
// yang berisi halaman publik (Login/Register).
if (status === 'succeeded' && data) {
    return <Navigate to="/" replace />; // Arahkan ke dashboard jika sudah login
}

return <Outlet />;
```

**Penjelasan Solusi:**

-   Dengan memeriksa `status === "idle"`, `verifyToken()` hanya dieksekusi pada pemuatan awal.
-   Jika verifikasi gagal dan `status` menjadi `failed`, kondisi `useEffect` tidak lagi terpenuhi, sehingga *loop* berhenti.
-   Komponen kemudian akan me-render `<Outlet />`, yang memungkinkan pengguna mengakses halaman publik tanpa masalah.

### Hasil Akhir

-   **Infinite loop teratasi:** Pengguna dapat mengakses rute publik dan privat sesuai dengan status autentikasi mereka.
-   **Alur Autentikasi Jelas:** Proses verifikasi token menjadi lebih efisien dan hanya berjalan pada kondisi yang tepat.
-   **Pengalaman Pengguna Meningkat:** Tidak ada lagi UI yang "tergantung" atau pengalihan yang tidak terduga.