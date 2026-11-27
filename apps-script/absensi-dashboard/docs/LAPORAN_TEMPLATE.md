# Laporan program sesuai template instansi

Branch **feat/laporan-program-template**, melanjutkan CSV 403ce1c. Pada 1 November pengguna menyerahkan pedoman DOCX dan sampul, meminta audit dahulu, kemudian menyetujui pelurusan dan mengizinkan implementasi.

## Pemasangan

1. Tambahkan file **Script** bernama **LaporanTampilan** dan salin seluruh isi **LaporanTampilan.gs**. File ini sudah memuat tata letak, ukuran, warna, sampul asli serta logo; tidak perlu mengunggah gambar/Word ke Drive. Ukuran kode lebih besar karena aset tertanam. Gunakan GitHub Raw untuk menyalin seluruh file.
2. Ganti seluruh isi **Laporan.gs dan Pengelolaan.html** dari branch yang sama. Pertahankan seluruh sumber lain pada versi terbaru yang dipasang, termasuk Evaluasi.gs dan pembaruan CSV.
3. Simpan proyek. Jika Google meminta otorisasi pemilik ulang, selesaikan sebelum mencoba laporan. Pemilik dapat menjalankan `otorisasiLaporanProgram` melalui editor Apps Script untuk memberi izin; jalur ini tetap dibatasi pemilik asli meskipun login aplikasi aktif. Manifest/scopes proyek yang sudah berjalan dipertahankan; jangan menggantinya dengan manifest referensi repository.
4. Perbarui **deployment yang sama → Edit → New version → Deploy**, pertahankan URL. Buka Pengelolaan, pilih program berstatus **selesai**, lalu **Laporan Program → Buat PDF → Unduh PDF**.

**Konversi dokumen memakai Google Drive API.** Tidak perlu menambahkan Advanced Service ke kode. Jika muncul HTTP 403 yang menyebut API belum aktif, pemilik membuka proyek Google Cloud yang terhubung pada Apps Script → APIs & Services → Library → **Google Drive API → Enable**. Periksa layanan ini pada proyek yang benar, kemudian coba kembali. Jika scope ditulis secara eksplisit dalam manifest sendiri, pertahankan izin Docs/Drive serta external request yang digunakan layanan aplikasi; otorisasi dilakukan oleh pemilik. Tidak ada OAuth Client/account/migrasi spreadsheet baru.

## Format yang disepakati

- Sampul menggunakan gambar asli 1414 × 2000 dari template. Teks program/kategori/periode/status/ID dan tanggal cetak berubah sesuai sumber. Header sampul putih dengan logo dan tanggal cetak; tanpa nomor halaman.
- Daftar isi otomatis setelah sampul, meliputi tujuh bagian dan lampiran yang tersedia. Daftar isi bernomor 1, Ringkasan Eksekutif mulai nomor 2. Nomor sesuai halaman isi, tidak memasukkan sampul.
- Isi A4 potret, Arial 12, rata kanan-kiri, spasi 1,15; margin atas 3,25 cm dan sisi/bawah 2,5 cm. Judul, header/footer dan metadata memiliki ukuran sesuai perannya. Lampiran tabel lebar memakai A4 landscape; rincian aktivitas tetap potret.
- Header isi memuat nama program dan identitas instansi dengan ejaan **Pengembangan**. Footer pita navy memuat ID laporan serta nomor halaman.
- Tabel memakai navy, teks header putih, baris putih/biru pucat, header diulang pada halaman lanjutan. Baris normal tidak dipecah. Baris luar biasa panjang dibagi menjadi baris lanjutan yang ditandai, tanpa menambah jumlah peserta/kejadian pada sumber.
- Maksimal 12 peserta terdaftar: tabel saja. Di atas 12: grafik dapat ditambahkan bila ada sekurangnya dua kategori dan data bermakna. Grafik sesi/indikator maksimal 10 kategori; tabel tetap lengkap. Label sangat panjang memakai tabel agar grafik tidak menyesatkan. Warna/ukuran terpusat; grafik tidak dipaksakan pada data kosong.
- Tiap penerbitan memiliki ID LAP-UUID dan waktu snapshot serta hash sumber. Tidak ada arsip laporan/nomor revisi berurutan yang ditulis ke spreadsheet. Pengguna menyimpan PDF jika perlu mempertahankan versi sebelumnya.

