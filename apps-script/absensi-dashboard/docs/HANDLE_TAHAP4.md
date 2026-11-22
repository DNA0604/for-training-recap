# Tahap 4 — pemakaian ulang objek spreadsheet/sheet, TTL cache, dan rincian waktu — 20 November 2026

Cakupan: **Code.gs, Akses.gs, Jenjang.gs** (ketiganya perlu diganti bersama). Tidak ada perubahan tampilan, skema sheet, aturan akses, atau data.

## Latar belakang (data pengujian nyata)

Log `WAKTU` pada deployment menunjukkan, dengan cache otorisasi menyala: membuat QR 16,1 detik (pemeriksaan akun 4,9), absen manual 29,0 detik (pemeriksaan akun 8,5), dan memuat kehadiran 11,3 detik (pemeriksaan akun 5,5). Cache tidak membantu karena batas 30 detik lebih pendek daripada jeda antar aksi (31–300 detik), sehingga hampir setiap panggilan memakai jalur penuh. Satu absen manual juga memanggil `getActiveSpreadsheet` ±142 kali, mencari sheet yang sama 91 kali, dan membuka buku akses 3 kali (pemeriksaan pemilik 6 kali).

## 1. Pakai ulang objek spreadsheet dan sheet dalam satu panggilan gateway

Selama satu panggilan gateway, objek spreadsheet aktif, objek sheet yang sudah dicari, dan buku akses (termasuk pemeriksaan pemiliknya) dipakai ulang. **Tidak ada isi sheet yang disimpan**: setiap pembacaan nilai tetap langsung ke Google Sheets. Pemakaian ulang berakhir saat panggilan selesai atau gagal (`memoHandle_` kembali `null`), sehingga tidak ada yang terbawa ke panggilan berikutnya, dan tidak berlaku untuk halaman publik (QR peserta) maupun pembukaan buku akses mode persiapan. Sheet yang belum ada tidak dicatat (jadi sheet baru yang dibuat di tengah panggilan tetap ditemukan).

Perbandingan sebelum/sesudah, layanan tiruan, panggilan ke layanan Google dihitung (bukan detik nyata; respons dan isi sheet **identik** pada 5 aksi):

| Aksi | Total panggilan lama → baru | `getActiveSpreadsheet` | `getSheetByName` | `openById` | `getOwner` | Pembacaan data |
| --- | --- | --- | --- | --- | --- | --- |
| Muat kehadiran sesi | 100 → 39 | 60 → 1 | 14 → 12 | 1 → 1 | 2 → 2 | 15 → 15 |
| Muat beranda | 100 → 35 | 63 → 1 | 13 → 10 | 1 → 1 | 2 → 2 | 13 → 13 |
| Buat QR absen | 168 → 73 | 64 → 1 | 38 → 12 | 3 → 1 | 6 → 2 | 33 → 33 |
| Absen manual | 329 → 102 | 142 → 1 | 91 → 11 | 3 → 1 | 6 → 2 | 58 → 58 |
| Tambah program | 231 → 86 | 95 → 1 | 56 → 11 | 3 → 1 | 6 → 2 | 37 → 37 |

Jumlah pembacaan data tidak berubah. Berapa detik yang benar-benar terhemat bergantung pada biaya tiap jenis panggilan di Google, yang belum kita ketahui; ukur ulang dengan log `WAKTU`.

## 2. Batas cache otorisasi dapat diatur pemilik (tanpa memasang ulang kode)

Bawaan tetap **30 detik**. Untuk mengubahnya: Apps Script → **Project Settings → Script Properties → Add script property**, nama `AKSES_CACHE_TTL_DETIK`, nilai angka 5–600 (detik). Nilai kosong, di luar rentang, atau bukan angka akan kembali ke 30 detik. Perubahan akses lewat Manajemen Akses tetap berlaku seketika; hanya **pengeditan manual langsung di spreadsheet** yang paling lambat berlaku setelah batas ini. Untuk pengujian disarankan 300.

## 3. Rincian waktu per tahap pada log

Baris `WAKTU` kini memuat `jalankan_ms` (waktu fungsi itu sendiri) dan `tahap`: `jalur_cepat`, `auth_penuh`, `tunggu_lock`, `buku_akses`, `direktori`, `periksa_ulang` (pemeriksaan ulang akun sebelum menulis), dan `integritas` (validasi seluruh data), semua dalam milidetik, tanpa token atau data peserta.

## Pengujian

475 pengujian lulus (471 sebelumnya + 4 baru di `handle-tahap4.test.mjs`): tiap sheet dan spreadsheet hanya dicari sekali per panggilan; pemakaian ulang berakhir juga setelah panggilan gagal dan perubahan sheet langsung terlihat pada panggilan berikutnya; TTL dari Script Property berlaku dengan cadangan aman; log menampilkan rincian tahap tanpa token. Satu tes lama (`pemuatan-data.test.mjs`, perbandingan jumlah pencarian sheet) disesuaikan: pembanding "asli"-nya kini juga mematikan lapisan pemakaian ulang baru.

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-handle-tahap4.mjs --base=<hash commit sebelum Tahap 4>
```

## Belum diuji

Deployment Google, waktu nyata, dan tes browser. Setelah dipasang: tetapkan `AKSES_CACHE_TTL_DETIK` ke 300, ulangi alur yang sama (buka Monitoring, buat QR, absen manual), lalu bandingkan baris `WAKTU` (terutama `tahap`).
