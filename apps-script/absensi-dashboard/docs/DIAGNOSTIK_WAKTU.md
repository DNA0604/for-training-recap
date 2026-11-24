# Diagnostik waktu per panggilan — 19 November 2026

Halaman **Executions** di Apps Script hanya menampilkan `panggilAplikasiPanitia` untuk semua panggilan panitia, sehingga tidak terlihat RPC mana yang lambat. Perubahan ini (hanya **Akses.gs**) menambahkan **satu baris log per panggilan** yang menyebutkan nama RPC dan rincian waktunya. Tidak ada perubahan perilaku, data, atau hak akses.

## Cara membaca

1. Buka Apps Script → **Executions**.
2. Klik panah di ujung kanan satu baris `panggilAplikasiPanitia` untuk melihat lognya.
3. Cari baris berawalan `WAKTU`, misalnya:

```
WAKTU {"rpc":"terbitkanQRAbsensiDariGenerator","total_ms":8200,"auth_ms":1900,"status":"ok"}
```

- `rpc`: nama fungsi yang dipanggil. Pembacaan dashboard yang digabung tampil sebagai `kelompok` dengan `rincian` waktu tiap anggota.
- `auth_ms`: waktu memeriksa sesi dan akun sebelum fungsi dijalankan.
- `total_ms − auth_ms`: waktu fungsi itu sendiri.
- `status`: `ok` atau `galat`.

Log hanya memuat nama RPC dan milidetik, tanpa token, argumen, atau data peserta. Halaman publik QR (`muatTampilanAbsensiQR`, `cariPesertaAbsensi`, `simpanAbsensiPeserta`) sudah tampil dengan namanya sendiri di Executions.

Waktu di browser = durasi Executions + waktu jaringan + waktu mulai Apps Script. Panggilan pertama setelah lama tidak dipakai biasanya lebih lambat (instans baru), jadi bandingkan beberapa panggilan berurutan.

## Temuan awal: membuat QR absen

Pada layanan tiruan, satu pembuatan QR memakai 29 pembacaan sheet (23 dengan cache otorisasi menyala), 3 pembukaan spreadsheet (2), dan 2 lock (1). Fungsi ini menjalankan validasi integritas penuh, pemeriksaan ulang akun langsung ke direktori, dan membaca `Riwayat_Akses` 6–8 kali. Angka ini hitungan panggilan, bukan detik.
