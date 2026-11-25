# Tahap 3 — validasi integritas lebih ringan — 19 November 2026

Melanjutkan Tahap 1 dan 2. Cakupan: **Jenjang.gs, Hapus.gs, Code.gs (satu baris), Akses.gs (dua sakelar)**. Bagian A selalu aktif dan tidak mengubah hasil. Bagian B **mati secara bawaan** dan hanya menyala bila pemilik menyalakannya.

## Masalah yang diatasi

Hampir semua aksi ubah-data (tambah program/sesi, impor peserta, presensi manual, presensi QR peserta, dan lainnya; 22 titik masuk) menjalankan `validasiIntegritasOperasionalJenjang_` terlebih dahulu: memeriksa relasi Jenjang pada Sesi, Keikutsertaan, Kehadiran, Catatan_Perilaku, dan Log_Absensi. Pemeriksaan ini membaca Jenjang, Sesi, dan Keikutsertaan berulang kali untuk setiap tabel yang diperiksa. Satu pemeriksaan memakai **17 pembacaan sheet**. Log_Absensi bertambah setiap ada pemindaian QR, sehingga pemeriksaan ini makin berat seiring waktu dan dijalankan di dalam lock yang sama untuk semua peserta yang sedang presensi.

## A. Satu pembacaan per tabel (selalu aktif)

Jenjang, Sesi, dan Keikutsertaan dibaca satu kali lalu dipakai ulang untuk memeriksa tabel lainnya. Urutan pemeriksaan dan pesan galat **tidak berubah** (tabel dibaca satu per satu sesuai urutan semula). Hasilnya **17 → 6 pembacaan** per pemeriksaan, berapa pun jumlah datanya. Semua aksi ubah-data ikut lebih ringan.

## B. Jalur cepat presensi QR peserta (default MATI)

Bila dinyalakan, setelah satu pemeriksaan integritas seluruh data lolos, sebuah penanda disimpan **60 detik**. Selama penanda berlaku, **hanya `simpanAbsensiPeserta`** (presensi QR peserta) melewati pemeriksaan seluruh data. Ini memotong beban saat banyak peserta memindai bersamaan.

Pengaman yang tetap berlaku:
- Semua jalur ubah-data lain tetap memeriksa penuh setiap kali, juga saat penanda ada.
- Pemeriksaan penghapusan tertunda, verifikasi sesi tertunda, status migrasi Jenjang, dan relasi yang dipakai langsung oleh presensi QR (sesi, keikutsertaan, token) tetap dijalankan setiap kali.
- Kegagalan pemeriksaan menghapus penanda seketika, sehingga presensi QR ikut diblokir.
- Penanda hanya dibuat oleh pemeriksaan penuh yang lolos.

**Batas yang perlu Anda ketahui.** Jika data diubah manual langsung di spreadsheet sehingga relasi Jenjang rusak, presensi QR bisa tetap berjalan paling lama 60 detik sebelum pemeriksaan penuh berikutnya menemukannya. Ini penyimpangan terbatas dari aturan "validasi integritas di setiap ubah-data" dan hanya berlaku bila sakelar menyala; pengecualiannya dicatat di AGENTS.md.

### Menyalakan dan mematikan

Hanya pemilik spreadsheet. Di editor Apps Script pilih **`aktifkanValidasiCepatPresensiQR`** lalu Run (mematikan: **`matikanValidasiCepatPresensiQR`**). Keadaan terlihat di Project Settings → Script Properties: kunci berawalan `INTEGRITAS_QR_CEPAT|` bernilai `aktif` berarti menyala.

## Bukti lokal

Layanan Google tiruan; hitungan pembacaan sheet, **bukan waktu Google**.

| Pemeriksaan / aksi | Pembacaan sheet data pelatihan (lama → baru) |
| --- | --- |
| Validasi integritas penuh | 17 → 6 |
| Tambah program | 32 → 21 |
| Tambah sesi | 37 → 26 |
| Impor 5 peserta | 45 → 34 |
| Guard presensi QR, sakelar menyala, dalam 60 detik | 7 → 1 (11 → 5 termasuk buku akses) |

Respons dan isi sheet identik pada 6 aksi ubah-data; pesan galat identik pada 4 kasus data rusak (jenjang tidak dikenal, sesi hilang, keikutsertaan ganda, relasi peserta kosong). **467 pengujian lulus** (460 sebelumnya + 7 baru di `integritas-tahap3.test.mjs`): setiap tabel dibaca satu kali; galat tidak berubah; jalur QR penuh saat sakelar mati; saat menyala hanya QR yang melewati dan jalur lain tetap penuh; penanda kedaluwarsa dan terhapus saat gagal; hanya pemilik yang bisa mengubah sakelar; presensi QR tetap menulis satu log dan idempoten. Tes lama gagal pada guard lama, jadi benar-benar mendeteksi perubahan.

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-integritas-tahap3.mjs --base=<hash commit sebelum Tahap 3>
```

## Sengaja belum dikerjakan

**Membaca hanya baris/kolom yang ditampilkan** (mis. hanya baris Kehadiran milik sesi yang dibuka) tidak dilakukan pada tahap ini. Alasannya: (1) setelah Tahap 2, setiap permintaan baca sudah membaca tiap sheet hanya sekali; (2) setiap pembacaan tabel Jenjang divalidasi seluruh barisnya, jadi pembacaan sebagian mengharuskan mengubah cara validasi itu bekerja; (3) Monitoring memakai ringkasan seluruh daftar peserta dengan paginasi sisi klien (aturan proyek); (4) manfaatnya bergantung pada ukuran data asli, yang belum kita ketahui (di data uji, satu sesi sudah separuh isi Kehadiran). Setelah Anda mengukur di deployment, kita putuskan apakah perlu.

**Pemeriksaan verifikasi sesi tertunda** pada setiap presensi QR masih membuka buku akses (spreadsheet lain) setiap kali. Ini kandidat perbaikan berikutnya.

## Cara uji setelah dipasang

Pasang Jenjang.gs, Hapus.gs, Code.gs, dan Akses.gs (sakelar mati, perilaku sama seperti sebelumnya kecuali bagian A yang lebih ringan). Uji: tambah program/sesi, impor peserta, presensi QR dan manual. Untuk bagian B: nyalakan, lakukan beberapa presensi QR berurutan dan ukur waktunya; bila ada yang janggal, jalankan `matikanValidasiCepatPresensiQR`.
