# Verifikasi Akun pada halaman login

Branch **feat/verifikasi-akun-login**, melanjutkan halaman awal login `9d70134`.

Kotak “Akses sesuai peran dan penugasan Anda.” diganti dengan tombol **Verifikasi Akun**, di bawah tombol masuk Google. Keterangan batas sesi empat jam tetap tampil terpisah. Foto, panel kiri dan tampilan ponsel mengikuti versi sebelumnya.

## Alur pengguna

1. Admin mendaftarkan akun Google dan mengaktifkannya melalui Manajemen Akses. Penugasan Jenjang/sesi diberikan sesuai peran.
2. Pengguna membuka alamat aplikasi yang sama, lalu memilih **Verifikasi Akun**.
3. Pengguna memilih akun Google yang didaftarkan. Sistem memeriksa identitas Google dan kecocokannya dengan akun aktif. Identitas yang belum tertaut akan ditautkan melalui riwayat akses yang sudah ada.
4. Setelah berhasil, tampilan otomatis kembali ke panel login yang sama, dengan pesan **“Verifikasi akun berhasil. Pilih Masuk dengan Google untuk masuk ke aplikasi.”**
5. Pengguna memilih **Masuk dengan Google** untuk mulai menggunakan aplikasi. Masa sesi empat jam dimulai pada login aplikasi ini.

Akun yang sudah tertaut dapat diverifikasi kembali. Akun tidak terdaftar, tidak aktif, identitas berbeda atau verifikasi gagal tidak memperoleh sesi aplikasi. Pengguna tetap berada pada tampilan login dan dapat mengulang atau menghubungi Admin. Tombol masuk utama tetap dapat digunakan seperti sebelumnya; verifikasi ini merupakan pilihan pemeriksaan identitas, bukan aturan baru yang memaksa verifikasi terpisah setiap login. Sesi aplikasi yang masih sah tetap langsung melanjutkan halaman tujuan.

## Pemasangan

Jika versi halaman login sebelumnya sudah dipasang, cukup ganti **seluruh isi `Akses.gs`** dengan [file lengkap terbaru](https://github.com/DNA0604/for-training-recap/blob/feat/verifikasi-akun-login/apps-script/absensi-dashboard/Akses.gs).

1. Buka file di GitHub, pilih **Raw**, salin seluruh kode ke Script `Akses.gs` yang sudah ada.
2. Simpan, lalu pilih **Deploy → Manage deployments → Edit → New version** untuk deployment yang sama. Pertahankan URL dan konfigurasi OAuth yang sudah berjalan.
3. Logout atau buka profil browser lain untuk melihat tombol baru; akun dengan sesi aktif langsung masuk seperti sebelumnya.
4. Uji dengan satu akun percobaan yang sudah didaftarkan Admin, lalu periksa hasil verifikasi dan login normal.

Tidak perlu menambah file GS/HTML, spreadsheet, kolom, scope atau konfigurasi Google. Jika paket sebelumnya belum lengkap, ikuti prasyarat pada [panduan halaman awal](HALAMAN_LOGIN_AWAL.md), tetapi ambil `Akses.gs` dari **branch verifikasi ini**, agar tidak kembali ke versi lama. Folder docs/tests/previews bukan file editor Apps Script.

## Maintenance dan batas pengujian

- `mulaiVerifikasiAkunPanitia()` menyiapkan alur OAuth dengan tujuan tetap `verifikasi_akun`. Tujuan, state, rahasia browser, nonce, PKCE, masa lima menit dan sidik konfigurasi diperiksa server melalui pertukaran Google yang sudah ada. Tujuan tidak diambil dari parameter URL pengguna.
- Callback tujuan ini memakai `keluaranAplikasiPanitia_` dan `#panitiaAuth` yang sama dengan login. Ia mengembalikan hasil verifikasi terbatas; tidak mengirim token aplikasi/identitas/penugasan ke panel dan tidak memanggil pembacaan data operasional. Pendaftaran/aktivasi akun tetap dilakukan Admin.
- Verifikasi menggunakan pencocokan dan pencatatan `GOOGLE_BIND` yang sudah ada. Ia tidak menerbitkan, memperpanjang atau mencabut sesi aplikasi. Login tetap memeriksa status akun dan penugasan terkini sebelum memberi akses.
- Diagnostik pemilik `?page=uji-login`, login aplikasi, QR publik dan daftar izin gateway operasional tetap terpisah. Verifikasi akun tidak sama dengan Verifikasi Sesi Kehadiran pada Monitoring.
- Link Google disiapkan sebelum diklik sehingga perpindahan `_top` tetap berasal dari klik pengguna. Kegagalan menyiapkan verifikasi menampilkan petunjuk mencoba kembali tanpa menghalangi login utama.

**443 pengujian backend lulus**, bersama pengujian Chromium dan pemeriksaan 19 hash sumber/37 script/ID HTML sumber. Pengujian lokal mencakup akun Admin/Petugas/Pengajar, penautan tanpa sesi, akun tidak aktif/tidak terdaftar/subjek berbeda, nonce salah, rahasia browser salah, tujuan berbeda, masa habis, aplikasi dinonaktifkan, callback dalam tampilan yang sama, kegagalan persiapan dan login sesudah verifikasi. Layanan Google disimulasikan; OAuth Google asli dan deployment tetap perlu diuji setelah pemasangan. Agent tidak mengubah spreadsheet/deployment Google atau branch main.

[Pratinjau implementasi](../previews/verifikasi-akun-login/README.md).
