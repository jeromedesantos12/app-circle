# 🚀 Global State dengan Redux Toolkit 🛠️

Dokumen ini menjelaskan bagaimana **Redux Toolkit** digunakan dalam proyek ini untuk me-manage _global state_, dengan fokus pada manajemen token otentikasi, dan membandingkannya dengan pendekatan `useContext`.

## 🤔 Apa Gunanya Redux di Proyek Ini?

Sederhananya, Redux dipakai untuk membuat sebuah "wadah" data terpusat yang bisa diakses atau diubah dari komponen mana pun di dalam aplikasi. Ini sangat berguna untuk data yang dipakai bersama, seperti status login pengguna, tema (light/dark mode), atau isi keranjang belanja.

Di proyek ini, Redux secara spesifik digunakan untuk **menyimpan token otentikasi**. Setelah pengguna berhasil login, token yang didapat dari server akan disimpan di dalam Redux _store_. Komponen lain (seperti _private routes_ atau _header_) bisa dengan mudah mengecek token ini untuk menentukan apakah pengguna sudah login atau belum.

**Analoginya:**

- **Redux Store**: Adalah sebuah "brankas pusat" 🏦 yang aman untuk menyimpan data penting aplikasi.
- **Actions**: Adalah "perintah" 📝 yang kita kirim untuk mengubah data di brankas (misalnya, "simpan token ini" atau "hapus token ini").
- **Reducers**: Adalah "penjaga brankas" 💂 yang menerima perintah (actions) dan tahu persis bagaimana cara mengubah data di dalamnya secara aman.

## 🛠️ Cara "Install" dan Setup

Redux Toolkit adalah _library_ eksternal, jadi ia perlu di-install terlebih dahulu.

```bash
npm install @reduxjs/toolkit react-redux
# atau jika menggunakan bun
bun add @reduxjs/toolkit react-redux
```

Berikut adalah alur kerja Redux di proyek ini, dari awal hingga bisa dipakai di komponen:

---

### 🗺️ Alur Kerja Global State di Proyek Ini

#### 1. `src/redux/slices/token.ts` (Mendefinisikan "Slice" 🍰)

```typescript
// src/redux/slices/token.ts (Contoh)
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = { value: null };

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    clearToken: (state) => {
      state.value = null;
    },
  },
});

export const { setToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;
```

Langkah pertama adalah membuat `slice`. Sebuah _slice_ adalah gabungan dari:

1.  **Initial State**: Nilai awal dari data (dalam kasus ini, `null` karena belum ada token).
2.  **Reducers**: Fungsi-fungsi yang mendefinisikan bagaimana _state_ bisa berubah (`setToken` untuk menyimpan token, `clearToken` untuk menghapusnya).

#### 2. `src/redux/store.ts` (Membuat Brankas Pusat 🏦)

```typescript
// src/redux/store.ts (Contoh)
import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "./slices/token";

export const store = configureStore({
  reducer: {
    token: tokenReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

File ini menggabungkan semua _slice_ yang ada (di sini hanya `tokenSlice`) menjadi satu `store` tunggal menggunakan `configureStore`. Inilah "brankas" pusat aplikasi kita.

#### 3. `src/main.tsx` (Membungkus Seluruh Aplikasi 🎁)

```typescript
// src/main.tsx (Contoh)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

Agar semua komponen bisa mengakses _store_, aplikasi kita harus dibungkus dengan komponen `<Provider>` dari `react-redux` di level tertinggi.

#### 4. Contoh Penggunaan di Komponen 💻

Sekarang, di komponen mana pun, kita bisa mengakses dan mengubah _state_ token dengan mudah menggunakan _hooks_ dari `react-redux`.

- **Membaca State dengan `useSelector`**

```typescript
// Contoh di komponen Navbar.tsx
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function Navbar() {
  const token = useSelector((state: RootState) => state.token.value);

  return <nav>{token ? <p>Sudah Login</p> : <p>Belum Login</p>}</nav>;
}
```

- **Mengubah State dengan `useDispatch`**

```typescript
// Contoh di halaman Login.tsx
import { useDispatch } from "react-redux";
import { setToken } from "@/redux/slices/token";

function LoginPage() {
  const dispatch = useDispatch();

  async function handleLogin() {
    // ... proses login ke API ...
    const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Token dari server
    dispatch(setToken(userToken)); // Kirim action untuk simpan token ke store
  }

  return <button onClick={handleLogin}>Login</button>;
}
```

---

## 🆚 Redux Toolkit vs. `useContext`

| Fitur          | Redux Toolkit                                                                                                                     | `useContext` + `useState`/`useReducer`                                                                                                                                  |
| :------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Setup**      | Lebih banyak _boilerplate_ (install, buat slice, store, provider).                                                                | Minimal, karena sudah bawaan React.                                                                                                                                     |
| **Use Case**   | Ideal untuk state yang kompleks & sering berubah, diakses banyak komponen.                                                        | Cocok untuk state sederhana yang jarang berubah (misal: tema, bahasa).                                                                                                  |
| **Re-renders** | Sangat teroptimasi. Komponen hanya re-render jika data _slice_ yang ia `subscribe` benar-benar berubah.                           | Kurang teroptimasi. Semua komponen yang meng-`consume` context akan re-render setiap kali nilai context berubah, bahkan jika bagian yang mereka butuhkan tidak berubah. |
| **DevTools**   | Punya **Redux DevTools** 🚀, sebuah ekstensi browser super canggih untuk _debugging_, _time-travel_, dan melihat histori _state_. | Tidak ada DevTools khusus. Debugging dilakukan seperti biasa dengan `console.log` atau React DevTools standar.                                                          |
| **Ekosistem**  | Ekosistem yang matang dengan banyak _middleware_ (seperti Redux Thunk, Saga) untuk menangani _side effects_ (misal: API calls).   | Polos. Untuk _side effects_, biasanya dikombinasikan dengan `useEffect` atau library lain seperti React Query.                                                          |

### ✨ Kesimpulan Singkat (TL;DR)

1.  **Redux Toolkit**: Dipakai di proyek ini untuk menyimpan **token otentikasi** secara global.
2.  **Alur**: Komponen (`LoginPage`) men-`dispatch` sebuah `action` (`setToken`) setelah login berhasil.
3.  **Reducer** di dalam `tokenSlice` menerima _action_ itu dan memperbarui _state_ di dalam `store`.
4.  Komponen lain (`Navbar`, _private routes_) menggunakan `useSelector` untuk membaca _state_ token dan bereaksi sesuai perubahan.
5.  **Perbandingan**: Redux lebih terstruktur, teroptimasi, dan punya DevTools canggih, membuatnya pilihan solid untuk state management skala besar. `useContext` lebih simpel dan cepat untuk kebutuhan yang lebih sederhana.

Semoga penjelasan ini membantu!
