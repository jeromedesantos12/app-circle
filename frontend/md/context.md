# 👑 Global State dengan `useContext` & React Query 🚀

Dokumen ini menjelaskan bagaimana `useContext` digunakan dalam proyek ini untuk me-manage _global state_, khususnya untuk otentikasi pengguna.

## 🤔 Apa Gunanya `useContext` di Proyek Ini?

Secara sederhana, `useContext` dipakai untuk menyediakan "data global" ke seluruh komponen aplikasi tanpa harus mengoper data tersebut lewat `props` satu per satu dari komponen parent ke child (teknik ini disebut **prop drilling**).

Di proyek ini, `useContext` tidak bekerja sendirian. Ia dikombinasikan dengan **TanStack React Query** untuk menciptakan sistem state management otentikasi yang canggih dan efisien.

**Analoginya:**

- **React Query**: Adalah "dapur" yang bertugas memasak (mengambil & menyimpan/cache) data dari server.
- **`useContext`**: Adalah "pelayan" yang mengantarkan masakan (data) dari dapur ke meja mana pun (komponen mana pun) yang memesan.

## 🛠️ Cara "Install" dan Setup

`useContext` adalah _Hook_ bawaan React, jadi **tidak perlu di-install**. Yang kita lakukan adalah melakukan _setup_ atau penyiapan alurnya.

Berikut adalah alur kerja dari `useContext` di proyek ini, dari awal hingga bisa dipakai di komponen:

---

### 🗺️ Alur Kerja Global State di Proyek Ini

#### 1. `src/context/AuthContext.ts` (Membuat Cetak Biru 📝)

```typescript
// src/context/AuthContext.ts
import type { AuthContextType } from "../types/auth";
import { createContext } from "react";

export const AuthContext = createContext<AuthContextType | null>(null);
```

Langkah pertama adalah membuat "wadah" context-nya dengan `createContext()`. File ini seperti mendefinisikan sebuah _blueprint_ atau cetak biru: "Data global kita nanti akan berisi `token`, `setToken`, dan `isPending`".

#### 2. `src/context/AuthProvider.tsx` (Sang Penyedia Data 🧑‍🍳)

```typescript
// src/context/AuthProvider.tsx
export function AuthProvider({ children }) {
  const { data, isPending } = useQuery({
    queryKey: ["verify"],
    queryFn: getVerify,
    // ...
  });

  const setToken = useCallback(/* ... */);
  const token = data?.data ?? null;

  return (
    <AuthContext.Provider value={{ token, setToken, isPending }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Ini adalah bagian intinya. `AuthProvider` adalah komponen yang bertugas:

1.  **Mengambil Data**: Menggunakan `useQuery` dari React Query untuk memanggil fungsi `getVerify` yang akan mengecek token ke server. Hasilnya (data user/token) akan otomatis disimpan di _cache_ React Query.
2.  **Menyediakan Data**: Membungkus komponen `children` (yaitu seluruh aplikasi kita) dengan `<AuthContext.Provider>`.
3.  **Membagikan `value`**: `value` yang berisi `token`, fungsi `setToken`, dan status `isPending` dibagikan ke semua komponen yang ada di dalam `AuthProvider`.

#### 3. `src/App.tsx` (Membungkus Seluruh Aplikasi 🎁)

```typescript
// src/App.tsx
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

Agar data otentikasi tersedia di mana saja, `AuthProvider` harus membungkus komponen level tertinggi, yaitu `RouterProvider` (yang mengatur semua halaman). Dengan begini, semua halaman dan komponen di dalamnya bisa mengakses _auth state_.

#### 4. `src/hooks/useAuth.ts` (Jalan Pintas yang Praktis ⚡)

```typescript
// src/hooks/useAuth.ts
import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

File ini adalah _custom hook_ yang dibuat untuk mempermudah. Daripada setiap komponen harus menulis `useContext(AuthContext)`, kita cukup memanggil `useAuth()`. Hook ini juga memberikan pesan error yang jelas jika kita salah menempatkan komponen di luar `AuthProvider`.

#### 5. Contoh Penggunaan di Komponen 💻

Sekarang, di komponen mana pun (misalnya di halaman `Home.tsx` atau `Navbar.tsx`), kita bisa dengan mudah mendapatkan status otentikasi:

```typescript
import { useAuth } from "@/hooks/useAuth";

function ProfilePage() {
  const { token, isPending } = useAuth();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <div>Anda belum login!</div>;
  }

  return <div>Selamat datang! Token Anda: {token.accessToken}</div>;
}
```

---

### ✨ Kesimpulan Singkat (TL;DR)

1.  **React Query (`useQuery`)**: Mengambil dan menyimpan data otentikasi dari server.
2.  **`AuthProvider.tsx`**: Menggunakan data dari React Query dan menyediakannya ke seluruh aplikasi melalui `AuthContext.Provider`.
3.  **`App.tsx`**: Memastikan `AuthProvider` membungkus semua komponen.
4.  **`useAuth.ts`**: Hook kustom untuk mempermudah komponen lain mengakses data tersebut.
5.  **Komponen**: Memanggil `useAuth()` untuk mendapatkan data `token` dan `isPending` dengan praktis.

Semoga penjelasan ini membantu!
