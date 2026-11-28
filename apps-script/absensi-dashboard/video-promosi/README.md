# Konsep, naskah dan storyboard video promosi

Konsep yang disetujui: **Satu Perjalanan Pelatihan, dari Persiapan hingga Evaluasi**. Video ditujukan kepada pimpinan, pegawai pengelola dan stakeholder termasuk dosen/teman pengguna. Tujuannya agar penonton memahami konsep dashboard, merasakan pengalaman penggunaan, dan melihat manfaat jangka panjangnya.

## Pratinjau lengkap

**[Putar / unduh video lengkap 4 menit 8 detik](https://github.com/DNA0604/for-training-recap/blob/video/musik-efek-suara/apps-script/absensi-dashboard/video-promosi/film/Video_Dashboard_Musik_Efek.mp4?raw=true)**

[Lihat ringkasan adegan dan sumber yang dapat disunting](film/README.md). Versi terbaru memuat animasi, teks, musik instrumental asli dan efek suara ringan. **Narasi suara ditiadakan sesuai arahan terbaru pengguna.** Seluruh visual, termasuk intro yang disetujui, dipertahankan identik.

## Pratinjau intro

**[Putar / unduh MP4 intro delapan detik](https://github.com/DNA0604/for-training-recap/blob/video/promosi-dashboard-lengkap/apps-script/absensi-dashboard/video-promosi/intro/Pratinjau_Intro_Logo.mp4?raw=true)**

[Lihat GIF dan sumber animasi](intro/README.md). Pratinjau 1920 × 1080, 30 fps, tanpa musik/narasi.

## Draf untuk ditinjau

**[Unduh Draf_Naskah_Storyboard.docx](https://github.com/DNA0604/for-training-recap/blob/video/promosi-dashboard-lengkap/apps-script/absensi-dashboard/video-promosi/Draf_Naskah_Storyboard.docx?raw=true)**

Versi 0.3 berisi **9 bagian, 26 rencana tampilan dan 419 kata narasi**, termasuk intro logo sekitar delapan detik. Alokasi saat ini **4 menit 8 detik**, dengan kelonggaran hingga 4 menit 20 detik sesuai arahan pengguna. Word memakai teks dan tabel yang dapat disunting; 11 halaman pada pemeriksaan tata letak lokal. Ini storyboard tertulis dengan uraian visual/interaksi, teks layar, transisi dan catatan produksi. Pratinjau visual intro delapan detik sudah tersedia. Pratinjau visual lengkap sudah tersedia pada bagian di atas. Naskah narasi di dalam draf ini merupakan arsip tahap perencanaan; keputusan produksi terbaru memakai teks visual, musik dan efek, tanpa narasi suara.

- [Baca naskah dan storyboard di GitHub](NASKAH_STORYBOARD.md)
- [Pratinjau konsep](Pratinjau_Konsep.png)
- [Pratinjau halaman rancangan intro logo](Pratinjau_Intro_Logo.png)
- [Pratinjau bagian pembuka](Pratinjau_Pembuka.png)
- [Pratinjau bagian presensi](Pratinjau_Presensi.png)

## Intro logo

Logo **Politeknik STIA LAN Jakarta, LAN dan Komdigi** direncanakan dalam satu baris pada latar putih, masuk lembut, ditahan agar terbaca, kemudian tersambung ke judul dashboard. Warna dan proporsi asli dipertahankan. [Pratinjau intro delapan detik sudah dirender](intro/README.md) memakai PNG asli dari Logo-Logo.zip kiriman pengguna.

Aset sumber sudah tersedia. Berkas logo asli disimpan identik; viewport STIA menampilkan area logo utama agar ruang kosong dan fragmen tambahan di tepi kanan tidak ikut tampil. Pratinjau memakai latar terang, gerak masuk bertahap dan perpindahan ke judul; belum memakai musik/narasi.

## Alur kerja

1. Intro tiga logo institusi.
2. Kebutuhan pemantauan pelatihan.
3. Pengenalan dashboard dan peran.
4. Persiapan kelas oleh Admin.
5. Presensi dan pencatatan oleh Petugas.
6. Evaluasi peserta oleh Pengajar/Panitia dan catatan kejadian.
7. Rekap, JP dan laporan pendukung.
8. Riwayat dan manfaat berkelanjutan.
9. Penutup identitas produk dan instansi.

Satu program dan peserta contoh digunakan sepanjang video agar tindakan dan hasilnya saling terhubung. Detail waktu dan redaksi masih merupakan draf. Hasil kerja saat ini 16:9 Full HD, durasi 4:08, dengan komposisi instrumental dan efek asli. Narasi suara tidak digunakan; penilaian video bersuara oleh pengguna menjadi langkah berikutnya.

## Bahan kerja

- [Konsep sumber dan metadata referensi](STUDI_REFERENSI.md)
- [Naskah dalam JSON](NASKAH_STORYBOARD.json)
- [Pembuat Word](buat_draf_word.py)
- [Hasil pemeriksaan dokumen](PEMERIKSAAN_DRAF.json)

Untuk membuat ulang Word, dari root repository dengan Python dan python-docx:

```bash
python apps-script/absensi-dashboard/video-promosi/buat_draf_word.py
```

Waktu adegan/tampilan berurutan dan berjumlah 248 detik; seluruh narasi terdapat dalam Word. PDF sementara hanya dipakai di luar repository untuk pemeriksaan halaman. Seluruh 19 sumber aplikasi dan tiga panduan Word sebelumnya tetap identik. Tidak ada perubahan kode, data Google, deployment atau branch main dalam penyusunan draf ini.
