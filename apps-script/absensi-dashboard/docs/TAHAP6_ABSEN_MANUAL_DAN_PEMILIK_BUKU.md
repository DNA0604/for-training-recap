# Tahap 6 — rincian waktu, absen manual, dan pemeriksaan pemilik buku akses — 27 November 2026

Cakupan: **Akses.gs, Jenjang.gs, Code.gs (satu fungsi pembantu), PresensiManual.gs**. Pasang keempatnya bersama.

## Latar belakang (log nyata 26 November, Tahap 5 terpasang)

Buat QR 6,5 detik; absen manual **13,8 detik** (pemeriksaan akun 1,9 dan pemeriksaan ulang 1,1; sekitar 10,7 detik ada di dalam fungsinya sendiri). Pada pemuatan Monitoring, panggilan pertama yang menyentuh buku akses (`muatPengajuanKoreksiPanitia`) 2,4 detik, sedangkan anggota berikutnya yang memakai buku yang sama 0,25 detik. Biaya tetap `jalur_cepat` 1,2–1,9 detik pada setiap panggilan belum terpecah.

## 6A — rincian waktu lebih halus (tanpa perubahan perilaku)

Log `WAKTU` kini memecah `jalur_cepat` menjadi `cepat_properti`, `cepat_cache`, `cepat_jenjang`, `cepat_sesi_pengajar`; pembukaan buku akses menjadi `buka_buku` dan `cek_pemilik`; dan absen manual menjadi `pra_tulis` (fase baca) dan `tulis` (fase tulis).

## 6B — pembacaan sebelum penulisan pada absen manual

Pada `simpanPresensiManualIndex`, selama **fase sebelum penulisan pertama** (di dalam lock), hasil baca tabel dipakai ulang melalui mekanisme baca-per-permintaan yang sudah ada. Pemakaian ulang **dihentikan tepat sebelum tanda terima `PENDING`**, sehingga seluruh penulisan, tanda terima, dan verifikasi tulis tetap membaca langsung dari Google Sheets. Aktif hanya bila sakelar jalur cepat presensi menyala (`aktifkanValidasiCepatPresensiQR`); tanpa itu perilaku sama persis dengan sebelumnya. Dipulihkan pada setiap jalan keluar (`finally`), termasuk saat gagal.

**Batas yang diterima:** perubahan manual langsung di spreadsheet yang terjadi *selama beberapa detik fase baca* satu permintaan absen manual tidak terlihat oleh permintaan itu. Perubahan lewat aplikasi tidak mungkin terselip karena penulis lain memakai lock yang sama.

## 6C — pemeriksaan pemilik buku akses berbatas waktu

Pemeriksaan "buku akses dimiliki akun yang sama dengan database utama" (dua panggilan `getOwner` ke Drive) disimpan sampai **600 detik** bila cache otorisasi menyala (`aktifkanCacheOtorisasiPanitia`). Mode persiapan selalu memeriksa langsung. Batas dapat diubah lewat Script Property `AKSES_PEMILIK_TTL_DETIK` (30–3600; nilai lain kembali ke 600).

**Batas yang diterima:** penggantian pemilik spreadsheet akses baru terdeteksi setelah batas itu (kejadian yang sangat jarang).

## Bukti lokal

Layanan Google tiruan; hitungan panggilan, **bukan waktu Google**. Kondisi hangat, respons dan isi sheet **identik**.

| Aksi | Pembacaan data (T5 → T6) | Total panggilan | `getOwner` |
| --- | --- | --- | --- |
| Absen manual | 38 → 18 | 63 → 41 (−35%) | 2 → 0 |
| Buka buku akses (Manajemen Akses) | 8 → 8 | 23 → 21 | 2 → 0 |

Dengan ±0,25 detik per pembacaan, penghematan 20 pembacaan pada absen manual setara ±5 detik, ditambah dua panggilan `getOwner` yang masing-masing berbiaya Drive. Perkiraan, bukan janji.

## Pengujian

- **495 tes lulus** (486 sebelumnya + 9 baru di `tahap6.test.mjs`). Tujuh tes baru gagal pada kode Tahap 5, sehingga benar-benar mendeteksi perubahan; dua tes keselamatan lulus pada keduanya.
- **Mode jalur cepat dipaksa menyala** (cache otorisasi dan sakelar presensi menyala sejak awal; tambalan sheet dianggap perubahan lewat aplikasi): `FORCE_JALUR_CEPAT=1 npm test` (PowerShell: `$env:FORCE_JALUR_CEPAT=1; npm test`) menjalankan **seluruh tes perilaku yang ada** pada jalur cepat: 488 lulus, 7 dilewati (tes yang menegaskan keadaan bawaan mati), 0 gagal. Tes pencabutan-saat-menunggu-lock memakai `LOCK_RPC` agar bermakna pada kedua mode.
- Tes keselamatan baru: pencabutan lewat aplikasi (akun, cakupan, logout) saat penulisan menunggu lock tetap memblokir penulisan dengan cache menyala; permintaan absen manual yang diulang atau gagal memulihkan mode baca.

```bash
npm test
FORCE_JALUR_CEPAT=1 npm test
node apps-script/absensi-dashboard/tests/benchmark-tahap6.mjs --base=<hash commit Tahap 5>
```

## Pemasangan

Ganti `Akses.gs`, `Jenjang.gs`, `Code.gs`, dan `PresensiManual.gs` di Apps Script, lalu Deploy → Manage deployments → Edit → New version. Tidak ada langkah baru bila cache otorisasi dan sakelar presensi sudah menyala: 6B memakai sakelar jalur cepat presensi dan 6C memakai sakelar cache otorisasi. Untuk mematikan: `matikanValidasiCepatPresensiQR` (6B dan 5C) dan `matikanCacheOtorisasiPanitia` (6C, 5B).

## Belum diuji

Deployment Google, waktu nyata, dan tes browser.
