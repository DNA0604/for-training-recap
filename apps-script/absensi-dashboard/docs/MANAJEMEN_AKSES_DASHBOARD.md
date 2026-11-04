# Manajemen Akses dalam dashboard

Branch **ui/manajemen-akses-dashboard**, 30 Oktober 2026, Asia/Jakarta. Melanjutkan 7b9443c; aplikasi 7683452 sebelumnya sudah diimplementasikan dan dinyatakan normal oleh pengguna.

## Pemasangan

1. Tambahkan file **HTML** baru di Apps Script, beri nama **ManajemenAkses**. Salin seluruh isi ManajemenAkses.html dari branch ini. Jangan membuatnya sebagai Script.
2. Ganti seluruh kode **Akses.gs** dari branch yang sama. Pertahankan semua Script/HTML lain, manifest/scopes, OAuth, konfigurasi dan spreadsheet yang telah terhubung.
3. Simpan lalu Manage deployments → Edit deployment yang sama → New version → Deploy. URL tetap dipakai, termasuk tautan QR.
4. Masuk sebagai Admin lalu tekan **Manajemen Akses** pada bagian bawah sidebar. Tautan langsung ?page=akses yang lama juga tetap berlaku.

Tidak perlu spreadsheet, ID, migrasi atau setup ulang. Bila HTML belum dipasang atau tertempel tidak lengkap, renderer memberikan pesan paket tampilan belum lengkap; pasang kedua file sebelum memperbarui deployment.

## Tampilan dan alur

Halaman web kini memiliki sidebar, logo/nama instansi, tanggal Jakarta, identitas akun dan warna/card yang sama dengan halaman lain. Manajemen Akses ditandai sebagai halaman aktif pada sidebar. Animasi ringkas/hover/keyboard dan drawer ponsel mengikuti shell Beranda yang telah diterima. Logo disalin identik; tidak ada pemuatan font/gambar eksternal baru.

Formulir tambah/edit akun, pilihan Admin/Petugas/Pengajar, penugasan Petugas, daftar akun/pencarian/paginasi, tautan masuk dan riwayat tetap dipakai. Formulir dan handler berasal dari panel direktori yang sama, bukan duplikat logika akun pada HTML baru. Halaman ini tidak menjalankan loader data Beranda.

Saat direktori sibuk, kontrol direktori dikunci; tombol buka/tutup sidebar tetap bisa digunakan. Perpindahan halaman ditahan selama permintaan direktori belum terkonfirmasi. Navigasi memakai deployment /exec atau /dev yang sedang dibuka, mempertahankan pilihan Program/Jenjang/sesi, dan tidak menuju # ketika alamat belum tersedia. Log Out terdapat pada sidebar; tidak ada tombol Log Out kedua di heading konten.

Di ponsel, drawer mengelola fokus dan menahan interaksi dengan konten di belakangnya. Halaman autentikasi tetap bisa digunakan setelah Log Out/akses berakhir, termasuk ketika drawer sedang terbuka. Ini perbaikan interaksi tampilan, bukan perubahan masa login atau pemeriksaan hak.

## Panel pemilik dan kewenangan

Menu **Manajemen Pelatihan → Manajemen Akses Panitia** pada spreadsheet utama tetap membuka panel pemilik yang lama untuk setup, konfigurasi Google, aktivasi atau pemulihan. Panel tersebut tetap dapat dipakai tanpa bergantung pada HTML dashboard baru.

Versi web tetap khusus Admin dan menggunakan gateway/sesi server yang sama. Pengajar/Petugas ditolak sebelum membaca data direktori. Konfigurasi OAuth/aktivasi/setup tetap khusus pemilik native; menyembunyikan bagian tersebut pada halaman web bukan pengganti pemeriksaan server. Tidak ada perubahan akun, aturan role, scope Jenjang, skema, audit/request ID, token, batas absolut empat jam atau idle 30 menit pada pembaruan UI ini.

## Uji setelah deployment

1. Admin membuka Manajemen Akses dari Monitoring. Periksa sidebar/header, identitas dan menu aktif.
2. Uji ringkas, hover buka/tutup dan klik menu saat kursor masih berada pada sidebar; animasi tetap seperti halaman lain.
3. Buka Monitoring lalu kembali ke Manajemen Akses, periksa pilihan Program/Jenjang/sesi dan URL deployment.
4. Tambah/edit akun dummy dan penugasan, cari akun serta ubah statusnya. Periksa hasil setelah Muat Ulang.
5. Buka dari ponsel, uji sidebar, Escape/backdrop, Log Out dan halaman login yang tetap dapat diklik.
6. Buka sebagai Pengajar/Petugas: data Manajemen Akses tetap tidak tersedia. Buka panel pemilik dari menu spreadsheet dan periksa fungsi sebelumnya tetap ada.

Validasi lokal: **283 backend tests** tetap lulus; **66 source/generated scripts** dan ID HTML diperiksa. Chromium dengan HTML aktual/layanan Google tiruan mencakup CRUD akun/penugasan pada web, busy guard dan pemulihan pemuatan, navigasi pulang-pergi /exec serta /dev dengan konteks, sidebar desktop hover/keyboard/gerakan konten, ponsel/focus trap/inert-safe logout dan penolakan Petugas/Pengajar. Panel pemilik/setup/direktori, login, verifikasi sesi, evaluasi peserta/Pengajar dan rekap juga lulus pada suite terkait. Ini bukan bukti deployment Google, kuota atau seluruh interaksi browser pengguna. Tidak ada data/file Google nyata, deployment atau main yang diubah oleh agent.

Pratinjau memakai data sintetis: [desktop](../preview/manajemen-akses-dashboard/Desktop.png), [ponsel](../preview/manajemen-akses-dashboard/Mobile.png), [sidebar ponsel](../preview/manajemen-akses-dashboard/Mobile-Sidebar.png).
