# Evaluasi Pengajar terhadap Peserta — tahap 1

Pembaruan rekap terbaru: [rekap pada spreadsheet terhubung](REKAP_PENILAIAN_SPREADSHEET.md), branch **feat/rekap-penilaian-spreadsheet**; cukup ganti Evaluasi.gs, Akses.gs dan Code.gs jika UI sebelumnya sudah terpasang.

Acuan pemasangan/UI sebelumnya: branch **ui/rapikan-evaluasi-pengajar**, 29 Oktober 2026, Asia/Jakarta. Melanjutkan paket Pengajar e063681 pada repository DNA0604/for-training-recap.

## Pembaruan UI setelah paket Pengajar terpasang

Ganti seluruh isi **Evaluasi.gs, Code.gs, Index.html dan Pengelolaan.html** dari branch terbaru secara bersamaan. Simpan, lalu Manage deployments → Edit deployment yang sama → New version → Deploy. Pertahankan file Akses.gs/Jenjang.gs, konfigurasi dan spreadsheet penilaian sebelumnya. Tidak perlu file baru, setup ulang atau migrasi.

- Tombol **Isi Evaluasi Peserta** (Pengajar) / **Lihat Evaluasi Peserta** (Admin) berada di **Ringkasan Sesi**, tepat setelah Catat Sikap & Perilaku; card evaluasi di bawah halaman dihapus.
- Tabel evaluasi mempunyai scroll sendiri dan header terkunci. Nama peserta tetap terlihat saat tabel digeser mendatar. Tombol X di kanan atas dan tombol simpan/paginasi tetap terlihat di luar scroll tabel; isian belum tersimpan tetap meminta konfirmasi saat ditutup.
- **Nama Pengajar** tampil di Ringkasan Sesi untuk Admin, Pengajar dan Petugas. Jika belum ditugaskan, tampil Belum ditetapkan. Petugas tidak mendapatkan akses membaca/menulis evaluasi.
- Di Pengelolaan, **Pengajar Sesi** menjadi tombol di samping Tambah Sesi dan Jeda yang membuka modal. Pilihan sesi mengikuti program aktif dan dimuat ulang saat modal dibuka. Isian Alasan dihapus; riwayat penugasan tetap menyimpan pelaku/waktu/nilai sebelum–sesudah dengan catatan otomatis.
- Ikon tempat sampah Program/Sesi berada di **Edit** masing-masing, bukan pada tabel utama. Klik ikon membuka pratinjau penghapusan dan konfirmasi yang sama. Draft edit perlu dikonfirmasi sebelum ditinggalkan dan tidak disimpan otomatis. Alasan **penghapusan** tetap diperlukan.

Uji setelah deployment: buka Monitoring melalui ketiga peran dan periksa nama Pengajar; cek posisi tombol Admin/Pengajar dan ketiadaan tombol pada Petugas; gulir banyak peserta dalam modal sambil memeriksa header/X/simpan; coba X dengan draft; buka/tutup Pengajar Sesi dan simpan tanpa alasan; buka Edit Program/Sesi lalu batalkan konfirmasi hapus. Jika menguji penghapusan sampai selesai, gunakan data dummy pada salinan.

249 tes backend dan uji Chromium Google tiruan lulus, termasuk pembatasan sesi, nama semua peran, audit tanpa alasan/idempotensi, geometri scroll/header, draft dan retry, Admin readonly, modal penugasan, alur hapus dari Edit, navigasi/sidebar/verifikasi serta Jenjang. Pengujian ini tidak menggantikan deployment Google nyata.

Pratinjau baru memakai data sintetis: [tabel bergulir](../preview/evaluasi-ui/Tabel-Scroll-Desktop.png), [evaluasi ponsel](../preview/evaluasi-ui/Evaluasi-Mobile.png), [Pengajar Sesi desktop](../preview/evaluasi-ui/Pengajar-Sesi-Desktop.png), [Pengajar Sesi ponsel](../preview/evaluasi-ui/Pengajar-Sesi-Mobile.png).

Bagian berikut tetap menjadi acuan untuk pemasangan pertama dan mekanisme penilaiannya.

## Ruang lingkup yang disepakati

- Satu pengajar per sesi. Pengajar dapat ditugaskan pada beberapa sesi dan Jenjang.
- Pengajar menilai peserta **setiap sesi**, pada enam aspek: Keaktifan, Kedisiplinan, Kerapian, Kesopanan, Kreativitas, Kerja sama.
- Skala bilangan bulat: 1 Sangat kurang, 2 Kurang, 3 Cukup, 4 Baik, 5 Sangat baik. Tidak ada bobot, rata-rata, nilai akhir program atau rumus gabungan yang ditetapkan.
- Pengajar hanya mengakses sesi tugasnya dan peserta Jenjang sesi tersebut. Sesi lain dalam Jenjang yang sama tetap tidak tersedia. Boleh melihat data/rekap terfilter serta mengisi evaluasi sendiri. Tidak dapat mengelola akun/master, menghapus, menerbitkan QR, mengoreksi absensi, memvalidasi pengajuan, menghitung JP atau menilai Pengajar.
- Admin mengelola akun/penugasan dan melihat evaluasi. Pengisian evaluasi enam aspek dilakukan Pengajar yang ditugaskan. Petugas kelas tetap pada tugas semula dan tidak membuka modul evaluasi ini.
- Penilaian Pengajar oleh Admin merupakan fitur berbeda dan belum diimplementasikan pada tahap ini. Poin perilaku/JP/CSV lama tetap digunakan seperti sebelumnya; pemindahan atau penggabungannya belum dilakukan.

