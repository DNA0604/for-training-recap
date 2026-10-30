# for-training-recap
Jangan salin atau mencuri data ini tanpa persetujuan pemilik. Data ini merupakan project besar untuk menunjang kehidupan keluarga kecil. Jadi, bagi kalian para bajak laut jahat, enyahlah kalian atau saya akan spawn Dewa Nikka 

## Monitoring Pelatihan Pegawai

Repository khusus kode aplikasi Google Apps Script untuk rekapitulasi dan monitoring pelatihan pegawai Pusat Pengembangan Aparatur Komdigi.

- [Kode aplikasi lengkap](apps-script/absensi-dashboard/)
- [Panduan file Apps Script dan pemasangan](apps-script/absensi-dashboard/README.md)
- [Konteks dan status proyek](PROJECT_CONTEXT.md)
- [Catatan perubahan](CHANGELOG.md)
- [Asal dan hash file impor](MIGRATION_SOURCE.json)

Versi impor: commit `4d64d49` dari repository DNA0604/anti-slop, termasuk login satu alur dan Verifikasi Sesi di bagian bawah Monitoring. Semua 75 file folder aplikasi disalin identik. Database Google Spreadsheet dan deployment yang sudah berjalan tetap digunakan; pemindahan repository ini tidak memerlukan deploy ulang.

### File untuk Apps Script

Folder aplikasi kini berisi 16 file HTML/GS: Code.gs, Akses.gs, Evaluasi.gs, Hapus.gs, Laporan.gs, Jenjang.gs, PemetaanJenjang.gs, Beranda.html, Index.html, Pengelolaan.html, Peserta.html, Profil.html, ManajemenAkses.html, Absensi.html, AdminQR.html, PratinjauJenjang.html. `appsscript.json` adalah referensi; pertahankan manifest/scopes proyek Google yang sudah berjalan.

Buka file di GitHub lalu gunakan **Raw** untuk menyalin kode lengkap. Folder tests, docs dan preview merupakan bahan pengembangan, bukan file yang ditambahkan ke editor Apps Script.

### Pengujian lokal

Jalankan dari root repository dengan Node.js yang mendukung test runner:

```sh
npm test
```

Pengujian backend memakai Node.js bawaan tanpa dependensi npm tambahan. Suite browser membutuhkan Python, Playwright dan Chromium pada `/usr/bin/chromium`:

```sh
python apps-script/absensi-dashboard/tests/browser/sesi_akses_browser.py
python apps-script/absensi-dashboard/tests/browser/akses_browser.py
```

Pengujian lokal memakai layanan Google tiruan. Hasilnya tidak menggantikan pengujian deployment Google. Pratinjau dan laporan pengujian lama tetap disimpan sebagai riwayat; baca status terbaru di PROJECT_CONTEXT.md.


Pembaruan setelah impor mengikuti [SOURCE_SNAPSHOT.json](apps-script/absensi-dashboard/SOURCE_SNAPSHOT.json). MIGRATION_SOURCE.json tetap mencatat versi awal yang dipindahkan. Fitur Pengajar/evaluasi enam aspek per sesi dijelaskan dalam [panduan ini](apps-script/absensi-dashboard/docs/EVALUASI_PESERTA_SESI.md).

Pembaruan UI Pengajar/Admin: branch `ui/rapikan-evaluasi-pengajar`, ganti empat file seperti dijelaskan pada [panduan evaluasi terbaru](apps-script/absensi-dashboard/docs/EVALUASI_PESERTA_SESI.md).

Rekap nilai Pengajar dan catatan Admin/Petugas pada file penilaian terhubung: [panduan pembaruan tiga file](apps-script/absensi-dashboard/docs/REKAP_PENILAIAN_SPREADSHEET.md), branch `feat/rekap-penilaian-spreadsheet`.

Evaluasi Pengajar oleh Admin per sesi: [panduan pembaruan dua file](apps-script/absensi-dashboard/docs/EVALUASI_PENGAJAR_ADMIN.md), branch `feat/evaluasi-pengajar-admin`.

Manajemen Akses dengan sidebar/header dashboard: [panduan satu HTML baru dan satu Script pengganti](apps-script/absensi-dashboard/docs/MANAJEMEN_AKSES_DASHBOARD.md), branch `ui/manajemen-akses-dashboard`.
