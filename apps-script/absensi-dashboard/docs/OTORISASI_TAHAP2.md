# Tahap 2 — otorisasi per panggilan lebih ringan — 18 November 2026

Melanjutkan Tahap 1. Cakupan hanya **Akses.gs**. Fitur ini **MATI secara bawaan**: setelah dipasang, perilaku aplikasi sama persis seperti sebelumnya sampai pemilik menyalakannya sendiri. Jika terjadi hal aneh, cukup dimatikan lagi tanpa memasang ulang kode.

## Masalah yang diatasi

Setiap panggilan ke server (termasuk pemeriksaan sesi saat membuka halaman) memeriksa ulang seluruh direktori akses: membuka spreadsheet akses, memeriksa pemiliknya dua kali, membaca tab Pengguna, Penugasan_Jenjang, dan Riwayat_Akses (nilai dan rumus), semuanya di dalam lock skrip yang berlaku untuk semua pengguna.

## Apa yang diubah

Hasil validasi direktori **per pengguna** disimpan sangat singkat di CacheService (berkunci ID spreadsheet akses + versi direktori + ID pengguna). Panggilan berikutnya memakai hasil itu dan tidak membaca direktori, tidak membuka spreadsheet akses, tidak memeriksa pemilik, dan tidak mengambil lock.

**Tetap diperiksa langsung di setiap panggilan:** sesi tersimpan (pencabutan/logout/kedaluwarsa empat jam), konfigurasi login, status aplikasi aktif, daftar Program/Jenjang (cakupan akses), dan penugasan sesi Pengajar. **Pemeriksaan ulang sebelum setiap penulisan (`periksaUlangSesiPanitia_`) selalu langsung ke direktori**, tidak memakai cache.

**Pembatalan cache.** Setiap perubahan direktori lewat aplikasi (audit akses `PENDING`/`SELESAI`/`PERLU_PEMULIHAN` dan penulisan baris pengguna/penugasan) menaikkan penanda versi, sehingga cache lama otomatis tidak terpakai pada panggilan berikutnya. Menonaktifkan akun, mencabut penugasan, atau transaksi akses yang belum selesai berlaku **langsung**.

**Satu batas yang perlu Anda ketahui.** Jika direktori diubah **manual langsung di spreadsheet** (bukan lewat Manajemen Akses), perubahan itu paling lambat berlaku setelah **30 detik** (`TTL_KONTEKS_AKSES_DETIK_`). Ini penyimpangan dari aturan "pemeriksaan akun selalu langsung" di AGENTS.md, dan hanya berlaku bila fitur dinyalakan. Untuk perubahan akses, gunakan panel Manajemen Akses, bukan mengedit sel secara manual.

## Cara menyalakan dan mematikan

Hanya pemilik spreadsheet yang bisa.

1. Buka Apps Script proyek ini, pilih fungsi **`aktifkanCacheOtorisasiPanitia`** pada daftar fungsi di bagian atas editor, lalu klik **Run**. (Untuk mematikan: **`matikanCacheOtorisasiPanitia`**.)
2. Keadaan saat ini terlihat di **Project Settings → Script Properties**: ada kunci yang diawali `AKSES_CACHE_KONTEKS|` bernilai `aktif` berarti menyala; tidak ada berarti mati.

## Bukti lokal

Data sintetis, layanan Google tiruan. Panggilan hangat (cache sudah terisi), respons **identik** dengan cache mati pada 10 perbandingan (22 dan 500 peserta). Angka adalah hitungan panggilan layanan, **bukan waktu Google**.

| Aksi | Pembacaan sheet | `openById` | `getOwner` | Lock |
| --- | --- | --- | --- | --- |
| Pemeriksaan sesi saat membuka halaman | 8 → 2 | 1 → 0 | 2 → 0 | 1 → 0 |
| Data awal | 10 → 4 | 1 → 0 | 2 → 0 | 1 → 0 |
| Masuk sesi | 17 → 11 | 2 → 1 | 4 → 2 | 1 → 0 |
| Daftar peserta | 11 → 5 | 1 → 0 | 2 → 0 | 1 → 0 |
| Tambah program (sudah dihangatkan) | 48 → 42 | 3 → 2 | 6 → 4 | 2 → 1 |

Pembacaan sheet yang tersisa adalah Program/Jenjang (cakupan akses selalu segar) dan tabel data pelatihan. Tambah program hanya berkurang separuh dari otorisasinya karena pemeriksaan ulang sebelum menulis sengaja tetap penuh. Untuk Pengajar, penugasan sesi tetap dibaca langsung dari buku evaluasi.

Pengujian: **9 tes baru** (`akses-cache-konteks.test.mjs`) selain 451 tes sebelumnya, mencakup: mati secara bawaan; konteks hangat identik untuk Admin, Petugas, dan Pengajar tanpa membaca direktori/lock; nonaktifkan akun, cabut penugasan, transaksi akses tertunda, dan logout berlaku seketika; edit manual spreadsheet dihormati setelah TTL dan pemeriksaan ulang penulisan selalu langsung; hanya pemilik yang boleh menyalakan/mematikan.

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-otorisasi-tahap2.mjs
```

## Cara uji setelah dipasang

1. Pasang `Akses.gs` (cache masih mati) dan pastikan login Admin, Petugas, dan Pengajar berjalan seperti biasa.
2. Nyalakan fitur, ukur waktu membuka halaman dan masuk sesi sebelum/sesudah.
3. Dengan fitur menyala: nonaktifkan seorang Petugas lewat Manajemen Akses; Petugas itu harus langsung ditolak pada klik berikutnya. Ubah penugasannya; cakupan harus langsung berubah. Lakukan Keluar; sesi harus langsung tidak berlaku.
4. Jika ada perilaku yang tidak sesuai, jalankan `matikanCacheOtorisasiPanitia`.

## Yang belum diuji

Deployment Google, waktu nyata, tes browser (HTML tidak berubah), dan perilaku CacheService yang menghapus data lebih awal (kodenya kembali ke pemeriksaan penuh bila cache tidak ada). Pemanasan pertama setelah menyalakan, atau setelah perubahan akses, tetap memakai jalur penuh satu kali.

## Berikutnya (menunggu persetujuan)

Tahap 3: membaca per kolom/baris yang diperlukan dan memindahkan validasi integritas seluruh data dari jalur harian.
