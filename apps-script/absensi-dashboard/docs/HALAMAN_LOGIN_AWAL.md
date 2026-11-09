# Halaman awal login — 9 November 2026

Branch: **feat/halaman-login-awal**, melanjutkan revisi konsep foto `92fa5bb` dan paket audit UI `a39f828`.

Pengguna mengizinkan implementasi langsung dengan foto pada pratinjau sebelumnya. Halaman awal kini memakai panel gedung/identitas berwarna navy dan panel masuk Google putih. Teks kecil nama aplikasi di atas judul panel kiri tetap dihilangkan. Pada ponsel, panel tersusun vertikal. Bantuan akun, informasi peran dan batas sesi empat jam tampil tanpa pilihan peran atau pendaftaran mandiri.

## File yang dipasang

Jika seluruh pembaruan aplikasi sebelumnya sudah terpasang, **cukup ganti isi lengkap `Akses.gs`**:

1. Buka [Akses.gs lengkap](https://github.com/DNA0604/for-training-recap/blob/feat/halaman-login-awal/apps-script/absensi-dashboard/Akses.gs), pilih **Raw**, lalu salin seluruh isinya ke file Script `Akses.gs` yang sudah ada di Apps Script.
2. Simpan. Foto dan logo sudah di dalam kode; tidak perlu mengunggah gambar ke Drive, memasang HTML baru, menambah sheet atau mengubah konfigurasi OAuth.
3. Untuk URL `/exec`, buka **Deploy → Manage deployments → Edit → New version**, lalu perbarui deployment yang sama. Pertahankan URL agar QR dan callback Google tetap mengarah ke alamat yang berlaku.
4. Muat ulang aplikasi. Untuk melihat halaman awal, keluar dahulu atau buka profil browser lain. Sesi yang masih sah langsung melanjutkan halaman tujuan.

Jika paket audit UI 4 November belum dipasang, gunakan juga tujuh sumber pada [panduan audit UI](UI_JARAK_TUTUP_MODAL_PESERTA.md) dari **branch login ini**, termasuk `Akses.gs` terbaru ini. Jika pembaruan pemuatan belum dipasang, sertakan `Code.gs` dari branch ini sesuai panduan tersebut. Jangan menimpa dengan `Akses.gs` branch lama setelah memasang halaman login. Prasyarat nilai akhir/presensi/evaluasi yang sudah ada tetap berlaku; folder preview, docs, tests dan screenshot bukan file editor Apps Script.

## Cara kerja dan maintenance

- Desain diterapkan pada overlay `#panitiaAuth` dalam `bridgeAplikasiPanitia_`, yang dipakai semua halaman terlindungi. URL utama dan `?page=masuk` tetap menggunakan alur Beranda yang sama. Callback tetap diverifikasi server.
- Saat memeriksa sesi, hanya indikator pemuatan ringkas yang tampil. Sesi aktif tidak memerlukan klik selamat datang dan tidak meminta foto gedung.
- Logo resmi kecil disematkan dalam markup. Foto diminta sekali per dokumen ketika akses perlu menampilkan login/error. Pengambilan ini berjalan terpisah dari persiapan Google; gagal mengambil foto tetap menyisakan latar navy dan tombol login yang berfungsi.
- Fungsi publik `muatIlustrasiLoginPanitia()` hanya mengembalikan gambar dekoratif tetap. Fungsi ini mengabaikan semua argumen, tidak membaca akun/konfigurasi/spreadsheet, tidak menerima URL/ID file, tidak mengambil sumber eksternal dan tidak membuka metode gateway operasional. Jangan menaruh data, token atau informasi internal pada fungsi ini.
- Foto adalah turunan yang sebelumnya digunakan pada pratinjau, **bukan foto udara yang terakhir dikirim**. Asal gambar tercatat pada [ASSETS.json konsep](../previews/konsep-login-awal/ASSETS.json). Untuk penyajian, PNG yang sama dienkode JPEG kualitas 84 tanpa mengubah ukuran 1122 × 1402 atau memotong ulang, menjadi 328.714 byte; data URI 438.311 karakter hanya ada pada respons ilustrasi, bukan HTML tiap halaman. [Metadata aset implementasi](../previews/halaman-login-awal/ASSETS.json).
- Masa login tetap maksimal empat jam sejak penerbitan, termasuk setelah browser ditutup; akses akun/peran/penugasan dan pencabutan tetap diperiksa server. Tidak ada perubahan aturan data, nilai, JP, presensi, sidebar, QR publik atau laporan.

## Bukti pengujian dan pemeriksaan setelah pemasangan

**433 pengujian backend lulus**, serta pemeriksaan 19 hash sumber, 37 script GS/inline (scriptlet server digantikan saat parse) dan ID HTML. Pengujian lokal memakai backend sintetis dan Chromium dengan layanan Google disimulasikan. Backend memeriksa isolasi endpoint gambar dan penolakan melalui gateway operasional, selain regresi aplikasi. Browser memeriksa tampilan 1440/780/390/320 px, konsistensi pada enam halaman, gambar/logo/bantuan, kegagalan gambar, sesi aktif tanpa permintaan gambar/login, login/callback, empat jam, pemulihan browser, logout lintas tab, navigasi, Admin/Petugas/Pengajar dan penilaian. Screenshot implementasi ada di [folder ini](../previews/halaman-login-awal/).

Setelah memasang, periksa login Google asli pada Admin, Petugas dan Pengajar; buka kembali browser selama sesi masih sah; coba logout dan buka URL langsung; serta periksa ukuran tampilan desktop/ponsel. Pengujian lokal tidak membuktikan keberhasilan OAuth/deployment Google atau kecepatan jaringan nyata. Agent tidak mengubah spreadsheet, deployment Google atau branch main.
