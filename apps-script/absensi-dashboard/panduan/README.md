# Rancangan panduan penggunaan bergambar

Tiga panduan dibuat terpisah untuk **Admin Pelatihan, Petugas Kelas dan Pengajar**. Pengguna membatalkan panduan Peserta karena peserta hanya menggunakan presensi. Panduan dilengkapi gambar halaman aplikasi agar langkah lebih mudah diikuti. **Format hasil akhir yang disepakati adalah Microsoft Word (.docx)**, supaya judul, uraian dan langkah dapat disunting langsung. Contoh PDF di bawah hanya menunjukkan tata letak yang sudah ditinjau, bukan format penyerahan akhir.

**Ketiga panduan versi 1.0 sudah tersedia dalam Word.** Panduan Admin telah diterima pengguna; panduan Petugas telah diserahkan. Panduan Pengajar kini tersedia untuk ditinjau, dengan 6 bab, 22 petunjuk dan 17 gambar sesuai aksesnya. Rancangan serta contoh halaman awal tetap disimpan sebagai riwayat format yang telah dibahas. Video dan penyerahan kepada instansi tetap pekerjaan terpisah.

- **[Panduan Admin Pelatihan — unduh Word dan pratinjau](admin/README.md)**
- **[Panduan Petugas Kelas — unduh Word dan pratinjau](petugas/README.md)**
- **[Panduan Pengajar — unduh Word dan pratinjau](pengajar/README.md)**
- [Rancangan pembagian dan penggunaan gambar](RANCANGAN.md)
- [Contoh halaman login — PDF, satu halaman](contoh/Contoh_Halaman_Panduan_Login.pdf)
- [Pratinjau contoh halaman — gambar](contoh/contoh-panduan-login.png)
- [Sumber HTML contoh halaman](contoh/contoh-panduan-login.html)

Contoh login ditujukan untuk ketiga pengguna yang memiliki akun aplikasi. Presensi Peserta tetap menggunakan alur QR publik; tidak ada buku panduan Peserta yang perlu disusun dalam cakupan terbaru.

Gambar berasal dari renderer aplikasi sebenarnya dengan layanan Google disimulasikan dan data uji. Ini bukan tangkapan sesi Google milik pengguna. Metadata pengambilan ada di [SUMBER_GAMBAR.json](contoh/SUMBER_GAMBAR.json). Nomor penunjuk dibuat pada tata letak dokumen; gambar antarmuka dasarnya tetap disimpan tersendiri.

Untuk membuat ulang contoh dari root repository, gunakan Python dengan Playwright dan Chromium `/usr/bin/chromium` yang sudah tersedia:

```bash
python apps-script/absensi-dashboard/panduan/contoh/buat_contoh.py
```

Script menggunakan HTTP lokal sementara untuk merender PDF dan tidak menghubungi Google. File di folder panduan bukan kode yang dipasang pada editor Apps Script.
