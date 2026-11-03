# Nilai akhir evaluasi peserta — 3 November 2026

Branch `feat/nilai-akhir-peserta`, melanjutkan paket tombol Evaluasi `2c828ff`. Pengguna menerima hasil uji alur sebelumnya sebagai cukup bagus, lalu menyetujui penyusunan nilai akhir: Pengajar lebih besar bobotnya karena mengamati aktivitas peserta, dan sesi tidak dihadiri dikeluarkan dari rata-rata. Paket ini belum diuji di deployment Google oleh pengguna.

## Pemasangan

Setelah paket sebelumnya terpasang, tambahkan satu **Script** bernama **NilaiAkhir** (`NilaiAkhir.gs`). Ganti seluruh isi tujuh file berikut dari branch yang sama, bukan sebagian fungsi:

- `Code.gs`
- `Akses.gs`
- `Evaluasi.gs`
- `Index.html`
- `Profil.html`
- `Laporan.gs`
- `LaporanTampilan.gs`

Simpan semua sebelum memperbarui versi deployment `/exec` yang sudah ada. Pertahankan URL deployment dan konfigurasi spreadsheet/login/Drive API. Jangan memasang berkas tests/docs/previews sebagai kode Apps Script. Paket aplikasi lengkap kini memiliki 19 sumber HTML/GS pada `SOURCE_SNAPSHOT.json`.

Tidak ada migrasi atau pemindahan data operasional, kolom baru pada spreadsheet utama, atau spreadsheet baru. File evaluasi yang sudah terhubung tetap digunakan. Setelah pemasangan, Admin membuka **Monitoring → Evaluasi → Evaluasi Peserta (Panitia) → Perbarui Rekap Spreadsheet** melalui alur rekap yang sudah tersedia untuk membuat tab turunan **Rekap_Nilai_Akhir**. Jika ada tab pribadi bernama sama, ubah nama tab pribadi terlebih dahulu; aplikasi menolak menimpanya. Jangan menghapus atau menyalin ulang properti kepemilikan tab aplikasi.

## Perhitungan yang disepakati

1. Skor tiap aspek tetap bilangan bulat 1–5. Enam aspek Pengajar dan tiga aspek Panitia tetap memakai jurnal/rubrik masing-masing.
2. Dalam satu sesi, seluruh aspek satu rubrik berbobot sama.
3. Antar sesi, bobot sama, termasuk sesi yang tidak memberikan JP. Durasi/JP tidak menambah bobot evaluasi.
4. Rata-rata komponen = rata-rata nilai sesi yang memenuhi syarat. Skala 100 = rata-rata komponen ÷ 5 × 100.
5. Nilai akhir = **60% × nilai Pengajar + 40% × nilai Panitia** secara bawaan. Perhitungan memakai angka sebelum pembulatan; hasil akhir dibulatkan dua desimal.

Contoh: sesi Pengajar mendapat 5 dan 3, rata-ratanya 4 → 80. Panitia mendapat 4 dan 5, rata-ratanya 4,5 → 90. Nilai akhir = 0,6 × 80 + 0,4 × 90 = **84**. Jika sesi kedua tercatat Izin satu sesi penuh, hanya sesi pertama digunakan: 100 × 60% + 80 × 40% = **92**.

Catatan Sikap & Perilaku, poin/nilai perilaku, pemenuhan JP dan evaluasi Admin terhadap Pengajar tetap berdiri sendiri. Konfigurasi `bobot_perilaku` lama tidak masuk rumus ini. Tidak ada ambang lulus, pemeringkatan atau keputusan kelulusan otomatis; ketua tim kerja tetap mengambil keputusan.

## Status dan dasar penilaian

- **Data lengkap** (`lengkap`): program selesai, setiap sesi wajib pada Jenjang peserta sudah berakhir dengan jadwal valid, presensi jelas/terverifikasi, dan kedua evaluasi terkini lengkap untuk semua sesi yang dinilai.
- **Sementara** (`sementara`): sesi mendatang/jadwal bermasalah, presensi belum lengkap/jelas/terverifikasi, evaluasi belum diisi/sumber berubah, atau program belum selesai. Angka sementara hanya tampil bila masing-masing komponen sudah mempunyai setidaknya satu penilaian yang sah; jumlah sesi dan alasan ditampilkan.
- **Tidak Dinilai** (`tidak_dinilai`): seluruh sesi tercatat tidak dihadiri dan terverifikasi; tidak ada dasar rata-rata. Nilai tetap kosong.
- **Peserta nonaktif** (`peserta_nonaktif`): keikutsertaan bukan terdaftar; nilai gabungan kosong, riwayat penilaian tetap tersimpan.

Presensi manual **Sakit/Izin satu sesi penuh/Tanpa Keterangan** dikeluarkan dari kedua rata-rata, sekalipun pernah diisi evaluasinya. Ketidakhadiran belum terverifikasi tetap perlu pemeriksaan dan tidak menghasilkan status lengkap. Presensi kosong atau QR hanya datang/pulang tidak dianggap alpa dan tidak diberi nilai nol. Hadir/Terlambat manual dan QR lengkap tetap menjadi sesi wajib; izin sebagian sesi yang tetap dihadiri tidak otomatis dikeluarkan.

Hanya evaluasi dengan versi sumber sesuai dan Pengajar sesi yang sedang ditugaskan yang dipakai. Perubahan identitas/roster/jadwal atau pergantian Pengajar dapat membuat evaluasi lama perlu diperiksa/disimpan kembali; nilainya tidak dihapus. Nilai kedua komponen yang belum sama jumlah sesinya dapat menghasilkan angka sementara; rincian memperlihatkan penyebut masing-masing. Jika satu komponen belum memiliki nilai, hasil gabungan tetap kosong.

