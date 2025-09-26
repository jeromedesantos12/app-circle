#### NOTES

1. [Kalkulasi Waktu di PostgreSQL](md/age.md)
2. [Cara Kerja Web Socket](md/socket.md)
3. [Cara Kerja Tombol Follow](md/follow.md)
4. [Konfigurasi Swagger](md/swagger.md)

#### BUG FIX

1. Table thread ada number_of_reply? padahalkan bisa dapat melalui join (jadi aku akan hapus field ini)
2. Table reply ga ada fk ke like_id dan reply_id, padahal di contoh reply ada like dan reply lagi
3. Untuk tabel yang punya field user_id bakalan overkill karena udah ada field created_by
4. SI REDISNYA NGERUSAK STATE + WEBSOCKET JADI GA REALTIME!!! karena redis pake sistem cache
