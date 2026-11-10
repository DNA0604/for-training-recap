# Rancangan panduan penggunaan bergambar

Empat panduan akan dibuat terpisah untuk **Admin Pelatihan, Petugas Kelas, Pengajar**, serta **panduan singkat Peserta**. Pengguna menghendaki gambar halaman aplikasi agar langkah lebih mudah diikuti. **Format hasil akhir yang disepakati adalah Microsoft Word (.docx)**, supaya judul, uraian dan langkah dapat disunting langsung. Contoh PDF di bawah hanya menunjukkan tata letak yang sudah ditinjau, bukan format penyerahan akhir.

Putaran ini menyiapkan rancangan dan **satu contoh halaman**, mengikuti arahan untuk menyepakati dasar panduan sebelum penyusunan detail.

- [Rancangan pembagian dan penggunaan gambar](RANCANGAN.md)
- [Contoh halaman login — PDF, satu halaman](contoh/Contoh_Halaman_Panduan_Login.pdf)
- [Pratinjau contoh halaman — gambar](contoh/contoh-panduan-login.png)
- [Sumber HTML contoh halaman](contoh/contoh-panduan-login.html)

Contoh login ditujukan untuk tiga pengguna yang memiliki akun aplikasi. Panduan Peserta akan memakai tampilan presensi QR, tanpa petunjuk login pengelola.

Gambar berasal dari renderer aplikasi sebenarnya dengan layanan Google disimulasikan dan data uji. Ini bukan tangkapan sesi Google milik pengguna. Metadata pengambilan ada di [SUMBER_GAMBAR.json](contoh/SUMBER_GAMBAR.json). Nomor penunjuk dibuat pada tata letak dokumen; gambar antarmuka dasarnya tetap disimpan tersendiri.

Untuk membuat ulang contoh dari root repository, gunakan Python dengan Playwright dan Chromium `/usr/bin/chromium` yang sudah tersedia:

```bash
python apps-script/absensi-dashboard/panduan/contoh/buat_contoh.py
```

Script menggunakan HTTP lokal sementara untuk merender PDF dan tidak menghubungi Google. File di folder panduan bukan kode yang dipasang pada editor Apps Script.
