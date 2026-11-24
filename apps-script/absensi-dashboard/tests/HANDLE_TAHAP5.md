# Panduan dan Dokumentasi Tahap 5: Optimasi Jalur Tulis

**Proyek:** Monitoring Pelatihan (Pusat Pengembangan Aparatur Komdigi)  
**Teknologi:** Google Apps Script + Google Spreadsheet  
**Tanggal Rilis:** 24 November 2026  
**Status:** Selesai Diimplementasikan & Lolos Seluruh Pengujian  

---

## 1. Ringkasan Eksekutif

Tahap 5 berfokus pada penurunan waktu eksekusi aksi tulis operasional (seperti **buat token QR absensi**, **presensi manual**, **tambah program/sesi**, dan **impor peserta**) dengan memangkas pembacaan spreadsheet yang masih berulang pada jalur audit dan validasi:

| Sub-tahap | Fokus Perbaikan | Berkas yang Berubah | Estimasi Penghematan |
|---|---|---|---|
| **5A** | Menghilangkan pembacaan ganda tabel `Riwayat_Akses` | `Akses.gs` | −1 pembacaan sheet (≈0,25–0,5 detik) per validasi direktori |
| **5B** | Jalur cepat pemeriksaan ulang akun (`periksa_ulang`) sebelum menulis berbasis versi direktori | `Akses.gs` | −3 pembacaan sheet direktori (≈2,5–3,1 detik) pada setiap aksi tulis |
| **5C** | Perluasan penanda integritas 60 detik ke `buatTokenQR_` dan `simpanPresensiManualIndex` | `Code.gs`, `PresensiManual.gs`, `Akses.gs` | −6 pembacaan tabel integritas (≈1,4–1,6 detik) pada panggilan hangat |

**Dampak kumulatif:** Waktu eksekusi buat QR diperkirakan turun dari ~8,5 detik menjadi ~3,8–4,2 detik, dan absen manual dari ~24–29 detik menjadi ~6–8 detik pada panggilan hangat dengan cache menyala.

---

## 2. Rincian Teknis Implementasi

### 2A. Tahap 5A: Single-Pass `Riwayat_Akses` (`Akses.gs`)
- **Masalah:** Pada implementasi sebelumnya, setiap kali fungsi `direktoriAkses_(book)` dipanggil, sheet `Riwayat_Akses` dibaca ke memori (`dir.history`). Namun segera setelahnya, pemanggil memanggil `kelompokTransaksiAkses_(book)`, yang membaca ulang `tabelAkses_(book, 'Riwayat_Akses')` dari spreadsheet untuk kedua kalinya dalam panggilan yang sama.
- **Solusi:**
  - Fungsi `kelompokTransaksiAkses_(book, riwayatTable)` diperbarui untuk menerima argumen kedua opsional `riwayatTable`.
  - Jika tabel riwayat sudah dibaca oleh `direktoriAkses_`, hasilnya (`dir.history`) langsung diteruskan ke `kelompokTransaksiAkses_(book, dir.history)`.
  - Titik pemanggilan yang dioptimasi:
    1. `bacaSesiPanitiaTerkunci_` (baris ~434)
    2. `muatManajemenAksesPanitia` (baris ~298)
    3. `identitasDirektoriAkses_` (baris ~134)
    4. `aturLoginAplikasiPanitia` (baris ~353)

### 2B. Tahap 5B: Fast-Path `periksa_ulang` Berbasis Penanda Versi (`Akses.gs`)
- **Masalah:** Sebelum mengeksekusi operasi penulisan, gateway memanggil `periksaUlangSesiPanitia_` di dalam script lock. Sebelumnya, fungsi ini selalu memanggil `bacaSesiPanitia_(old.token, true)` yang membaca ulang seluruh spreadsheet akses (tab Pengguna, Penugasan_Jenjang, dan Riwayat_Akses) langsung ke spreadsheet, memakan waktu ~3,1 detik.
- **Solusi:**
  - Saat cache otorisasi (`cacheKonteksAktif_()`) menyala, `periksaUlangSesiPanitia_` mencoba memvalidasi sesi lewat `bacaSesiPanitiaCepat_(old.token)` terlebih dahulu.
  - Sesi tersimpan (`PropertiesService`) tetap diperiksa status pencabutan (`revoked`) dan kedaluwarsanya.
  - Konteks cache hanya sah jika `versiDirektoriAkses_()` saat ini persis sama dengan versi direktori saat entri cache dibuat.
  - Setiap perubahan akun/peran/penugasan melalui aplikasi otomatis menaikkan versi direktori (`naikkanVersiDirektoriAkses_()`) di bawah lock, sehingga perubahan hak akses **seketika membatalkan cache** dan memaksa pembacaan penuh.
  - Jika cache mati, kedaluwarsa, atau tidak valid, sistem otomatis kembali (*fallback*) ke pembacaan penuh `bacaSesiPanitia_(old.token, true)`.

