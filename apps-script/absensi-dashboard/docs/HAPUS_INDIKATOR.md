# Hapus indikator yang belum digunakan

Paket `feat/hapus-indikator-belum-digunakan`, 30 Oktober 2026, melanjutkan tampilan Manajemen Akses `8e9a01b` yang sudah diterima pengguna. Fitur ini untuk Admin Pelatihan/pemilik; Pengajar dan Petugas tidak mendapat kewenangan hapus.

## Pemasangan

Ganti isi lengkap **Hapus.gs dan Index.html** dari branch yang sama. Simpan, lalu **Manage deployments → Edit deployment yang digunakan → New version → Deploy**. Tetap gunakan URL deployment lama. Tidak perlu Script/HTML baru, spreadsheet baru, setup ulang atau migrasi. File lain tetap versi yang sudah terpasang. `tests`, `docs` dan snapshot bukan file editor Apps Script.

## Penggunaan

1. Buka **Monitoring**, pilih program, lalu **Nilai Sikap & Perilaku**.
2. Tekan **Tambah Indikator Baru** di kanan atas. Pilih indikator lama pada **Tambah atau kelola indikator tersimpan**, atau gunakan **Edit / Ubah Status** pada baris katalog.
3. Bagian penghapusan memeriksa penggunaan indikator. Katalog ini dipakai bersama seluruh program, bukan milik program yang sedang dipilih saja.
4. Bila diizinkan, isi alasan, centang persetujuan, lalu tekan **Hapus Indikator**. Konfirmasi kedua menampilkan kode/ID dan alasan; pilih **Ya, Hapus Indikator** untuk menjalankan. Tidak perlu mengetik ID. Batal/Escape tidak menghapus dan mempertahankan isian.
5. Setelah selesai, katalog/aturan/nilai dimuat ulang. Isian pengaturan yang belum disimpan akan diabaikan sebagaimana diberitahukan pada konfirmasi.

## Indikator yang dilindungi

Penghapusan fisik hanya untuk indikator tambahan yang belum dirujuk. Seluruh delapan kode bawaan aturan dasar dilindungi; **IZIN_SESI wajib tetap ada dan aktif**. Indikator lain yang masih digunakan dapat dinonaktifkan melalui formulir Edit yang sama.

Pemeriksaan mencakup semua tab database utama serta file akses/penilaian yang sudah dikonfigurasi: catatan semua status, seluruh versi aturan, referensi ID/kode pada kolom dan JSON terstruktur, versi indikator lain, riwayat, dan cadangan penghapusan lama yang dapat diverifikasi. Audit pembuatan/edit/penghapusan indikator itu sendiri dipertahankan tanpa dianggap sebagai pemakaian oleh data lain. Pemeriksaan diulang di server setelah memperoleh kunci tulis; perubahan penggunaan sejak pratinjau menghentikan penghapusan.

Catatan, aturan penilaian, nilai peserta, evaluasi dan JP tidak ikut dihapus atau dihitung ulang oleh transaksi ini. Salinan baris lengkap, termasuk rumus, disimpan pada Riwayat_Validasi sebelum penghapusan. Batas ID `IND` dicatat agar nomor ID tidak digunakan kembali. Audit dan ScriptProperties yang sudah ada harus dipertahankan. Pemulihan otomatis indikator yang sudah selesai dihapus belum tersedia.

## Koneksi terputus atau transaksi tertunda

- Jika hasil belum pasti, gunakan **Periksa Hasil Penghapusan**. Isian dikunci agar percobaan ulang menggunakan isi/ID permintaan yang sama.
- Bila transaksi tertunda ditemukan, periksa alasannya, centang ulang persetujuan, lalu **Lanjutkan Penghapusan** dan konfirmasi kembali.
- Jika transaksi sudah selesai tetapi pemuatan katalog gagal, periksa hasil kembali sampai katalog berhasil dimuat. Gagal memuat bukan bukti bahwa indikator sudah hilang.
- Setelah memuat ulang/menutup halaman, pemulihan juga tersedia melalui card **Transaksi yang Perlu Diperiksa** di Pengelolaan atau Peserta. Persiapan cadangan yang belum lengkap dapat dibatalkan oleh alur pemulihan sebelum penghapusan; periksa pesan hasil.
- JSON terstruktur/cadangan rusak, sumber tidak dapat dibaca, atau batas pemeriksaan terlampaui membuat penghapusan dihentikan. Batas lokal: 30.000 baris gabungan, 8 juta karakter JSON, kedalaman 30 dan 1 juta langkah pemeriksaan. Jangan memaksa status transaksi menjadi SELESAI atau menghapus audit. Periksa sumber pada salinan data terlebih dahulu.

Kunci aplikasi tidak mengoordinasikan edit manual langsung di Google Sheets. Hindari edit langsung selama transaksi berjalan.

## Pengujian

300 tes backend lokal lulus, termasuk 17 kasus baru: referensi lintas program/riwayat/file, aturan bawaan, perubahan setelah pratinjau, peran/revokasi, audit-cadangan, pemulihan, permintaan berulang dan reservasi ID. Chromium dengan layanan Google tiruan menguji desktop/ponsel, konfirmasi/Batal/Escape, respons hilang, pemulihan parsial, perubahan referensi dan kegagalan memuat ulang katalog. Regresi penghapusan Program/Sesi/Peserta serta evaluasi Pengajar/Peserta juga diperiksa.

Agent tidak mengubah data/deployment Google. Pada deployment uji/salinan, buat indikator tambahan dummy yang belum dipakai; uji pembatalan dan penghapusan, lalu pastikan indikator terpakai/bawaan tetap dilindungi dan fungsi Edit/Nonaktif tetap berjalan. Pemeriksaan format/izin/kuota dan hasil deployment nyata memerlukan uji pengguna.

## Perbaikan penyimpanan status indikator lama

Pengguna mengonfirmasi indikator baru dapat dihapus, lalu melaporkan error konfigurasi Aturan_Penilaian saat menonaktifkan MAKAN_SAAT_SESI. Branch **fix/nonaktif-indikator-aturan-lama** memperbaiki pemeriksaan edit yang sebelumnya membaca seluruh JSON aturan meskipun hanya status yang berubah. Setelah paket dua file di atas, ganti lengkap **Code.gs saja**, simpan dan update deployment yang sama ke New version. Tidak perlu memperbaiki/menghapus aturan spreadsheet untuk menjalankan perubahan status ini.

Coba kembali Nonaktif dengan definisi/jenis tetap dan alasan terisi. Status/default poin tidak menulis ulang aturan atau nilai lama. IZIN_SESI tetap aktif, perubahan makna tetap diperiksa dan penghapusan masih membutuhkan bukti referensi yang terbaca. Perbaikan ini tidak menganggap JSON aturan yang tidak terbaca sebagai aturan kosong dan tidak memperbaiki data lama secara otomatis. 308 tes backend lokal lulus; penyebab baris Google yang persis belum diketahui dan hasil deployment masih menunggu uji pengguna.
