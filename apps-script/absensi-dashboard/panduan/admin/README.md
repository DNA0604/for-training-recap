# Panduan Admin Pelatihan — Word

Versi pertama panduan Admin sudah disusun dalam **Microsoft Word (.docx)**, mengikuti permintaan dokumen yang dapat disunting dan dilengkapi gambar aplikasi.

## Unduh dokumen

**[Unduh Panduan_Admin_Pelatihan.docx](https://github.com/DNA0604/for-training-recap/blob/docs/panduan-admin-pelatihan/apps-script/absensi-dashboard/panduan/admin/Panduan_Admin_Pelatihan.docx?raw=true)**

Jika membuka halaman berkas di GitHub, gunakan tombol **Download raw file** untuk menyimpan berkas Word, lalu buka dengan Microsoft Word. Dokumen ini tidak dipasang ke editor Apps Script.

Isi versi 1.0: **12 bab, 44 petunjuk, 39 gambar**. Pemeriksaan tata letak lokal menghasilkan 46 halaman. Jumlah halaman dapat menyesuaikan setelah redaksi, font atau ukuran gambar diubah di Word.

1. Mengenal aplikasi dan alur kerja Admin.
2. Masuk, Beranda dan navigasi.
3. Akun dan penugasan Petugas.
4. Program, Jenjang, sesi dan Pengajar.
5. Pendaftaran, impor dan profil peserta.
6. Presensi QR/manual, izin dan JP.
7. Catatan sikap/perilaku, validasi, indikator dan aturan.
8. Tiga jenis evaluasi serta rekap spreadsheet.
9. Verifikasi sesi, koreksi langsung dan tindak lanjut pengajuan lama.
10. Rekap Program, rincian nilai, bobot, CSV dan laporan program.
11. Pemeriksaan, perubahan, penghapusan serta proses yang terhenti.
12. Logout dan kendala umum.

## Menyunting di Word

Judul, uraian, **170 langkah bernomor**, keterangan gambar dan **9 tabel** menggunakan elemen Word asli. Screenshot disisipkan sebagai gambar, bukan meratakan seluruh halaman menjadi satu gambar.

- Ubah redaksi langsung pada paragraf atau tabel.
- Gunakan gaya Heading yang sudah ada untuk judul/bab yang diubah.
- Setelah perubahan memengaruhi halaman, pilih seluruh dokumen lalu perbarui field (misalnya **Ctrl+A, F9** pada Word desktop) untuk nomor halaman dan rujukan halaman daftar isi. Judul bab pada tabel daftar isi dapat disesuaikan langsung bila redaksinya diganti.
- Gambar dapat diganti melalui fasilitas **Ubah Gambar / Change Picture** pada Word.

Hasil pengukuran kecepatan dan sejarah pengembangan tidak dimasukkan dalam buku. Tiga panduan peran lainnya masih menunggu tahap penyusunan berikutnya.

## Pratinjau gambar

- [Sampul](Pratinjau_Sampul.png)
- [Petunjuk login](Pratinjau_Login.png)
- [Presensi manual](Pratinjau_Presensi_Manual.png)

Berkas akhir yang diserahkan adalah Word. Pratinjau di atas berupa PNG; PDF hanya digunakan sementara di luar repository untuk pemeriksaan tata letak.

## Sumber dan pemeriksaan internal

Acuan sumber aplikasi: `7dacfb0`. Gambar ditangkap dari HTML aplikasi hasil renderer server yang sama dengan versi aplikasi, melalui Chromium. Akun/data pada gambar menggunakan fixture sintetis dan layanan Google disimulasikan; tidak ada akses ke spreadsheet atau login Google pengguna. [Metadata gambar](SUMBER_GAMBAR.json) mencatat selector, keterangan dan hash 41 gambar yang diambil; 39 dipakai pada buku.

[Hasil pemeriksaan](HASIL_PEMERIKSAAN.json) mencatat struktur Word yang dapat diedit, rujukan halaman, pemeriksaan isi dan hash 19 sumber aplikasi yang tetap identik. Tata letak diperiksa secara lokal dengan LibreOffice; berkas final tetap DOCX dan tidak melalui konversi PDF-ke-Word.

Sumber penyusunan:

- [Isi panduan yang dapat dipakai membuat ulang](isi_panduan.json)
- [Pembuat dokumen Word](buat_word.py)
- [Pengambilan gambar](ambil_gambar.py) dan [fixture sintetis](fixture-admin.mjs)
- [Pemeriksa Word](periksa_word.py)

Untuk pengembangan dokumentasi dari root repository, dengan Python/Playwright/python-docx/Pillow dan Chromium yang tersedia:

```bash
python apps-script/absensi-dashboard/panduan/admin/ambil_gambar.py
python apps-script/absensi-dashboard/panduan/admin/buat_word.py
python apps-script/absensi-dashboard/panduan/admin/periksa_word.py
```

Pembuat Word membaca `halaman_bab.json` untuk isi awal rujukan halaman. Perubahan isi besar memerlukan pemeriksaan/pembaruan rujukan tersebut. Fixture dan script hanya untuk dokumentasi lokal, bukan file yang dipasang ke Apps Script. Tidak ada perubahan sumber aplikasi, konfigurasi, data Google, deployment atau branch main.
