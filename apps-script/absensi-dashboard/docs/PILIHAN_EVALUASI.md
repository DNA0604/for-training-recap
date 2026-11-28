# Tombol Evaluasi dan jarak tindakan Ringkasan Sesi

Branch `ui/pilihan-evaluasi` melanjutkan `fcb4c4f`. Pembaruan ini hanya merapikan akses form evaluasi dan jarak tombol; aturan penilaian, kewenangan server, spreadsheet, sesi login dan sidebar tetap.

## Pemasangan

Setelah paket Presensi ringkas sebelumnya terpasang, ganti seluruh isi **dua file** berikut bersama-sama dari branch ini:

- [Index.html](../Index.html): kelompok tombol Ringkasan Sesi dengan jarak 12 piksel.
- [Evaluasi.gs](../Evaluasi.gs): tombol Evaluasi dan dialog pilihan yang memakai form/handler sebelumnya.

Buka file di GitHub → **Raw** → salin kode lengkap. Simpan proyek dan perbarui versi deployment yang sama melalui Manage deployments. Tidak perlu file Apps Script, sheet, migrasi atau perubahan manifest baru. Semua file lain tetap dari paket sebelumnya; snapshot aktif tetap 18 HTML/GS.

## Hasil

Ringkasan Sesi pada Admin/Petugas memuat **Presensi**, **Catat Sikap & Perilaku**, dan **Evaluasi**, dengan jarak yang konsisten. Pada Admin, Evaluasi membuka pilihan berurutan:

1. **Evaluasi Peserta (Panitia)** — Nilai kedisiplinan, kerja sama, dan prakarsa peserta pada sesi ini.
2. **Evaluasi Pengajar** — Nilai pelaksanaan pengajaran pada sesi yang dipilih.
3. **Lihat Evaluasi Peserta (Pengajar)** — Tinjau hasil enam aspek evaluasi peserta yang diisi oleh Pengajar.

Pilihan mengikuti peran lama: Petugas hanya Evaluasi Peserta (Panitia), Pengajar hanya Isi Evaluasi Peserta pada sesi mengajarnya. Admin tetap hanya membaca hasil evaluasi peserta yang diisi Pengajar. Tidak ada penambahan kewenangan melalui tombol baru.

Dialog memiliki X dan dukungan Escape. Memilih evaluasi menutup pilihan sebelum membuka form yang bersangkutan; menutup form mengembalikan fokus ke tombol Evaluasi. Membuka/menutup dialog pilihan tidak memuat atau menyimpan nilai. Pilihan nonaktif bila belum memilih sesi; form lama tetap mempertahankan pemeriksaan akhir sesi, draf/konfirmasi tutup, pemulihan request yang sama, tabel scroll/header tetap serta perbarui rekap.

## Verifikasi

- **407 pengujian backend lolos**; fungsi backend dan RPC tidak diubah.
- Chromium dengan HTML aplikasi terinjeksi sebenarnya: Admin/Petugas/Pengajar pada 1440/390 px, urutan/pembatasan pilihan, jarak ≥12 px, tidak ada RPC evaluasi pada buka/tutup pilihan, X/Escape/fokus, sesi kosong, serta seluruh alur tiga rubrik/save/retry/rekap yang sudah ada lolos.
- Suite Presensi manual/evidence/pagination tetap lolos. Seluruh sumber dan skrip injeksi berhasil diparse; ID HTML serta hash sumber diperiksa.

Agent tidak menulis data Google, memperbarui deployment, atau menggabungkan main. Setelah pemasangan, uji kembali menu Evaluasi sesuai peran pada deployment Google; layanan Google pada pengujian lokal memakai tiruan.
