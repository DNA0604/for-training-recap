# Pemuatan data utama — 10 November 2026

Branch **perf/pemuatan-prioritas-utama**, melanjutkan `511f9df` / Verifikasi Akun. Pengguna meminta fokus pada pemuatan data dan menyatakan bagian lainnya tidak bermasalah. Pembaruan ini terbatas pada pembacaan awal dan urutan pemuatan; tampilan, alur login/verifikasi, nilai, JP, presensi dan laporan mengikuti versi yang sama.

## Pasang empat file bersama-sama

Ganti seluruh isi empat file berikut dari **branch yang sama**:

- [Akses.gs](https://github.com/DNA0604/for-training-recap/blob/perf/pemuatan-prioritas-utama/apps-script/absensi-dashboard/Akses.gs)
- [Index.html](https://github.com/DNA0604/for-training-recap/blob/perf/pemuatan-prioritas-utama/apps-script/absensi-dashboard/Index.html)
- [Peserta.html](https://github.com/DNA0604/for-training-recap/blob/perf/pemuatan-prioritas-utama/apps-script/absensi-dashboard/Peserta.html)
- [Pengelolaan.html](https://github.com/DNA0604/for-training-recap/blob/perf/pemuatan-prioritas-utama/apps-script/absensi-dashboard/Pengelolaan.html)

Buka setiap file di GitHub, pilih **Raw**, salin seluruh isinya ke file bernama sama di Apps Script. Simpan keempatnya, lalu pilih **Deploy → Manage deployments → Edit → New version** pada deployment yang sudah berjalan. Pertahankan URL dan konfigurasi proyek. `Akses.gs` dan `Index.html` perlu dipasang bersama agar sinyal pemuatan utama tersambung.

Tidak ada file GS/HTML baru, spreadsheet, kolom, migrasi atau perubahan manifest. Berkas docs/tests bukan file yang ditambahkan ke editor Apps Script. Prasyarat paket sebelumnya tetap berlaku; sumber pada branch ini sudah mencakup halaman login dan Verifikasi Akun sebelumnya.

## Temuan yang diperbaiki

1. **Daftar Peserta dibaca dua kali saat membuka tautan dengan Jenjang.** Sebelumnya `changeProgram()` lebih dahulu memuat daftar dengan Jenjang otomatis/semua, baru `init()` menerapkan Jenjang dari tautan dan memicu pembacaan kedua. Sekarang Jenjang tujuan yang valid diterapkan sebelum satu pemuatan daftar. Perubahan program, pencarian, pagination dan Muat Ulang tetap mengambil data baru. Jenjang tidak dikenal tetap memakai pilihan awal seperti sebelumnya.
2. **Parameter tautan ditunggu setelah data program selesai.** Pada Peserta, Pengelolaan dan Monitoring, pembacaan parameter Google dimulai bersamaan dengan persiapan data program. Ia tidak membaca data peserta atau memerlukan perubahan otorisasi. Peserta/Pengelolaan mempertahankan batas tunggu 700 ms yang sebelumnya sudah ada; Monitoring tetap menerima callback lokasi yang terlambat agar konteks sesi langsung tidak dibuang.
3. **Riwayat Monitoring dapat mulai sebelum kehadiran saat callback lokasi lambat.** Riwayat koreksi/verifikasi sekarang dimulai sesudah pemilihan awal dan pemuatan kehadiran selesai, termasuk saat permintaan kehadiran gagal. Jika tidak ada sesi, riwayat tetap dimuat. Bila callback lokasi belum datang, setelah 700 ms riwayat boleh mulai selama tidak ada pemuatan kehadiran berjalan; pemilihan manual juga membuka pemuatan riwayat setelah kehadiran selesai. Beranda mempertahankan urutannya. Grup empat metode baca tetap sama.
4. **Ringkasan peserta Pengelolaan mengulang pembacaan sumber dalam satu permintaan.** Pembungkus baca `muatRingkasanPesertaIndex` kini menggunakan snapshot baca yang sama seperti pembaca peserta yang dipanggilnya. Snapshot hanya hidup selama permintaan itu, dibuang saat selesai/recheck, dan tidak digunakan ulang pada permintaan lain. Bentuk respons, total dan sepuluh peserta yang ditampilkan tetap sama. Metode ini tetap hanya untuk Admin; tidak ditambahkan ke grup RPC dashboard.

Pemeriksaan sesi, direktori, penugasan dan kepemilikan tetap dilakukan. Perbaikan tidak menambah cache lintas halaman/permintaan atau mengaktifkan snapshot untuk penyimpanan/ekspor.

## Bukti lokal

Data sintetis 22, 100 dan 500 peserta digunakan untuk membandingkan delapan pembacaan Admin sebelum/sesudah, termasuk ringkasan peserta Pengelolaan. **Seluruh 24 respons lengkap identik.**

| Pemeriksaan | Sebelum | Sesudah |
| --- | --- | --- |
| Permintaan awal daftar Peserta melalui tautan Program + Jenjang | 2 | 1 |
| Pembacaan range nilai/formula untuk satu ringkasan peserta Pengelolaan, termasuk sumber akses | 15 | 11 |
| Pencarian sheet dalam permintaan ringkasan yang sama | 20 | 11 |
| Ringkasan peserta yang ditampilkan | Maks. 10 | Maks. 10 |

[Bukti perbandingan backend](../tests/results/pemuatan-prioritas-2026-11-10.json). Ini adalah hitungan layanan tiruan dan waktu CPU Node, **bukan waktu Google Sheets/Apps Script**. Waktu CPU tidak selalu turun karena snapshot menyalin data untuk menjaga isolasi. Keuntungan yang dituju adalah menghindari pembacaan sumber dan permintaan yang tidak perlu serta memberi prioritas pada tabel utama. Angka review 2,5 menit belum diukur ulang pada deployment Google dan tidak dijanjikan turun ke angka tertentu.

**445 pengujian backend lulus**, bersama pengujian Chromium di bawah. Pemeriksaan 19 hash sumber, 37 script GS/inline (scriptlet server digantikan saat parse) dan ID HTML lulus; 15 sumber aplikasi lain identik, serta markup/CSS ketiga HTML yang diperbarui identik dengan versi sebelumnya. Pengujian mencakup kesetaraan respons, tidak ada penulisan, data terbaru pada permintaan selanjutnya, penolakan Petugas/akun nonaktif, parameter dan respons utama yang sengaja ditahan secara terpisah, satu daftar Peserta dengan Jenjang benar, Muat Ulang segar, prioritas kehadiran, riwayat pada kegagalan/tanpa sesi, callback lokasi terlambat, desktop/ponsel serta regresi aplikasi/peran/Jenjang/evaluasi. Pengujian memakai HTML aplikasi hasil injeksi server dan layanan Google yang disimulasikan.

Jalankan dari root repository:

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-prioritas-pemuatan.mjs --base=511f9df
python apps-script/absensi-dashboard/tests/browser/pemuatan_prioritas_browser.py
python apps-script/absensi-dashboard/tests/browser/pemuatan_audit_browser.py
```

## Pengukuran setelah pemasangan

Ulangi review Admin dengan urutan, data dan koneksi yang sama seperti pengukuran sekitar 2,5 menit. Catat waktu menunggu per halaman dan total alur; ulangi tiga kali untuk membedakan pembukaan pertama dari pengulangan. Fokus pada Beranda, Monitoring/kehadiran/Rekap, Pengelolaan dan Peserta.

Pencatat waktu yang sudah ada tetap tersedia pada Console **frame aplikasi**, bukan pembungkus Google:

```js
console.table(window.pelatihanPemuatan.baca().permintaan)
```

Catat halaman dan tindakan yang paling lama. Durasi mencakup jaringan, antrean dan eksekusi server sekaligus; panggilan paralel tidak boleh dijumlahkan menjadi waktu halaman. Petunjuk penyalinan metadata dan batas privasinya ada pada [panduan pengukuran sebelumnya](PEMERIKSAAN_PEMUATAN_DATA.md#mengukur-di-deployment-google).

Agent tidak mengubah data/deployment Google atau branch main. Penerimaan kecepatan di Google tetap menunggu hasil pengukuran pengguna; buku panduan dan video belum dikerjakan pada putaran ini.
