# Panduan Petugas Kelas — Word

Panduan Petugas Kelas versi 1.0 tersedia sebagai **Microsoft Word (.docx)** yang dapat disunting, dengan gambar aplikasi sesuai akses Petugas. Panduan Admin yang telah diterima pengguna tetap dipertahankan.

**[Unduh Panduan_Petugas_Kelas.docx](https://github.com/DNA0604/for-training-recap/blob/docs/panduan-petugas-kelas/apps-script/absensi-dashboard/panduan/petugas/Panduan_Petugas_Kelas.docx?raw=true)**

Pada halaman berkas GitHub, gunakan **Download raw file**, lalu buka dengan Microsoft Word. Dokumen ini bukan berkas untuk dipasang ke editor Apps Script.

Isi versi pertama: **9 bab, 30 petunjuk dan 24 gambar**. Pemeriksaan tata letak lokal menghasilkan 32 halaman; jumlah halaman dapat berubah setelah redaksi, font atau gambar disunting di Word.

1. Tugas, cakupan akses dan urutan kerja Petugas.
2. Verifikasi akun, login, Beranda dan navigasi.
3. Pemilihan Program/Jenjang/Sesi serta pemeriksaan peserta dan profil.
4. Presensi QR/manual, ketidakhadiran, izin dan koreksi waktu langsung.
5. Catatan sikap/perilaku dan pemeriksaan izin.
6. Evaluasi peserta tiga aspek oleh Panitia.
7. Pengajuan verifikasi sesi, status menunggu, penolakan dan pengajuan ulang.
8. Tindak lanjut JP, Rekap Program, CSV dan rincian nilai akhir.
9. Logout dan kendala umum.

Panduan mengikuti penugasan Petugas. Perhitungan JP, keputusan verifikasi, validasi catatan, pengelolaan program/akun/peserta serta pembuatan laporan program menjadi tugas Admin. Formulir penilaian enam aspek Pengajar dan Evaluasi Pengajar tidak dimasukkan sebagai tindakan Petugas.

## Menyunting dokumen

Judul, paragraf, **109 langkah bernomor**, keterangan gambar dan **7 tabel** memakai elemen Word asli. Gambar merupakan ilustrasi antarmuka; halaman buku tidak diratakan menjadi gambar.

- Ubah redaksi langsung pada paragraf atau tabel.
- Gunakan gaya Heading yang tersedia untuk judul.
- Setelah perubahan memengaruhi halaman, perbarui field pada Word desktop, misalnya **Ctrl+A, F9**, untuk nomor halaman dan rujukan daftar isi. Sesuaikan judul bab pada tabel daftar isi bila redaksinya diganti.
- Gunakan **Ubah Gambar / Change Picture** untuk mengganti tangkapan layar.

Hasil pengukuran kecepatan dan riwayat perbaikan aplikasi tidak dimasukkan dalam buku.

## Pratinjau

- [Sampul](Pratinjau_Sampul.png)
- [Login](Pratinjau_Login.png)
- [Presensi manual](Pratinjau_Presensi_Manual.png)
- [Status verifikasi sesi](Pratinjau_Verifikasi_Sesi.png)

Hasil akhir yang diserahkan tetap Word. PDF sementara hanya digunakan di luar repository untuk memeriksa tata letak.

## Sumber dan pemeriksaan internal

Gambar diambil melalui Chromium dari HTML hasil renderer aplikasi saat ini (`7dacfb0`), memakai data sintetis dan akses Petugas pada backend lokal dengan layanan Google disimulasikan. Tangkapan layar menampilkan kontrol sesuai peran Petugas; enam metode khusus Admin/Pengajar diperiksa tetap ditolak. Ini tidak menguji login Google, unggahan atau perubahan spreadsheet produksi.

[Metadata gambar](SUMBER_GAMBAR.json) mencatat sumber, selector, hash 24 gambar dan hasil pemeriksaan pembatasan akses. [Hasil pemeriksaan](HASIL_PEMERIKSAAN.json) memuat struktur Word, rujukan halaman, hash sumber aplikasi dan keutuhan Word Admin yang sudah diterima. Seluruh 19 sumber aplikasi tetap identik. Tidak ada perubahan data Google, deployment atau branch main.

Sumber penyusunan:

- [Isi panduan](isi_panduan.json)
- [Pembuat Word](buat_word.py)
- [Pengambilan gambar](ambil_gambar.py) dan [fixture Petugas](fixture-petugas.mjs)
- [Pemeriksa Word](periksa_word.py)

Untuk membuat ulang dari root repository dengan Python, python-docx, Playwright, Pillow, lxml dan Chromium yang tersedia:

```bash
python apps-script/absensi-dashboard/panduan/petugas/ambil_gambar.py
python apps-script/absensi-dashboard/panduan/petugas/buat_word.py
python apps-script/absensi-dashboard/panduan/petugas/periksa_word.py
```

Pembuat Word memakai `halaman_bab.json` untuk isi awal rujukan halaman. Bila isi berubah banyak, periksa ulang tata letak dan rujukan tersebut. Sumber dokumentasi ini tidak dipasang ke aplikasi.

Panduan Petugas menunggu peninjauan pengguna. Panduan Pengajar, panduan singkat Peserta dan video belum dibuat.