## Susunan dan arti data

1. Ringkasan Eksekutif: identitas, indikator pencatatan/JP/catatan, perhatian dan identitas snapshot.
2. Gambaran Pelaksanaan Program: tabel identitas, ringkasan Jenjang bila lebih dari satu, rincian sesi/Pengajar/jeda/durasi/JP jadwal dan narasi pelaksanaan.
3. Evaluasi Kehadiran: kategori kelengkapan saling terpisah, per sesi, keterlambatan dari waktu efektif yang dapat dinilai, izin menurut status dan rujukan rincian peserta.
4. Evaluasi JP: rekap lengkap/sementara/belum tersedia, ketercapaian menurut acuan setiap peserta/Jenjang, alokasi sesi dan tindak lanjut.
5. Sikap dan Perilaku: semua status aktivitas dipisahkan dari catatan disetujui, indikator, validasi serta hasil aturan perilaku yang sudah ada.
6. Evaluasi Peserta dan Pengajar: Pengajar→peserta (enam aspek), Admin/Petugas→peserta (tiga aspek), Admin→Pengajar (lima aspek). Ketiganya terpisah, skala 1–5 tanpa bobot/nilai akhir gabungan.
7. Kesimpulan dan Rekomendasi: temuan, kesimpulan administratif, keterbatasan dan tindakan yang mengikuti data. Tidak ada pengesahan, keputusan kelulusan, penyuntingan narasi atau AI Agent. Keputusan akhir berada pada ketua tim kerja.

Lampiran A kehadiran; B JP; C nilai perilaku; D semua status aktivitas/validasi; E evaluasi peserta oleh Pengajar; F evaluasi peserta oleh Panitia; G evaluasi Pengajar oleh Admin. E–G ditampilkan jika sumber evaluasi tersedia. Catatan sensitif/bukti Drive tidak disalin sebagai berkas; nama/unit dicantumkan seperlunya, tanpa NIP dan email penilai.

Kehadiran menggunakan peserta terdaftar pada sesi Jenjangnya yang berjadwal valid dan sudah berakhir. Sesi tanpa JP tetap masuk evaluasi kehadiran. Pencatatan sebagian/kosong/perlu pemeriksaan tidak diubah menjadi keputusan tidak hadir. Angka keterlambatan >10 menit mengikuti ringkasan aplikasi; tidak otomatis disebut sudah disetujui paket verifikasi sesi. Izin dipisahkan dari positif/negatif dan tidak memberi kehadiran otomatis. Tabel jenis catatan seluruh status pada PDF berbeda tujuannya dari hitungan catatan disetujui pada CSV.

Nilai JP dan perilaku berasal dari helper aplikasi yang sama, tanpa hitung ulang atau perubahan aturan. Kosong ditampilkan belum tersedia; nol hanya untuk hasil hitung nol. Rata-rata nilai perilaku memakai peserta terdaftar dengan status nilai lengkap. Status lengkap tetap tidak berarti pengesahan atau kelulusan.

Evaluasi dibaca langsung dari jurnal terhubung menggunakan pembangun rekap yang sama, bukan tab turunan yang mungkin usang; pembuatan laporan tidak menjalankan Perbarui Rekap Spreadsheet. Sasaran evaluasi adalah pasangan peserta terdaftar–sesi berakhir, atau sesi–Pengajar. Penugasan Pengajar yang belum diisi tetap terlihat sebagai kekurangan data. Hasil lama setelah ganti Pengajar tidak menggantikan hasil Pengajar saat ini. Jumlah diisi mencakup skor lengkap yang tersimpan pada pasangan terkini; sumber berubah ditandai terpisah dan dikeluarkan dari rata-rata. Rata-rata per aspek bersifat deskriptif, dengan jumlah dasar, bukan nilai akhir/kelulusan. Evaluasi kosong tidak diubah menjadi nol.

Data dibaca saat memegang ScriptLock setelah pemeriksaan akses ulang; waktu/status/kelompok sama dipakai sepanjang laporan. Edit manual spreadsheet tidak dikoordinasikan oleh ScriptLock; hindari perubahan manual selama proses. Laporan adalah snapshot, tidak mengikuti perubahan sesudahnya. Program/akses diperiksa lagi sebelum dan sesudah ekspor.

## Mekanisme PDF dan batas

