# Evaluasi peserta oleh Panitia per sesi

Paket `feat/evaluasi-peserta-panitia`, melanjutkan sumber izin tanpa presensi `e4a20e5` yang sudah diterima pengguna. Instansi membutuhkan evaluasi umum peserta tanpa mewajibkan catatan kejadian terperinci. Aspek dari pengguna: **kedisiplinan peserta, kerja sama, prakarsa**. Pengisian dilakukan setelah setiap sesi selesai; hasil semua sesi digunakan ketika program berakhir.

**Penerimaan pengguna:** paket e7cfaa7 dilaporkan sudah aman. Ini mencatat hasil uji yang dilaporkan pengguna tanpa mengklaim pengujian independen seluruh kasus Google. Tidak perlu kode/deployment tambahan untuk pencatatan penerimaan.

## Pemasangan

Ganti isi lengkap **Evaluasi.gs dan Akses.gs bersama-sama** dari branch ini. Simpan, lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Gunakan URL deployment lama.

Tidak perlu Script/HTML baru, spreadsheet baru, ID baru atau setup ulang. Semua file lain tetap versi terakhir yang sudah dipasang. Antarmuka evaluasi dimuat dari Evaluasi.gs melalui halaman Monitoring yang sudah ada. Tab jurnal `Evaluasi_Peserta_Panitia` dibuat pada penyimpanan valid pertama di spreadsheet penilaian yang sudah terhubung. Tab rekap dibuat saat Admin memperbarui rekap.

## Pengisian

1. Admin atau Petugas membuka **Monitoring**, memilih Program/Jenjang/Sesi.
2. Tekan **Evaluasi Peserta oleh Panitia** di Ringkasan Sesi. Pengajar tetap menggunakan evaluasi enam aspek yang sudah ada.
3. Isi tiga aspek dengan angka bulat **1–5**: Sangat Kurang, Kurang, Cukup, Baik, Sangat Baik. Pedoman aspek dapat dibuka di atas tabel. Komentar opsional, maksimal 300 karakter per peserta.
4. Tekan **Simpan Halaman**. Tabel menampilkan 20 peserta per halaman; isian yang diubah disimpan dalam paket maksimal 10 peserta. Peserta yang belum diisi tetap Belum dinilai, bukan nol.
5. Lanjutkan halaman berikutnya setelah menyimpan. Muat Ulang, pindah halaman dan X/Escape meminta konfirmasi jika ada isian belum tersimpan/hasil belum pasti.

Tidak perlu menunggu program berstatus selesai. **Server mengizinkan penulisan setelah jadwal sesi berakhir**, berdasarkan tanggal/jam sesi dan zona waktu spreadsheet. Sebelum itu hasil dapat dilihat, tetapi isian dan Simpan dinonaktifkan. Muat ulang setelah waktu berakhir. Izin, presensi atau Catatan Sikap & Perilaku bukan syarat pengisian; penilai mengisi berdasarkan pengamatan yang tersedia. Tidak ada nilai otomatis dari kehadiran/catatan.

## Aspek dan penilai

| Aspek | Pedoman |
| --- | --- |
| Kedisiplinan peserta | Ketepatan waktu, kepatuhan tata tertib dan konsistensi mengikuti kegiatan. |
| Kerja sama | Kolaborasi, saling membantu, menghargai pendapat dan tanggung jawab kelompok. |
| Prakarsa | Inisiatif menyampaikan gagasan atau mengambil langkah bermanfaat tanpa selalu menunggu arahan; keaktifan dapat menjadi buktinya. |

Satu peserta memiliki **satu evaluasi Panitia bersama per sesi**, dapat diperbarui Admin atau Petugas yang masih berwenang. Admin melihat seluruh sesi; Petugas hanya Jenjang tugasnya. Pengajar tidak membaca/menulis evaluasi Panitia dan tidak memperoleh akses jurnal/rekap Panitia melalui aplikasi.

