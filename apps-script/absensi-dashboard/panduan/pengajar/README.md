# Panduan Pengajar — Word

Panduan Pengajar versi 1.0 tersedia sebagai **Microsoft Word (.docx)** yang dapat disunting dan dilengkapi gambar sesuai akses Pengajar.

**[Unduh Panduan_Pengajar.docx](https://github.com/DNA0604/for-training-recap/blob/docs/panduan-pengajar/apps-script/absensi-dashboard/panduan/pengajar/Panduan_Pengajar.docx?raw=true)**

Pada halaman berkas GitHub, gunakan **Download raw file**, lalu buka dengan Microsoft Word. Dokumen ini bukan berkas yang dipasang ke editor Apps Script.

Isi versi 1.0: **6 bab, 22 petunjuk dan 17 gambar**. Pemeriksaan tata letak lokal menghasilkan 24 halaman; jumlah halaman dapat berubah setelah redaksi, font atau gambar disunting.

1. Tugas, cakupan sesi dan pembagian tanggung jawab.
2. Verifikasi akun, login, Beranda dan navigasi.
3. Pemilihan sesi, daftar peserta dan profil.
4. Pembacaan kehadiran, catatan perilaku, izin serta rekap/CSV.
5. Evaluasi peserta enam aspek, penyimpanan per halaman, pemeriksaan hasil, perbaikan nilai dan penanda sumber berubah.
6. Pemeriksaan akhir, koordinasi, logout dan kendala umum.

Pengajar mengisi evaluasi peserta pada sesi yang ditugaskan. Buku membedakan pembacaan informasi kelas dari pencatatan/validasi presensi oleh Petugas/Admin. Evaluasi Panitia, penilaian Pengajar oleh Admin, nilai akhir gabungan, pengaturan bobot dan keputusan verifikasi bukan tindakan Pengajar.

## Menyunting dokumen

Judul, uraian, **76 langkah bernomor**, keterangan gambar dan **6 tabel** menggunakan elemen Word asli. Tangkapan layar disisipkan sebagai ilustrasi; halaman buku tidak diratakan menjadi gambar.

- Ubah redaksi langsung pada paragraf atau tabel.
- Gunakan gaya Heading yang tersedia untuk judul.
- Setelah perubahan memengaruhi halaman, perbarui field di Word desktop, misalnya **Ctrl+A, F9**, untuk nomor halaman dan rujukan halaman daftar isi. Sesuaikan judul pada tabel daftar isi bila redaksinya diganti.
- Gunakan **Ubah Gambar / Change Picture** untuk mengganti tangkapan layar.

Hasil pengukuran kecepatan dan sejarah perbaikan aplikasi tidak dimasukkan dalam buku.

## Pratinjau

- [Sampul](Pratinjau_Sampul.png)
- [Petunjuk login](Pratinjau_Login.png)
- [Pengisian evaluasi peserta](Pratinjau_Evaluasi_Peserta.png)
- [Pemeriksaan hasil tersimpan](Pratinjau_Hasil_Tersimpan.png)

Hasil akhir tetap Word. PDF sementara hanya dipakai di luar repository untuk pemeriksaan tata letak.

## Sumber dan pemeriksaan internal

Gambar diambil melalui Chromium dari HTML hasil renderer aplikasi saat ini (`7dacfb0`), menggunakan akun/data sintetis dan respons backend dengan akses Pengajar. Layanan Google disimulasikan; tidak ada akses atau perubahan pada login Google, spreadsheet maupun data produksi.

[Metadata gambar](SUMBER_GAMBAR.json) menyimpan selector, keterangan dan hash 17 gambar. Backend lokal digunakan untuk memperoleh kondisi belum dinilai, tersimpan, perbaikan nilai, sumber berubah dan daftar lebih dari 20 peserta. Sebelas tindakan/sesi di luar akses diperiksa tetap ditolak, termasuk sesi lain dalam Jenjang yang sama. Tampilan tidak memperoleh nilai akhir gabungan.

[Hasil pemeriksaan](HASIL_PEMERIKSAAN.json) mencatat struktur Word, rujukan halaman, hash sumber dan keutuhan dokumen sebelumnya. Seluruh 19 sumber aplikasi dan Word Admin/Petugas tetap identik; tidak ada perubahan Google data, deployment atau branch main. Tata letak diperiksa dengan LibreOffice lokal, bukan konversi PDF menjadi Word.

Sumber penyusunan:

- [Isi panduan](isi_panduan.json)
- [Pembuat Word](buat_word.py)
- [Pengambilan gambar](ambil_gambar.py) dan [fixture Pengajar](fixture-pengajar.mjs)
- [Pemeriksa Word](periksa_word.py)

Untuk membuat ulang dari root repository, dengan Python, python-docx, Playwright, Pillow, lxml dan Chromium yang tersedia:

```bash
python apps-script/absensi-dashboard/panduan/pengajar/ambil_gambar.py
python apps-script/absensi-dashboard/panduan/pengajar/buat_word.py
python apps-script/absensi-dashboard/panduan/pengajar/periksa_word.py
```

Pembuat Word memakai `halaman_bab.json` untuk isi awal rujukan halaman. Perubahan isi besar memerlukan pemeriksaan ulang tata letak dan rujukan tersebut. Script dokumentasi ini tidak dipasang ke aplikasi.

Ini panduan peran terakhir dalam cakupan terbaru: **Admin Pelatihan, Petugas Kelas dan Pengajar**. Pengguna membatalkan panduan Peserta karena peserta hanya memakai presensi. Panduan Pengajar menunggu peninjauan pengguna; video dan penyerahan kepada instansi tetap pekerjaan terpisah.