## Pemasangan pada salinan

1. Tambahkan **Script Evaluasi.gs** (jenis Script, bukan HTML). Backend, UI formulir dan panel setup berada dalam file ini sehingga tidak perlu HTML bernama sama.
2. Ganti lengkap **Akses.gs, Code.gs, Jenjang.gs, Pengelolaan.html dan Index.html secara bersamaan**. Pertahankan semua file aplikasi lain, manifest/scopes, OAuth, aktivasi dan URL deployment. Versi Index.html saat ini tetap memuat perbaikan tombol indikator dari tahap sebelumnya.
3. Simpan, muat ulang spreadsheet utama. Buka menu **Manajemen Pelatihan → Penyiapan Evaluasi Peserta**, bukan menjalankan opener dari editor Apps Script.
4. Hubungkan file penilaian khusus milik pemilik database melalui ID/link, atau kosongkan isian untuk membuat file baru. Centang konfirmasi dan tekan Siapkan File Penilaian. Ikuti otorisasi Google bila diminta. File ini harus berbeda dari database utama dan file akses; data lain tidak ditimpa dan file yang sudah terhubung tidak dapat diganti sembarangan.
5. Setup membuat tab Pengajar_Sesi dan Evaluasi_Peserta pada file penilaian, tanpa kolom/tab baru pada file utama/akses. Jika setup tertunda, buka menu yang sama dan selesaikan pada file yang sudah tercatat.
6. Manage deployments → Edit deployment yang sama → New version → Deploy. Jangan mengganti URL callback/QR yang sudah bekerja.

Tidak ada setup, file Google, deployment atau nilai pengguna yang diubah oleh agent dari workspace ini.

## Pendataan dan penugasan

Pada Manajemen Akses Panitia, Admin menambahkan akun dengan peran **Pengajar** dan status aktif. Identitas Google tetap memakai login aplikasi yang sudah berjalan; tidak perlu uji identitas terpisah untuk setiap akun.

Penugasan Pengajar dilakukan di **Pengelolaan → Pengajar Sesi**: tekan tombol Pengajar Sesi, pilih sesi, pilih satu akun Pengajar aktif dan simpan. Jenjang diturunkan dari sesi. Penugasan Petugas Kelas tetap melalui formulir Jenjang yang lama. Pergantian/penonaktifan akun atau pengajar langsung berlaku pada permintaan berikutnya; penulisan memeriksa ulang setelah mendapatkan kunci.

Nama pengajar juga dapat dipilih pada formulir Tambah Sesi. Pilihan boleh ditetapkan nanti untuk kompatibilitas program lama. Buat sesi terlebih dahulu memakai transaksi pembuatan yang sudah ada, kemudian penugasan disimpan. Jika penugasan gagal, pesan menjelaskan sesi sudah dibuat tetapi pengajar tertunda; gunakan Pengajar Sesi untuk menyelesaikannya, tanpa membuat sesi duplikat. Buka kembali modal Pengajar Sesi atau tekan Muat Ulang Pengajar setelah membuat sesi/akun baru agar daftar pilihannya diperbarui.

## Mengisi evaluasi

1. Pengajar masuk menggunakan akun terdaftar dan membuka Monitoring.
2. Pilih sesi penugasan, lalu **Isi Evaluasi Peserta** di dalam Ringkasan Sesi.
3. Isi seluruh enam aspek untuk peserta yang dinilai. Catatan opsional maksimal 300 karakter. Nilai kosong tetap **Belum dinilai**, tidak disimpan sebagai nol.
4. **Simpan Halaman** menyimpan perubahan maksimal 20 peserta dengan satu tindakan. Aplikasi mengirim paket sampai 10 peserta agar ukuran jurnal tetap terbatas dan menampilkan kemajuan; paket yang belum terkonfirmasi memakai ID sama saat dicoba ulang. Gunakan halaman berikutnya untuk peserta lain. Jika ada satu baris yang baru diisi sebagian, lengkapi enam aspek sebelum menyimpan.
5. Formulir meminta konfirmasi sebelum menutup/pindah halaman dengan isian belum tersimpan. Jika respons terputus, permintaan yang sama dapat dicoba lagi lewat Simpan Halaman atau hasil diperiksa dengan Muat Ulang. Jangan mengubah payload yang hasilnya belum pasti; isian terkunci ketika permintaan belum terkonfirmasi.
6. Perubahan roster/sesi/penugasan memerlukan muat ulang sumber. Nilai yang sumbernya telah berubah ditandai untuk diperiksa, dan Pengajar dapat menyimpan ulang nilai yang telah diperiksa meskipun angkanya tetap.

