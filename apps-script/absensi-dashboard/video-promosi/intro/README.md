# Pratinjau animasi intro — tiga logo

Pratinjau **8 detik, 1920 × 1080, 30 fps** menggunakan ketiga logo asli dari `Logo-Logo.zip` kiriman pengguna. Versi ini memperlihatkan gerakan visual; **belum memakai musik atau narasi**.

**[Unduh / putar Pratinjau_Intro_Logo.mp4](https://github.com/DNA0604/for-training-recap/blob/video/pratinjau-intro-logo/apps-script/absensi-dashboard/video-promosi/intro/Pratinjau_Intro_Logo.mp4?raw=true)**

[![Pratinjau gerakan intro](Pratinjau_Intro_Logo.gif)](https://github.com/DNA0604/for-training-recap/blob/video/pratinjau-intro-logo/apps-script/absensi-dashboard/video-promosi/intro/Pratinjau_Intro_Logo.mp4?raw=true)

GIF di atas adalah pratinjau 960 × 540, 12 fps. MP4 mempunyai resolusi dan gerakan penuh. Jika GitHub menampilkan halaman berkas, gunakan **Download raw file**.

## Alur visual

- **00:00–00:02:** logo Politeknik STIA LAN Jakarta, LAN dan Komdigi masuk bertahap di latar terang.
- **00:02–00:05:** ketiga logo ditahan agar terbaca.
- **00:05–00:08:** kelompok logo bergeser ke atas dan judul **Monitoring Pelatihan Pegawai** masuk, diikuti **Dari persiapan hingga evaluasi.**

Warna dan proporsi logo dipertahankan. Berkas STIA mempunyai ruang kosong serta fragmen terpisah di sisi kanan; viewport tampilan dibatasi ke logo utama. **Berkas gambar asli tidak diubah atau digambar ulang.** Urutan mengikuti kiriman pengguna, tanpa menambahkan klaim hubungan kerja sama.

## Pratinjau diam dan sumber

- [Susunan tiga logo](Pratinjau_Logo.png)
- [Susunan judul](Pratinjau_Judul.png)
- [Unduh paket HTML dan aset untuk diputar lokal](https://github.com/DNA0604/for-training-recap/blob/video/pratinjau-intro-logo/apps-script/absensi-dashboard/video-promosi/intro/Paket_Pratinjau_Intro.zip?raw=true)
- [HTML animasi yang dapat disunting](intro.html)
- [Metadata sumber logo](SUMBER_ASET.json)
- [Hasil pemeriksaan](PEMERIKSAAN_INTRO.json)

Untuk paket lokal, ekstrak ZIP lalu buka `intro.html` pada browser. Tombol putar/jeda, ulangi dan penggeser waktu berada di luar komposisi video. Paket ini tidak memerlukan koneksi ke Google atau layanan eksternal. Kontrol tersebut tidak direkam ke MP4.

Dari root repository, dengan Python, Playwright, Chromium dan FFmpeg yang sudah tersedia:

```bash
python apps-script/absensi-dashboard/video-promosi/intro/render_intro.py
```

Renderer memakai HTML lokal, aset asli dan waktu deterministik, lalu menghasilkan 240 frame untuk MP4 H.264 dengan `faststart`. Tidak memakai gambar generatif atau membuat ulang logo. Frame sementara berada di folder temporer. GIF dibuat dari MP4 untuk pratinjau ringan di GitHub.

Ini pratinjau **intro**, bukan film promosi lengkap. Durasi kerja keseluruhan tetap sekitar 4:08 dan dapat disesuaikan sampai sekitar 4:20. Gaya intro belum ditinjau pengguna. Sumber aplikasi, tiga panduan Word, data Google, deployment dan branch main tetap utuh.
