# Tahap 7 — pengajuan koreksi tanpa pembacaan besar dan daftar Jenjang ditunda untuk Admin — 28 November 2026

Cakupan: **hanya Akses.gs**. Tidak ada sakelar baru dan tidak ada pengecualian aturan proyek: tidak ada data yang disimpan, hanya pembacaan yang tidak diperlukan yang dilewati.

## Latar belakang (log nyata, Tahap 6 terpasang)

Pemuatan Monitoring: `muatPengajuanKoreksiPanitia` 2,3 detik dari total 3,2 detik. Biaya tetap `jalur_cepat` 0,7–1,1 detik, dan di dalamnya `cepat_jenjang` 0,56–1,13 detik. Buka buku dan pemeriksaan pemilik ternyata murah setelah 6C (`buka_buku` 0,18–0,36 detik); dugaan sebelumnya bahwa membuka buku akses menelan ±1,5 detik **keliru**: waktu `muatPengajuanKoreksiPanitia` justru berasal dari pembacaan tabel Peserta, Keikutsertaan, dan Sesi.

## 7A — daftar pengajuan koreksi

`muatPengajuanKoreksiPanitia_` selalu membaca tiga tabel besar (Peserta, Keikutsertaan, Sesi, masing-masing divalidasi) hanya untuk mengisi nama pada pengajuan yang ada. Bila **tidak ada pengajuan** (keadaan umum), kini langsung mengembalikan `{sukses:true,pengajuan:[]}` tanpa membaca tabel itu. Bila ada, hasil dan urutan sama seperti sebelumnya; pencarian nama memakai peta (kecocokan pertama, sama dengan perilaku `find` lama).

Perbedaan kecil: pada kondisi data yang rusak (validasi Jenjang gagal), daftar kosong tidak lagi melempar galat dari validasi yang tidak diperlukan. RPC lain yang membaca tabel itu tetap memvalidasi.

## 7B — daftar Jenjang ditunda untuk Admin

Pemeriksaan akun pada jalur cepat selalu membaca Program dan Jenjang untuk menyusun daftar Jenjang pada konteks. Pemeriksaan server hanya memakai daftar itu untuk peran terbatas (Petugas Kelas dan Pengajar); Admin tidak pernah mengaksesnya. Pada panggilan gateway dan pemeriksaan ulang sebelum menulis, daftar Jenjang untuk Admin kini dibaca **hanya saat properti `jenjang` benar-benar diakses** dan dihitung sekali. Petugas, Pengajar, dan respons boot ke klien (`muatSesiAplikasiPanitia`) tetap menyusunnya langsung. Pembatalan akses lewat aplikasi, status akun, sesi, dan semua pemeriksaan lain tidak berubah.

## Bukti lokal

Layanan Google tiruan; hitungan panggilan, **bukan waktu Google**. Kondisi hangat (cache otorisasi dan sakelar presensi menyala, entri cache Admin sudah terisi), respons dan isi sheet **identik**.

| Aksi Admin | Pembacaan data (T6 → T7) | Total panggilan |
| --- | --- | --- |
| Daftar pengajuan koreksi (kosong) | 7 → 2 | 17 → 7 (−59%) |
| Muat kehadiran sesi | 9 → 8 | 19 → 17 |
| Absen manual | 14 → 11 | 37 → 33 |
| Buat QR absen | 9 → 5 | 25 → 20 |

Pada pemuatan Monitoring, penghematan 5 pembacaan pada daftar koreksi kira-kira ±1,5–2 detik (perkiraan dari log Anda).

## Pengujian

**500 tes lulus** (495 sebelumnya + 5 baru di `tahap7.test.mjs`). Dua tes baru gagal pada kode Tahap 6 (pembacaan tidak berkurang), sehingga benar-benar mendeteksi perubahan; tiga tes keselamatan lulus pada keduanya. `FORCE_JALUR_CEPAT=1 npm test` juga lulus (lihat catatan CHANGELOG).

```bash
npm test
FORCE_JALUR_CEPAT=1 npm test
node apps-script/absensi-dashboard/tests/benchmark-tahap7.mjs --base=<hash commit Tahap 6>
```

## Pemasangan

Ganti `Akses.gs` di Apps Script, lalu Deploy → Manage deployments → Edit → New version. Tidak ada langkah baru.

## Belum diuji

Deployment Google, waktu nyata, dan tes browser.