## Lokasi pengaturan dan hasil

**Admin → Monitoring → Rekap Program → Bobot Nilai Akhir** mengatur dua persentase per program. Kedua bilangan bulat 1–99 harus berjumlah 100; perubahan wajib disertai alasan. Petugas/Pengajar ditolak di server. Versi bobot, pelaku terverifikasi, waktu, nilai sebelum/sesudah dan alasan tersimpan pada **Riwayat_Validasi**, tindakan **bobot_nilai_akhir**. Nilai bawaan tidak menulis riwayat sampai ada perubahan. Simpan ulang dengan ID permintaan sama mengembalikan tanda terima tanpa menggandakan perubahan; versi lama ditolak. Jangan mengubah jurnal ini secara manual sebagai cara mengatur bobot.

Untuk maintenance di VS Code atau Apps Script:

- `NilaiAkhir.gs`: rumus `bangunNilaiAkhir_`, bobot bawaan/versi `bobotNilaiAkhir_`, RPC pengaturan, pembacaan sumber, penyusunan tab turunan. Mengubah jenis komponen/skala/aturan kelayakan memerlukan perubahan kode serta pengujian, bukan memasukkan ekspresi ke spreadsheet.
- `Code.gs`: menyertakan hasil ke Rekap Program dan profil.
- `Index.html`: tombol bobot, hasil/rincian sesi dan ekspor CSV; `Profil.html`: ringkasan individu.
- `Evaluasi.gs`: publikasi snapshot dan kepemilikan tab `Rekap_Nilai_Akhir`.
- `Laporan.gs` dan `LaporanTampilan.gs`: snapshot laporan dan bagian **6.4 Nilai Akhir Evaluasi Peserta**.

Admin dan Petugas sesuai Jenjang dapat membaca agregat/rincian nilai akhir. Pengajar tetap membaca penilaian pesertanya sendiri; endpoint rekap/profil tidak membocorkan komponen Panitia/nilai gabungan kepada Pengajar. Kewenangan lama terhadap nilai Pengajar oleh Admin tetap sama.

CSV mempertahankan **23 header** yang sudah ada. Dua kolom lama `nilai_keseluruhan` dan `status_nilai_keseluruhan` kini berisi nilai akhir evaluasi peserta/statusnya. Nilai yang tidak tersedia tetap kosong, bukan 0. Statistik kehadiran/izin/catatan dan JP tetap menggunakan definisi sebelumnya. Jika pembacaan sumber nilai akhir gagal, tampilan rekap menampilkan kesalahan dan unduh CSV diblokir hingga muat ulang berhasil.

Spreadsheet evaluasi adalah **snapshot manual**, bukan jurnal baru. Perbarui setelah bobot, presensi atau nilai berubah; waktu/versi/keadaan sumber tetap diperiksa sebelum dan sesudah publikasi. Pergantian fase waktu sesi juga menandai snapshot usang. Perhitungan JP pada kolom turunan Kehadiran saja tidak mengubah dasar nilai akhir. Pengaturan bobot menghitung ulang hasil baca berikutnya tanpa menimpa skor sumber; PDF/CSV lama tetap berkas snapshot lama dan harus dibuat ulang.

## Pengujian dan batas

425 pengujian backend mencakup perhitungan, bobot/aspek/sesi, ketidakhadiran, presensi belum jelas, nilai kosong/usang, pergantian Pengajar, akses Jenjang/peran, pengaturan serentak/retry/akun dicabut saat menunggu lock, pembulatan, waktu sesi, profil/CSV/PDF/spreadsheet konsisten dan regresi fitur sebelumnya. Chromium menggunakan HTML aplikasi yang benar-benar diinjeksi server dengan data sintetis dan transport Google tiruan: desktop/ponsel, modal bobot/rincian, CSV aktual, retry dengan payload sama, kegagalan sumber, profil dan privasi Pengajar. Regresi login/navigasi/evaluasi/presensi juga diperiksa.

Pratinjau DOCX/PDF lokal memakai LibreOffice dan data sintetis 2/13 peserta, termasuk nilai lengkap serta sesi Sakit yang dikeluarkan. Ini tidak membuktikan konversi/layout Google Drive; guard jumlah halaman PDF/daftar isi tetap berlaku. Pembacaan sumber dibatasi 10.000 baris per tabel/kehadiran dan 10.000 pasangan peserta–sesi untuk nilai akhir. Publikasi rekap mempertahankan batas lama, termasuk 5.000 pasangan rekap terpadu dan 350.000 sel. Tidak ada cache lintas permintaan, perubahan login, perluasan kelompok RPC, atau pengukuran kecepatan Google yang diklaim.

Uji di salinan/deployment Google: nilai lengkap 84; satu sesi Sakit/Izin/Tanpa Keterangan menjadi 92 sesuai contoh; satu evaluasi kosong tetap sementara; kedua komponen kosong tidak menjadi 0; bobot 70/30 menjadi 83; ganti program tidak membawa bobot program lain; Petugas/Pengajar tidak bisa mengubah bobot; perbarui tab rekap lalu cocokkan CSV/profil/PDF; cek JP/perilaku/QR tetap mengikuti aturan sebelumnya. Tidak ada data Google, deployment atau branch main yang diubah oleh agent.