### 2C. Tahap 5C: Perluasan Penanda Integritas (`Code.gs` & `PresensiManual.gs`)
- **Masalah:** Validasi seluruh data operasional (6 tabel: `Jenjang`, `Sesi`, `Keikutsertaan`, `Kehadiran`, `Catatan_Perilaku`, `Log_Absensi`) memakan waktu ~1,6 detik setiap kali membuat token QR dan presensi manual.
- **Solusi:**
  - Menambahkan argumen `{izinkanLewatiBaru: true}` pada pemanggilan `pastikanTidakAdaHapusTertunda_()` di:
    1. `buatTokenQR_` di `Code.gs` (baris ~2011, dipanggil oleh generator QR `terbitkanQRAbsensiDariGenerator`)
    2. `simpanPresensiManualIndex` di `PresensiManual.gs` (baris ~40)
  - Bila sakelar pemilik `aktifkanValidasiCepatPresensiQR` menyala dan sistem telah melewati validasi integritas penuh dalam 60 detik terakhir tanpa kegagalan (`integritasBaruLolos_()`), validasi 6 tabel dilewati.
  - Semua titik ubah-data lainnya (misalnya tambah program, tambah sesi, impor peserta) **tetap melakukan validasi penuh 100% setiap saat**. Kegagalan validasi apa pun langsung menghapus penanda lolos.

---

## 3. Pengecualian dan Batasan Keamanan (Tercatat di `AGENTS.md`)

1. **Jendela TTL untuk Edit Manual Spreadsheet Akses:**
   Perubahan akses yang dilakukan langsung dengan mengedit sel spreadsheet direktori akses (bukan melalui antarmuka aplikasi) baru akan terdeteksi setelah batas TTL cache (bawaan 30 detik atau nilai `AKSES_CACHE_TTL_DETIK`). Perubahan melalui antarmuka aplikasi tetap berlaku instan.
2. **Jendela Integritas 60 Detik untuk QR dan Presensi Manual:**
   Jika spreadsheet operasional dirusak secara manual di luar aplikasi pada saat penanda integritas aktif, pembuatan QR dan presensi manual dapat berjalan maksimal hingga 60 detik sebelum pemeriksaan integritas penuh berikutnya mendeteksi kerusakan tersebut.
3. **Pencabutan Sesi dan Penutupan Instan:**
   Pencabutan token sesi (*logout*), penonaktifan login aplikasi, atau penugasan ulang via aplikasi tetap berlaku instan dan gagal-aman (*fail-closed*).

---

## 4. Berkas yang Harus Dipasang di Google Apps Script

Bila ingin memperbarui deployment Apps Script, ganti isi berkas-berkas berikut:
1. **`Akses.gs`** (implementasi 5A dan 5B)
2. **`Code.gs`** (implementasi 5C pada `buatTokenQR_`)
3. **`PresensiManual.gs`** (implementasi 5C pada `simpanPresensiManualIndex`)

---

## 5. Hasil Pengujian Otomatis

Seluruh pengujian unit dan integrasi lulus dengan 0 kesalahan:
- `tahap5.test.mjs`: **9/9 lulus** (pengujian spesifik 5A, 5B, 5C)
- `handle-tahap4.test.mjs`: **4/4 lulus**
- `diagnostik-waktu.test.mjs`: **4/4 lulus**
- `integritas-tahap3.test.mjs`: **7/7 lulus**
- `akses-cache-konteks.test.mjs`: **9/9 lulus**
- `beranda.test.mjs`: **12/12 lulus**
- `sesi-akses.test.mjs`: **47/47 lulus**
- **Total Pengujian Inti:** **92/92 lulus (0 gagal)**
