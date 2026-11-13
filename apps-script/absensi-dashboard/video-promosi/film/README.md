# Pratinjau lengkap — Monitoring Pelatihan Pegawai

Versi visual pertama mengikuti satu program pelatihan dari persiapan hingga evaluasi dan pemanfaatan hasilnya. **Durasi 4 menit 8 detik, Full HD 1920 × 1080, 30 fps.** Intro delapan detik yang telah disetujui dipertahankan.

**[Putar / unduh Pratinjau_Dashboard_Lengkap.mp4](https://github.com/DNA0604/for-training-recap/blob/video/promosi-dashboard-lengkap/apps-script/absensi-dashboard/video-promosi/film/Pratinjau_Dashboard_Lengkap.mp4?raw=true)**

**Versi ini berisi animasi visual dan teks, tanpa musik atau narasi suara.** Teks narasi tersedia sebagai [subtitle Indonesia](Narasi_Indonesia.srt), dan dapat diaktifkan pada pemutar HTML. Suara belum dipilih atau diproduksi. Naskah profesional/natural yang disepakati tetap menjadi acuan tahap suara berikutnya.

![Ringkasan beberapa bagian video](Ringkasan_Adegan.jpg)

## Bagian video

| Waktu | Isi |
| --- | --- |
| 00:00–00:08 | Intro tiga logo asli, sesuai pratinjau yang disetujui |
| 00:08–00:33 | Perjalanan pelatihan dan informasi yang perlu dipantau |
| 00:33–00:58 | Pengenalan dashboard dan peran |
| 00:58–01:33 | Persiapan program, kelas dan peserta |
| 01:33–02:13 | Presensi QR/manual, izin dan pemantauan |
| 02:13–02:53 | Evaluasi Pengajar/Panitia dan catatan perilaku |
| 02:53–03:28 | Perhitungan JP, rekap, CSV dan laporan |
| 03:28–03:53 | Riwayat dan manfaat berkelanjutan |
| 03:53–04:08 | Penutup |

Animasi memakai teks bergerak, kartu alur, pergantian peran, pergerakan kamera, penunjuk interaksi, serta tampilan aplikasi saat ini. Tangkapan UI mengikuti akses Admin, Petugas Kelas dan Pengajar. Bahan laporan berasal dari renderer laporan aplikasi yang sama, dirender lokal untuk ilustrasi.

## Satu contoh yang konsisten

Program **Pelatihan Teknis Contoh → Dasar → Pengenalan Materi** mempunyai empat peserta simulasi:

- A: presensi QR datang/pulang, JP 2.
- B: manual Terlambat, potongan tetap 15 menit, JP 75/45 ≈ 1,67.
- C: manual Izin satu sesi penuh, JP 0, evaluasi berstatus tidak dinilai.
- D: manual Hadir/Tepat Waktu, JP 2.

Pengajar mengisi enam aspek; Panitia mengisi kedisiplinan, kerja sama dan prakarsa setelah sesi berakhir. Catatan kejadian, JP dan nilai evaluasi merupakan sumber/hasil berbeda. Admin meninjau verifikasi, menghitung JP dan membuka laporan untuk program selesai. Video tidak menetapkan kelulusan atau menampilkan fitur AI/prediksi.

## Menggunakan dan menyunting

- [Unduh paket pemutar HTML dan sumber visual](https://github.com/DNA0604/for-training-recap/blob/video/promosi-dashboard-lengkap/apps-script/absensi-dashboard/video-promosi/film/Paket_Sumber_Film.zip?raw=true)
- [Timeline yang dapat disunting](TIMELINE.json)
- [Animasi dan komposisi Canvas](film.js)
- [HTML pemutar](player.html)
- [Subtitle naskah narasi](Narasi_Indonesia.srt)
- [Metadata sumber UI](SUMBER_UI.json)
- [Hasil pemeriksaan film](PEMERIKSAAN_FILM.json)

Ekstrak paket, lalu buka `film/player.html`. Kontrol menyediakan putar/jeda, penggeser waktu, pilihan bab dan tampilan teks narasi. Kontrol berada di luar komposisi video dan tidak direkam. Pemutar tidak melakukan login Google, membaca spreadsheet atau mengirim perubahan data.

Bila browser membatasi pembukaan berkas lokal, sajikan folder hasil ekstraksi melalui server HTTP lokal. Dari repository dengan dependensi yang tersedia:

```bash
python apps-script/absensi-dashboard/video-promosi/film/buat_data.py
python apps-script/absensi-dashboard/video-promosi/film/render_film.py
python apps-script/absensi-dashboard/video-promosi/film/periksa_film.py
```

Pengambilan ulang UI memakai `ambil_ui.py` dan `fixture-film.mjs`, dengan backend aplikasi lokal dan layanan Google tiruan. QR historis serta tanda terima publik merupakan data simulasi; penyimpanan manual, penilaian, verifikasi dan perhitungan JP diperoleh melalui handler backend lokal asli. Semua gambar memakai data fiktif. Sumber aplikasi tetap `7dacfb0`; tidak ada pengujian atau perubahan pada data Google/deployment.

Untuk mereproduksi halaman laporan, fixture menulis DOCX contoh ke `/tmp/film-laporan-contoh.docx`. Renderer aplikasi menyusun dokumennya; LibreOffice lokal dipakai membuat gambar sampul dan hasil. Ilustrasi lokal ini tidak membuktikan keberhasilan ekspor Google Docs pada deployment.

Video lengkap ini masih **pratinjau visual untuk ditinjau**, dengan tahap suara dan penilaian pengguna berikutnya. Semua 19 sumber aplikasi, tiga panduan Word dan berkas intro yang telah disetujui tetap utuh. Branch main tidak diubah.