Identitas penilai berasal dari sesi login terverifikasi. Perubahan menyimpan nilai sebelum/sesudah, peran, nama/email penilai dan waktu. Versi mencegah Admin/Petugas menimpa perubahan satu sama lain tanpa memuat ulang. Perubahan identitas/nama/jadwal/daftar peserta sesi meminta pemeriksaan ulang sebelum menilai. Penandaan program selesai dan perubahan hasil JP tidak membuat penilaian Panitia menjadi usang. Riwayat sebelumnya tersedia di modal, maksimal 50 rekaman terbaru.

Evaluasi ini terpisah dari enam aspek Pengajar terhadap peserta, lima aspek Admin terhadap Pengajar, dan Catatan Sikap & Perilaku. Tidak ada penggabungan nilai, bobot, perubahan JP atau perubahan sumber catatan.

## Rekap saat program berakhir

Admin menekan **Perbarui Rekap Spreadsheet** pada modal ini atau jalur pembaruan rekap yang sudah ada. Tombol ini tetap khusus Admin/pemilik. Seluruh program diperbarui secara manual; hasil tidak berubah otomatis setiap nilai disimpan.

Buka tab **Rekap_Evaluasi_Panitia** pada spreadsheet penilaian yang sama. Filter **ID Program/Program** dan **Jenjang** untuk meninjau seluruh sesi program. Tab memuat identitas peserta, sesi, tiga nilai, komentar, penilai/waktu, status sumber dan versi. Nilai kosong tetap belum dinilai. Ini rekap per sesi; belum ada rata-rata/bobot/nilai akhir program.

Jika sumber sesi/pendaftaran dihapus atau dinonaktifkan, hasil yang sudah tersimpan tetap menjadi riwayat di file penilaian, dengan status sumber yang sesuai. Tab rekap merupakan hasil turunan; jurnal tetap sumber asli. Jangan mengedit tab rekap sebagai tempat input. Pemeriksaan kepemilikan tab, rumus/teks literal, status snapshot, perubahan sumber dan kegagalan pembaruan mengikuti alur rekap yang sudah ada.

## Hasil belum pasti

Jika respons penyimpanan terputus, isian dikunci dan **Simpan Halaman mengulang permintaan yang sama**, termasuk paket yang belum terkonfirmasi. **Muat Ulang** memeriksa hasil terbaru setelah konfirmasi meninggalkan isian. Jangan menggandakan permintaan dengan isi berbeda. Riwayat jurnal memungkinkan hasil yang sudah tersimpan dikonfirmasi tanpa menambah nilai kedua kali. Transaksi operasional/verifikasi tertunda tetap harus diselesaikan melalui alurnya terlebih dahulu.

## Verifikasi

337 tes backend lokal lulus, termasuk 17 kasus baru: peran/scope/revokasi, sesi belum selesai, program masih aktif, nilai lengkap, peserta tidak aktif/duplikat, perubahan sumber, penilai bersamaan, permintaan berulang/respons hilang, jurnal lama/asing, riwayat dan rekap setelah sumber dihapus. Sumber operasional/JP/nilai Pengajar diuji tetap tidak berubah.

Chromium dengan layanan Google tiruan menguji Admin/Petugas desktop/ponsel: tiga aspek, validasi isian, X/draf, tabel scroll/header terkunci, waktu sesi, riwayat dengan teks aman, percobaan ulang satu/paket kedua, pagination dan rekap. Regresi evaluasi Pengajar/Peserta, izin tanpa presensi, login/navigasi/sidebar, akses dan indikator juga lulus. Source/generated scripts, ID HTML dan hash sumber diperiksa.

Agent tidak mengubah data atau deployment Google. Uji pada deployment pengguna: sesi selesai dalam program aktif; isi melalui Petugas, lihat/perbarui melalui Admin; pastikan Jenjang lain ditolak, Pengajar tidak mendapat tombol, nilai tersimpan/terekap dan sesi mendatang belum dapat diisi. Hasil deployment nyata masih menunggu konfirmasi pengguna.
