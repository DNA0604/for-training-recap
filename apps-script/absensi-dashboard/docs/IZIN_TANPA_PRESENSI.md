# Catat izin peserta tanpa presensi

Branch `feat/izin-peserta-tanpa-presensi`, melanjutkan perbaikan Nonaktif indikator `69ceb08`. Berlaku untuk pencatatan izin pada web Monitoring, oleh Admin atau Petugas sesuai Jenjang tugasnya. Pengajar tetap tidak dapat mencatat izin.

## Pemasangan

Ganti isi lengkap **Code.gs, Akses.gs dan Index.html bersama-sama** dari branch ini. Code.gs sudah mencakup perbaikan Nonaktif indikator lama; tidak perlu memasang paket itu lagi secara terpisah. Hapus.gs dan semua sumber lain tetap versi terakhir yang sudah dipasang.

Simpan lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Gunakan URL deployment lama. Tidak perlu file Script/HTML baru, spreadsheet baru, kolom baru, setup atau migrasi data. Jangan menambahkan file `tests`/`docs` ke editor Apps Script.

Tiga sumber diperlukan karena perubahan mencakup penyimpanan/target lampiran, pemeriksaan akses server dan pilihan peserta pada formulir.

## Penggunaan

1. Buka **Monitoring**, pilih Program/Jenjang/Sesi, lalu **Catat Izin** pada Ringkasan Sesi.
2. Cari peserta. Semua peserta **terdaftar aktif** pada Jenjang sesi dapat dipilih, termasuk yang belum memiliki baris kehadiran atau belum pernah scan datang/pulang.
3. Isi mulai dan selesai izin. Untuk izin tidak mengikuti satu sesi penuh, tekan **Isi Waktu Izin Satu Sesi Penuh**; waktu terisi dari jadwal sesi. Periksa kembali sebelum menyimpan. Untuk izin sebagian sesi, isi rentang yang sebenarnya.
4. Isi alasan, keterangan bukti/lampiran opsional, lalu simpan. Bukti mengikuti peserta dan sesi, termasuk bila peserta baru presensi setelah bukti diunggah.
5. Periksa tab **Daftar Izin** dan jumlah **Izin tercatat**. Ajukan verifikasi sesi seperti biasa; izin ikut dalam paket yang ditinjau Admin. Sumber catatan juga ikut pembaruan manual rekap spreadsheet penilaian yang sudah tersedia.

## Arti izin, kehadiran dan JP

- Izin tersimpan sebagai Catatan_Perilaku dengan indikator IZIN_SESI, identitas sesi/keikutsertaan, rentang waktu, bukti dan pencatat terverifikasi. Awalnya belum divalidasi, tanpa poin disahkan.
- Jika belum ada baris kehadiran, sistem **tidak membuat baris atau waktu presensi buatan**. Tabel kehadiran tetap Belum absen, sedangkan izin terlihat pada daftar/ringkasannya. Izin bukan bukti hadir dan tidak memberi JP otomatis.
- Jika baris kehadiran sudah ada, catatan ditautkan ke baris tersebut dan hasil JP ditandai perlu dihitung ulang, sesuai alur sebelumnya. Scan/waktu terverifikasi tidak diisi atau diganti oleh izin.
- Bila peserta presensi setelah izin dicatat, perhitungan JP yang ada tetap menemukan rentang izin melalui sesi/keikutsertaan. Rentang izin penuh menghasilkan durasi diakui nol bila datang/pulang lengkap; tanpa datang/pulang tidak ada klaim kehadiran/JP baru. Rumus, jeda/toleransi, validasi dan aturan poin perilaku tidak diubah.
- Rentang harus berada dalam jadwal sesi. Peserta batal/tidak terdaftar aktif atau dari program/Jenjang lain tidak dapat dipilih. Duplikat waktu izin pada peserta/sesi yang sama ditolak, termasuk setelah baris kehadiran kemudian dibuat.

Menu native **Catat Izin Sesi** pada spreadsheet tetap menggunakan baris Kehadiran yang dipilih. Pencatatan tanpa baris kehadiran tersedia melalui web Monitoring.

## Jika hasil belum pasti

Jika koneksi terputus, tutup formulir dan muat ulang daftar izin sebelum mencatat ulang. Catatan waktu yang sama tidak boleh diduplikasi. Penulisan tetap didahului audit PENDING dan diverifikasi sebelum SELESAI; kegagalan parsial meninggalkan PERLU_PEMULIHAN. Jangan menghapus audit atau memaksa status selesai. Pemeriksaan transaksi tertunda mempertahankan target peserta/sesi meskipun baris kehadiran belum ada. Tidak ada tombol pemulihan izin baru dalam paket ini.

## Verifikasi

320 tes backend lokal lulus, termasuk 12 regresi baru untuk izin penuh/sebagian tanpa presensi, kehadiran tanpa scan, klien lama, batas jadwal, isolasi/revokasi akses, lampiran, duplikat, verifikasi sesi, rekap penilaian, JP setelah kehadiran ditambahkan dan kegagalan parsial. Chromium menguji Admin/Petugas pada desktop/ponsel: cari peserta belum presensi, isi jadwal penuh, Batal tanpa penyimpanan, lampiran, simpan dan daftar izin; alur aplikasi/akses/indikator lama juga lulus.

Pengujian menggunakan layanan Google tiruan. Agent tidak mengubah data atau deployment Google. Pada deployment uji, gunakan peserta dummy terdaftar yang belum presensi; pastikan izin terlihat, status kehadiran tetap belum absen, lalu uji peserta yang sudah presensi dan pembatasan Jenjang. Izin/scoring/deployment nyata perlu dikonfirmasi pengguna.
