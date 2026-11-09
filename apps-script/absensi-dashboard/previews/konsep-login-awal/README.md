# Konsep halaman awal login — 9 November 2026

**Status: konsep dan pratinjau UI, belum diintegrasikan.** Pengguna meminta merancang konsep serta UI terlebih dahulu. Folder ini bukan paket pengganti Apps Script. Tidak ada file aplikasi, konfigurasi, akun, spreadsheet atau deployment yang diubah. Branch `design/konsep-login-awal` melanjutkan `a39f828`.

![Pratinjau desktop](login-desktop.png)

[Pratinjau ponsel](login-mobile.png) · [Prototipe HTML lokal](index.html)

## Revisi panel kiri

Pengguna menyukai panel kiri dan meminta dua penyesuaian: memakai foto gedung yang baru dikirim dengan fokus pada bangunan, serta menghapus tulisan kecil “Monitoring Pelatihan Pegawai” di atas judul. Kedua perubahan diterapkan pada prototipe dan tangkapan layar desktop/ponsel. Kartu login kanan, logo, judul utama dan alur pratinjau dipertahankan. Nama aplikasi pada footer tidak ikut dihapus.

## Arah desain

Satu halaman sambutan sekaligus login, dengan tampilan formal dan hangat mengikuti navy/putih dashboard. Desktop memakai dua panel dalam bingkai membulat: kiri memperkenalkan instansi dan fungsi aplikasi; kanan memberi satu tindakan utama **Masuk dengan Google**. Foto gedung diberi lapisan navy melalui CSS agar teks tetap terbaca. Pada ponsel panel disusun vertikal; judul/pengantar dipersingkat secara visual dan tombol login tetap mudah ditemukan.

Isi panel pengenalan:

- Logo dan nama Pusat Pengembangan Aparatur Komdigi.
- Identitas Kementerian Komunikasi dan Digital Republik Indonesia.
- Nama aplikasi tetap pada footer; label kecil di atas judul sudah dihapus sesuai revisi pengguna.
- Judul **“Satu tempat untuk memantau pelatihan.”**
- Gambaran singkat Program & Sesi, Presensi, serta Evaluasi & Laporan. Label fitur adalah informasi, bukan tautan yang memberi akses sebelum login.

Isi kartu login:

- Sapaan Selamat datang dan penjelasan singkat tujuan login.
- Satu tombol Masuk dengan Google; tanpa form email/kata sandi kedua.
- Petunjuk menggunakan akun yang sudah didaftarkan Admin Pelatihan.
- Catatan bahwa akses mengikuti peran/penugasan dan sesi maksimal empat jam sejak login.
- Bantuan ringkas “Akun belum terdaftar?” yang menyarankan menghubungi Admin, bukan pendaftaran akun publik.
- Nama tiga peran sebagai informasi, bukan pilihan peran.

Tidak ditambahkan akun demo, statistik palsu, pemilihan jabatan/peran, fitur pendaftaran mandiri atau tombol untuk melewati login. Animasi cukup untuk indikator proses; tidak memakai animasi latar berat atau font/CDN eksternal.

## Alur yang harus dipertahankan jika nanti diterapkan

1. Periksa sesi tersimpan dengan server sebagaimana sistem sekarang.
2. Sesi masih sah di bawah empat jam: lanjutkan ke halaman tujuan yang diizinkan, tanpa meminta klik Google atau menampilkan halaman sambutan sebagai penghalang tambahan.
3. Sesi tidak ada/kedaluwarsa: tampilkan desain login ini dengan tombol Google aktif setelah alur login siap.
4. User klik Google; proses verifikasi akun serta peran tetap menggunakan backend saat ini. Identitas atau kewenangan tidak ditentukan dari tampilan.
5. Akun tidak terdaftar, perubahan akun, akses ditahan/ditolak dan gangguan jaringan tetap mempunyai pesan/tindakan sesuai alur yang sudah ada. Teks contoh pada prototipe perlu disesuaikan dengan keadaan server saat implementasi.

Pratinjau menyediakan lima keadaan visual: awal login, memeriksa sesi, sesi masih aktif, akun belum terdaftar dan koneksi bermasalah. Tombol Google di prototipe hanya menampilkan keadaan memeriksa; tidak menghubungi Google atau masuk ke aplikasi. Bagian “Lihat contoh keadaan tampilan” di bawah halaman adalah kontrol peninjauan desain, bukan bagian dari rancangan produk final.

## Aset dan ketergantungan

Logo resmi tetap berasal dari aset DOCX yang diberikan pengguna dan tidak diubah: `logo-komdigi.png`, SHA-256 `53d63f5e5eacbce7eca95d9a27ecfa57aca46f43b8efb15ee00cb0ee236ad4c7`.

Foto panel kiri sekarang memakai referensi foto gedung baru dari pesan pengguna, menggantikan gambar cover laporan. Karena foto inline tersebut tidak tersedia sebagai berkas lokal, aset `gedung-komdigi-baru.png` pada prototipe merupakan hasil pembingkaian ulang berbantuan image generation, **bukan salinan piksel identik dari foto asli**. Referensinya tetap gedung yang dikirim pengguna; permintaan pemrosesan membatasi pada fokus bangunan tanpa perubahan desain bangunan. Metadata dan hash ada di [ASSETS.json](ASSETS.json). Bila memakai foto asli untuk integrasi produksi, gunakan berkas asli yang diberikan pengguna; aset ilustrasi pratinjau ini tidak otomatis menjadi keputusan produksi.

Tata letak menampilkan foto dengan crop CSS di bagian atas/fasad; lapisan navy menjaga keterbacaan. Semua aset lokal, font memakai sistem seperti dashboard, tidak ada layanan gambar/font eksternal. Ukuran gambar pratinjau belum merupakan optimasi produksi; foto tidak boleh menahan pemeriksaan sesi atau tombol login jika nanti diterapkan. Cover laporan produksi tidak diganti.

## Melihat prototipe secara lokal

Buka `index.html` melalui server statis lokal. Contoh dari root repositori:

```bash
python -m http.server 8765 --bind 127.0.0.1 --directory apps-script/absensi-dashboard/previews/konsep-login-awal
```

Akses `http://127.0.0.1:8765/`. Gunakan pilihan keadaan di bagian bawah atau parameter `?state=checking`, `?state=remembered`, `?state=unregistered`, `?state=error` untuk melihat contoh lain. GitHub blob/Raw menampilkan kode HTML, bukan layanan hosting untuk prototipe; gambar PNG di atas dapat dilihat langsung tanpa menjalankan apa pun.

Pratinjau diperiksa pada Chromium di **1440×900, 390×900 dan 320×740**: logo termuat, tombol jelas, tidak ada overflow horizontal, bantuan/keadaan visual dapat dipilih, tidak ada error JavaScript, serta seluruh permintaan hanya ke server lokal (tidak ada OAuth/RPC/analitik eksternal). Tidak ada klaim pengujian login nyata atau deployment Google dari pekerjaan konsep ini.

Untuk tahap berikutnya, pengguna meninjau komposisi, judul, penggunaan foto dan isi kartu. Kode login produksi baru diubah setelah arah desain diminta untuk diterapkan. Perubahan ini tidak merupakan penerimaan otomatis terhadap paket UI atau pemuatan sebelumnya.
