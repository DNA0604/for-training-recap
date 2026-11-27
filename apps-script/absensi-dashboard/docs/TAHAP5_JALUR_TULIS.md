# Tahap 5 — jalur tulis: satu kali baca riwayat, pemeriksaan ulang berversi, dan penanda integritas lebih luas — 24 November 2026

Cakupan: **Akses.gs, Code.gs (satu baris), PresensiManual.gs (satu baris)**. Kode berasal dari cabang `update-tahap-5-pemuatan-data` milik pemilik proyek dan telah diperiksa dan diuji ulang pada repositori lengkap (Tahap 1–4 + fitur lain). Dokumen ini menggantikan `tests/HANDLE_TAHAP5.md` pada cabang itu.

## Ringkasan

| Sub-tahap | Perubahan | Berkas | Sifat |
| --- | --- | --- | --- |
| **5A** | `Riwayat_Akses` di-parse satu kali per pemeriksaan akun penuh (hasil baca `direktoriAkses_` dilewatkan ke `kelompokTransaksiAkses_`) | Akses.gs | Selalu aktif, hasil sama |
| **5B** | Pemeriksaan ulang akun sebelum menulis (`periksaUlangSesiPanitia_`) memakai jalur cepat berversi bila cache otorisasi menyala | Akses.gs | Hanya bila cache otorisasi menyala |
| **5C** | Penanda integritas 60 detik juga dipakai oleh `buatTokenQR_` (buat QR) dan `simpanPresensiManualIndex` (absen manual) | Code.gs, PresensiManual.gs | Hanya bila sakelar `aktifkanValidasiCepatPresensiQR` menyala |

### 5A
Titik yang diubah: `bacaSesiPanitiaTerkunci_`, `muatManajemenAksesPanitia`, `identitasDirektoriAkses_`, `aturLoginAplikasiPanitia`. Setiap titik sudah memiliki hasil `direktoriAkses_` (`dir.history`) dan kini meneruskannya. Menghemat dua pembacaan (nilai dan rumus) pada tiap pemeriksaan penuh.

### 5B
Saat cache otorisasi menyala, pemeriksaan ulang di dalam lock mencoba `bacaSesiPanitiaCepat_` terlebih dahulu, lalu kembali ke pembacaan penuh bila tidak sah. Tetap berlaku langsung: sesi tersimpan (pencabutan, logout, kedaluwarsa 4 jam), konfigurasi login, daftar Jenjang, dan penugasan sesi Pengajar. Entri cache hanya sah bila kunci versi direktori saat ini sama dengan saat entri dibuat; setiap perubahan akun, peran, atau penugasan lewat aplikasi, serta setiap transaksi akses yang tertunda, menaikkan versi di bawah lock sehingga **langsung** membatalkan cache. Penulis direktori hanya bekerja di bawah lock yang sama dengan pemeriksaan ulang, sehingga tidak ada perubahan lewat aplikasi yang bisa terselip.

**Batas yang diterima:** pengeditan manual langsung di spreadsheet direktori kini juga baru terlihat pada pemeriksaan ulang setelah batas TTL cache (`AKSES_CACHE_TTL_DETIK`, bawaan 30 detik). Sebelum 5B, pemeriksaan ulang selalu langsung ke direktori.

### 5C
Penanda 60 detik (Tahap 3B) kini dapat dilewati oleh tiga titik masuk: `simpanAbsensiPeserta`, `buatTokenQR_`, dan `simpanPresensiManualIndex`. Semua titik ubah-data lain (tambah program/sesi, impor, edit, hapus, dan seterusnya) tetap memvalidasi seluruh data setiap kali. Kegagalan validasi menghapus penanda seketika. **Batas yang diterima:** kerusakan manual pada data operasional dapat tidak terdeteksi oleh tiga alur ini paling lama 60 detik.

## Bukti lokal

Layanan Google tiruan; hitungan panggilan, **bukan waktu Google**. Kondisi hangat: cache otorisasi dan penanda integritas menyala. Respons dan isi sheet **identik** pada kedua aksi.

| Aksi | Pembacaan data (Tahap 4 → 5) | Total panggilan layanan |
| --- | --- | --- |
| Buat QR absen | 27 → 13 | 59 → 31 (−47%) |
| Absen manual | 52 → 38 | 88 → 63 (−28%) |

Absen manual masih membaca banyak tabel secara berulang (Jenjang, Sesi, Keikutsertaan); itu kandidat tahap berikutnya.

## Pengujian

`tests/tahap5.test.mjs` (11 tes) belum ada pada cabang asal dan ditambahkan di sini: 5A membaca `Riwayat_Akses` sekali; 5B pemeriksaan ulang melewati direktori saat cache menyala dan membaca direktori saat mati; penonaktifan akun lewat aplikasi, transaksi akses tertunda, dan logout memblokir pemeriksaan ulang seketika; edit manual terlihat setelah TTL; kenaikan versi memaksa jalur penuh sekali; 5C buat QR dan absen manual melewati validasi dalam 60 detik sedangkan tambah program tetap penuh, sakelar mati selalu penuh, dan kegagalan validasi menghapus penanda. Tes lama `akses-cache-konteks.test.mjs` yang menegaskan "pemeriksaan ulang selalu langsung" disesuaikan dengan 5B. Enam dari sebelas tes baru gagal pada kode Tahap 4, sehingga benar-benar mendeteksi perubahan; lima tes keamanan lulus pada keduanya.

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-tahap5.mjs --base=<hash commit Tahap 4>
```

## Pemasangan

Ganti `Akses.gs`, `Code.gs`, dan `PresensiManual.gs` di Apps Script, lalu Deploy → Manage deployments → Edit → New version. Untuk merasakan 5B, cache otorisasi harus menyala (`aktifkanCacheOtorisasiPanitia`); untuk 5C, sakelar `aktifkanValidasiCepatPresensiQR` harus menyala. Tanpa keduanya perilaku identik dengan sebelum Tahap 5 (kecuali 5A).

## Belum diuji

Deployment Google, waktu nyata, dan tes browser.
