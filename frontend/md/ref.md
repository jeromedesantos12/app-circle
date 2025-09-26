### 🤔 Masalah Upload Gambar yang Sama Dua Kali

Pernahkah kamu mengalami masalah di mana setelah memilih gambar, menghapusnya, lalu mencoba memilih gambar yang _sama_ lagi, tapi tidak terjadi apa-apa? 😱 Nah, itu bug yang cukup umum!

**🧐 Apa Penyebabnya?**

1.  **State React vs. DOM Asli**: Saat kamu memilih gambar, kita menyimpannya di `useState` untuk menampilkan preview. Ketika kamu menekan tombol "X" untuk menghapus preview, kita hanya mengosongkan `useState` tersebut (`setImage(null)`).
2.  **Browser Cerdas (tapi terlalu cerdas)**: Masalahnya, elemen `<input type="file">` di DOM browser masih "mengingat" file yang terakhir kamu pilih.
3.  **Tidak Ada Perubahan**: Ketika kamu mencoba memilih file yang sama lagi, browser melihat bahwa nilainya tidak berubah, sehingga event `onChange` tidak akan terpicu. Akibatnya, fungsi untuk menampilkan preview tidak akan berjalan lagi.

**💡 Solusi Cerdas dengan `useRef`**

Solusinya adalah dengan "memaksa" input file untuk lupa! Kita bisa melakukan ini dengan `useRef`.

1.  **Buat Referensi**: Kita buat `ref` ke elemen `<input type="file">`.
    ```javascript
    const fileInputRef = useRef < HTMLInputElement > null;
    ```
    ```jsx
    <input ref={fileInputRef} type="file" ... />
    ```
2.  **Reset Saat Close**: Di fungsi yang menangani penutupan preview (`handleClose`), selain mengosongkan `useState`, kita juga mereset nilai dari input file itu sendiri secara langsung di DOM.

    ```javascript
    function handleClose() {
      // Kosongkan state untuk UI
      setImage(null);
      setBase64Image(null);

      // Reset input file di DOM! ✨
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    ```

Dengan cara ini, browser akan menganggap input file benar-benar kosong dan siap menerima file baru, bahkan jika itu adalah file yang sama persis. Masalah terpecahkan! 🎉🚀
