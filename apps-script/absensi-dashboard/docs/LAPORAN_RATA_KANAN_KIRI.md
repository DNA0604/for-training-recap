# Perapian perataan paragraf laporan

Branch **fix/paragraf-laporan-rata-kanan-kiri**, melanjutkan bdb798e. Pengguna menilai desain membaik dan hasil sementara aman, tetapi narasi masih terlihat tidak rapi/perataannya belum sesuai. Isi dan desain dipertahankan. Penyebutan AI merupakan kemungkinan untuk narasi lebih detail, tidak mengubah keputusan tanpa AI pada paket ini.

Jika paket laporan sebelumnya sudah terpasang, ganti seluruh isi **LaporanTampilan.gs saja** melalui GitHub Raw. Simpan lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**, pertahankan URL. Laporan.gs, Pengelolaan.html, API dan konfigurasi sumber tetap. Jika paket awal belum terpasang lengkap, ikuti [pemasangan laporan](LAPORAN_TEMPLATE.md) dengan sumber dari branch terbaru ini.

Perataan `both` sudah ditetapkan sebelumnya, tetapi kode juga menulis hasil estimasi bungkus teks menjadi soft return pada setiap baris. Bersama pengaturan kompatibilitas dokumen, pemotongan buatan itu dapat menghambat perataan normal saat konversi. Narasi sekarang ditulis sebagai teks paragraf asli dan dibiarkan mengalir oleh pengolah dokumen; estimasi baris hanya dipakai untuk menentukan ruang/halaman. Paragraf tetap memakai justify, Arial 12/1,15 dan arah kiri-ke-kanan secara eksplisit. Paragraf yang melebihi satu halaman dipisahkan dengan menjaga karakter/kata/spasi sumber; tidak merekonstruksi teks dari potongan baris atau menyisipkan spasi ke dalam kata/URL.

Judul dan teks identitas mengikuti perataan yang sudah ditentukan; angka tabel tetap rata kanan dan nama/keterangan tabel rata kiri. Baris baru yang memang ada pada metadata/catatan tetap dipertahankan. Baris terakhir paragraf justify tidak dipanjangkan secara paksa; bentuk ini adalah penulisan paragraf normal. Sampul, margin, rubrik, jumlah peserta, grafik, isi kalimat, narasi otomatis berdasarkan aturan dan pembatasan akses tetap.

Validasi: **379 tes backend lulus**, termasuk dua kasus baru untuk paragraf justify tanpa soft break buatan, LTR, perataan judul/tabel, serta pemisahan halaman tanpa kehilangan spasi/kata/Unicode. Pratinjau 2/13 peserta dirender ulang secara lokal dengan LibreOffice; jumlah halaman tetap 25/42, daftar isi/footer cocok, tidak ada halaman isi kosong/luapan teks. Tepi kata pada baris narasi selain baris terakhir berada di margin kiri dan kanan dalam toleransi 2 poin. Pengukuran memakai kata, bukan bounding box span yang dapat menyertakan spasi akhir.

[Contoh PDF lokal terbaru](../previews/laporan-template/README.md). Ini bukan hasil konversi Google. Setelah deployment, buat ulang satu laporan dan periksa paragraf Ringkasan Eksekutif/uraian program. PDF yang sudah diunduh sebelumnya tidak berubah. Jika hasil Google masih berbeda, PDF baru diperlukan untuk menelusuri efek konversi, bukan menyimpulkan penyebabnya dari tampilan lokal.

Tidak ada agent yang mengubah Google data/deployment atau main. Tidak ada layanan AI, perubahan penilaian atau perluasan isi laporan.