Admin membuka sesi dan **Lihat Evaluasi Peserta** untuk membaca skor/catatan/waktu. Nilai dari pengajar sebelumnya atau peserta yang sudah tidak berada dalam roster tetap tersimpan dan dapat muncul dalam riwayat. Menonaktifkan akun atau mengganti pengajar tidak menghapus penilaian lama. Pengajar baru tidak menerima hak membaca penilaian pengajar sebelumnya.

## Penyimpanan dan batas tahap awal

File penilaian menyimpan jurnal append-only. Setiap event mencatat ID, permintaan, signature, sesi, pelaku, waktu, serta JSON nilai sebelum/sesudah. Penilaian satu paket disimpan dalam satu append yang dibaca ulang, kemudian tampilan memperoleh nilai terbaru dari jurnal. Nilai tidak tersebar menjadi penulisan ulang ke file utama. Gunakan aplikasi untuk mengisi/membaca; jangan mengedit jurnal langsung karena pemeriksaan struktur dan versi dapat menahan operasi ketika isi tidak sesuai.

Event pengisian membawa versi sumber, rubrik peserta-sesi-v1 dan versi nilai sebelumnya untuk setiap peserta. Permintaan yang sama bersifat idempotent; isi yang berbeda dengan ID sama ditolak. Nilai di luar 1–5, peserta asing/duplikat, versi lama, penugasan berubah atau akun nonaktif ditolak sebelum append. Nilai kosong dan bobot yang belum disepakati tidak diisi otomatis.

Batas prototipe: 1.000 peserta dalam satu sesi, maksimal 20 peserta per simpan, 300 karakter catatan, 38.000 karakter payload per event, dan 10.000 baris per tabel jurnal. Waktu/kuota Google bisa membatasi ukuran praktis. Data terhapus dari database operasional tidak menghapus jurnal penilaian; arsip mentah beserta snapshot nama/ID tetap berada pada file penilaian. Identitas/penugasan yang sudah kehilangan sumber operasional tidak digunakan untuk memberikan akses baru.

## Uji Google yang perlu dilakukan

1. Admin membuka Manajemen Akses dan menambahkan satu akun Pengajar.
2. Satu program memiliki dua sesi dalam Jenjang yang sama, dengan pengajar berbeda. Masing-masing harus hanya dapat membuka sesi tugasnya, termasuk melalui tautan langsung. Ulangi antar-Jenjang.
3. Isi satu peserta dengan enam nilai, simpan, muat ulang dan bandingkan. Peserta lain yang kosong tetap Belum dinilai. Periksa hasil Admin.
4. Coba hanya mengisi sebagian aspek: simpan harus ditolak tanpa nilai setengah lengkap.
5. Isi beberapa peserta lalu Simpan Halaman. Beralih halaman/menutup dengan draft belum disimpan harus menawarkan konfirmasi.
6. Ganti atau nonaktifkan pengajar: akses lama berhenti, Admin tetap dapat membaca nilai sebelumnya. Pengajar baru memiliki lembar kosong miliknya sendiri.
7. Uji pembuatan sesi dengan kolom Pengajar, dan pengubahan pengajar melalui card Pengajar Sesi. Penulisan penilaian tidak mengubah kehadiran, poin perilaku atau JP lama.
8. Periksa bahwa Admin/Petugas, QR publik, koreksi, verifikasi sesi, navigasi dan sidebar yang sebelumnya sudah diterima tetap berjalan.

## Bukti lokal

246 tes backend (26 baru) lulus dengan Google tiruan: owner setup/isolasi file, teacher scope hingga sesi lain dalam Jenjang sama, gateway denial, grading/read-only roles, enam angka bulat, idempotensi/lost receipt, sumber/versi usang, pergantian/nonaktif akun, riwayat, penugasan saat create sesi dan satu batch 20 peserta. Chromium memakai HTML aktual hasil injeksi server untuk Pengajar desktop/390 px, validasi/input/simpan, Admin readonly, paket kedua terputus dengan retry identik, role/penugasan dan penolakan halaman Admin; suite aplikasi/login/verifikasi/sidebar, akses direktori dan Jenjang tetap lulus. Ini bukan bukti deployment, otorisasi, kuota atau latensi Google nyata.

Pratinjau memakai data sintetis: [desktop](../preview/evaluasi-peserta/Evaluasi-Peserta-Desktop.png) dan [ponsel](../preview/evaluasi-peserta/Evaluasi-Peserta-Mobile.png).
