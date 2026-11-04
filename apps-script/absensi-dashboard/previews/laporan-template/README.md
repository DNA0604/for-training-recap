# Pratinjau laporan — data sintetis

Contoh memakai data dummy, aset sampul/logo yang diberikan pengguna, dan sumber pada branch feat/laporan-program-template. Tidak ada data CSV/PDF pribadi pengguna yang disalin sebagai data peserta pratinjau.

- [Contoh 2 peserta, tabel tanpa grafik](Laporan-Contoh-2-Peserta.pdf)
- [Contoh 13 peserta dengan grafik](Laporan-Contoh-13-Peserta.pdf)

PDF di folder ini dirender secara lokal menggunakan LibreOffice. Grafik contoh dirender melalui matplotlib sebagai pengganti Charts Google. Ini membantu pemeriksaan susunan dan tata letak; **bukan bukti hasil konversi Google Drive pada deployment nyata**.

Pratinjau diperbarui pada fix/paragraf-laporan-rata-kanan-kiri: narasi menggunakan paragraf mengalir, bukan pemotongan baris otomatis yang ditulis sebagai soft return. Pemeriksaan lokal mengukur tepi kata pada kedua sisi paragraf, dengan baris terakhir mengikuti penulisan paragraf normal.

JSON pendamping berisi jumlah halaman rancangan, ID contoh dan daftar isi untuk pemeriksaan otomatis. Jangan memasang folder ini sebagai Script/HTML Apps Script.

Reproduksi lokal dari root repository:

```sh
node apps-script/absensi-dashboard/tests/render-laporan-preview.mjs
```

Skrip menghasilkan DOCX dan metadata di /tmp/report-template-preview. Konversikan DOCX menggunakan LibreOffice, lalu salin PDF/JSON ke folder ini untuk memperbarui pratinjau. Periksa dengan `python apps-script/absensi-dashboard/tests/audit-laporan-preview.py` (PyMuPDF). Pemasangan aplikasi dijelaskan pada [panduan laporan](../../docs/LAPORAN_TEMPLATE.md).
