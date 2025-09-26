# Swagger: Instalasi dan Konfigurasi

Dokumen ini menjelaskan cara menginstal dan mengkonfigurasi Swagger untuk dokumentasi API di proyek ini.

## Instalasi

Proyek ini menggunakan `swagger-jsdoc` untuk menghasilkan spesifikasi OpenAPI dari komentar JSDoc dan `swagger-ui-express` untuk menyajikan antarmuka pengguna Swagger.

Instal dependensi pengembangan yang diperlukan:

```bash
bun add -d swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express
```

## Konfigurasi

Konfigurasi Swagger dilakukan di `src/app.ts`.

### Opsi Swagger

Objek `options` digunakan untuk mengkonfigurasi `swagger-jsdoc`:

```typescript
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Circle API",
      description: "API untuk aplikasi media sosial",
      version: "1.0.0",
    },
    servers: [
      {
        url, // URL dasar dari .env
        description: "Server Lokal",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [resolve(process.cwd(), "src/routes/*.ts")], // Path ke file yang berisi komentar JSDoc
};
```

- **definition**: Mendefinisikan informasi dasar dari spesifikasi OpenAPI.
- **apis**: Array path ke file yang akan di-scan oleh `swagger-jsdoc` untuk mencari komentar JSDoc yang mendefinisikan endpoint API. Dalam proyek ini, semua file di dalam `src/routes` akan di-scan.

### Menjalankan Swagger UI

Swagger UI dijalankan menggunakan `swagger-ui-express`:

```typescript
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// ...

const swaggerSpec = swaggerJSDoc(options);

// ...

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

- `swaggerJSDoc(options)` menghasilkan spesifikasi OpenAPI berdasarkan opsi yang diberikan.
- `app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))` membuat endpoint baru di `/api/v1/api-docs` yang akan menyajikan dokumentasi API interaktif.

## Penggunaan

Untuk mendokumentasikan endpoint API, gunakan komentar JSDoc di atas setiap definisi rute di dalam file-file di direktori `src/routes`.

### Contoh

```typescript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Mendapatkan semua pengguna
 *     description: Mengambil daftar semua pengguna.
 *     responses:
 *       200:
 *         description: Daftar pengguna.
 */
router.get("/users", getAllUsers);
```

Komentar JSDoc di atas akan menghasilkan dokumentasi untuk endpoint `GET /api/v1/users`.