Penyusun halaman membentuk dokumen Word sementara dalam memori dengan aset tertanam dan nomor daftar isi/halaman yang ditentukan otomatis. Drive mengimpor dokumen ini sebagai Google Docs sementara dan mengekspornya ke PDF. Tidak ada penyimpanan/share publik, dokumen hasil di Drive, sheet atau jurnal operasional baru. File sementara dipindahkan ke Sampah setelah selesai maupun gagal.

Jika respons impor terputus, sistem mencoba mencari/membersihkan file dengan penanda unik milik percobaan itu. Pembersihan gagal dilaporkan pada hasil yang berhasil atau log eksekusi pada kegagalan; nama TEMP unik dapat diperiksa melalui Drive pemilik. Coba ulang tidak menambah nilai/presensi atau membuat laporan ganda dalam spreadsheet.

Jumlah halaman PDF diperiksa terhadap rancangan. Jika konversi Google menyebabkan penambahan/pengurangan halaman, PDF ditolak dengan pesan **Daftar isi belum dapat dipastikan**. Ini mencegah pemberian PDF dengan daftar isi salah. Jika tetap terjadi, simpan pesan/ID laporan dan laporkan untuk penyesuaian tata letak; jangan menganggap percobaan gagal sudah menghasilkan laporan final.

Batas sumber lama tetap 1.000 peserta, 300 sesi dan 3.000 catatan per program; tambahan batas tata letak 240 halaman dan PDF 8 MB. Pembaca evaluasi juga mempertahankan batas sumber/rekap yang sudah ada (10.000 baris sumber, 5.000 pasangan evaluasi). Batas kuota/waktu Apps Script dan layanan Google dapat lebih rendah; program sangat besar dapat memerlukan rancangan ekspor terpisah. Tidak ada laporan parsial yang dinyatakan lengkap ketika batas tersebut terlampaui.

## Validasi dan uji pengguna

377 tes backend lulus: pengujian laporan lama untuk domain dipertahankan, pengujian renderer/lifecycle lama diganti dengan 13 kasus OOXML/konversi yang bermakna. Meliputi cakupan Program/Jenjang, evaluasi/rata-rata/sumber berubah/ganti Pengajar, sumber hilang, sesi mendatang/tidak valid, batas grafik 12/13, metadata/paginasi, teks panjang/XML escape, status/akses dicabut saat ekspor, kegagalan impor/respons hilang/pembersihan dan pelepasan lock. Tidak ada data sumber yang ditulis.

Chromium menguji UI Admin program selesai, busy guards, ID laporan, unduhan Blob PDF sebenarnya, kegagalan konversi tanpa tautan unduhan lama, program aktif terkunci, serta regresi login/pemuatan/sidebar/CSV/izin/evaluasi. Google dimock. Pratinjau lokal 2 peserta (25 halaman, tanpa grafik), 13 peserta (42 halaman, 5 grafik) serta stress keterangan/indikator panjang (28 halaman) memiliki jumlah halaman dan daftar isi yang sesuai; tidak ditemukan halaman kosong/teks melewati batas pada contoh yang diperiksa. Pratinjau memakai LibreOffice dan grafik matplotlib, sehingga bukan bukti konversi Google di deployment nyata.

[Pratinjau PDF sintetis](../previews/laporan-template/README.md). Contoh pribadi pengguna hanya dipakai untuk audit, tidak disalin sebagai isi data pratinjau.

Setelah pemasangan:

- Uji pada program selesai dengan satu Jenjang, lalu beberapa Jenjang. Cocokkan peserta, kesempatan kehadiran, JP dan evaluasi dengan halaman aplikasi.
- Periksa sampul/header/footer/nomor halaman dan daftar isi pada PDF Google. Jika perubahan layout ditolak, kirimkan pesan/ID percobaan.
- Uji program maksimal 12 dan di atas 12 peserta; nilai kosong, sumber berubah, izin tanpa presensi serta program tanpa aturan/evaluasi.
- Pastikan akun Petugas/Pengajar tidak dapat membuat laporan penuh, dan program aktif tetap terkunci.
- Pastikan jumlah dan status nilai sesuai sumber, tidak ada nilai gabungan/kelulusan, dan tidak ada file TEMP yang gagal dibersihkan.

Agent tidak menjalankan konversi/deployment Google nyata, mengubah data instansi atau menggabungkan main.
