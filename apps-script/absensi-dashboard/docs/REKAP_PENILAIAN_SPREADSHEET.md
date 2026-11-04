# Rekap penilaian pada spreadsheet terhubung

Pembaruan berikutnya menambahkan [evaluasi Pengajar oleh Admin](EVALUASI_PENGAJAR_ADMIN.md), tab jurnal Evaluasi_Pengajar dan tab keluaran Rekap_Evaluasi_Pengajar. Setelah tahap itu dipasang, rekap memiliki empat tab data dan satu tab status; mekanisme pembaruan tetap sama.

Acuan paket rekap awal: branch **feat/rekap-penilaian-spreadsheet**, 29 Oktober 2026, Asia/Jakarta. Melanjutkan UI 0d376d2 yang telah dipasang, diuji dan dinyatakan cukup oleh pengguna. Konfirmasi tersebut mencakup pengujian yang pengguna lakukan; bukan klaim bahwa seluruh skenario Google telah diuji.

## Pemasangan setelah paket Pengajar terpasang

1. Ganti seluruh kode **Evaluasi.gs, Akses.gs dan Code.gs** dari branch ini secara bersamaan. Semua HTML dan file Script lain tetap memakai versi sebelumnya.
2. Simpan. Muat ulang spreadsheet utama untuk memuat menu **Manajemen Pelatihan → Rekap Penilaian Terpadu**.
3. Perbarui deployment yang sama melalui Edit → New version → Deploy. Pertahankan URL, manifest/scopes, OAuth dan konfigurasi file penilaian yang sudah terhubung.
4. Buka menu Rekap Penilaian Terpadu sebagai pemilik, lalu tekan **Perbarui Rekap Spreadsheet**. File penilaian yang sudah terhubung digunakan otomatis; tidak perlu mengisi ID atau membuat spreadsheet baru.
5. Alternatif untuk Admin di aplikasi: **Monitoring → pilih sesi → Lihat Evaluasi Peserta → Perbarui Rekap Spreadsheet**, kemudian **Buka Spreadsheet Penilaian**. Tombol memperbarui rekap **seluruh program**, bukan hanya sesi yang sedang dibuka.

Pengajar dan Petugas tidak dapat membuka status/menjalankan pembaruan rekap seluruh database. Hak berbagi file Google tidak diubah oleh fitur ini.

## Tab yang dibuat pada file penilaian yang sama

| Tab | Isi dan satuan baris |
| --- | --- |
| Rekap_Evaluasi_Peserta | Nilai terbaru setiap kombinasi Pengajar–sesi–keikutsertaan: identitas Program/Jenjang/sesi/peserta, NIP, unit, enam skor, catatan, waktu, versi dan status sumber/riwayat. Nilai dari Pengajar lama atau sumber operasional yang terhapus tetap terlihat sebagai riwayat. |
| Catatan_Sikap_Perilaku | Salinan terbaca setiap catatan dari Catatan_Perilaku: indikator/jenis/cakupan, isi, sumber pencatat, status validasi, poin usulan/disahkan yang memang tersedia, tugas/durasi, rentang izin, bukti dan validasi. Termasuk izin, karena sumber operasional menyimpannya dalam tabel yang sama. |
| Rekap_Penilaian_Terpadu | Satu baris setiap pasangan sesi–peserta berstatus terdaftar pada Jenjang sesi tersebut. Enam skor Pengajar sesi saat ini ditampilkan bersama jumlah catatan sesi/program menurut status, jumlah positif/negatif/izin sesi yang disetujui, serta ID catatan untuk mencocokkan rincian. |
| Status_Rekap_Penilaian | Status snapshot, waktu/zona, pelaku, generasi, versi sumber, jumlah baris, aturan penggunaan dan peringatan. Periksa tab ini sebelum memakai hasil. |

Header dibekukan dan diberi warna navy, identitas awal dibekukan saat bergeser mendatar, tabel memiliki filter, teks panjang dibungkus. NIP ditulis sebagai teks; data yang sudah dibulatkan di sumber tidak dipulihkan dengan menambahkan digit. Teks sumber ditulis sebagai literal, bukan formula.

## Cara membaca integrasi

- Enam skor Pengajar tetap pada skala 1–5. **Belum dinilai** tetap kosong, bukan nol. Tidak ditambahkan rata-rata, bobot, nilai akhir atau konversi skor Pengajar ke poin perilaku/JP.
- Catatan disetujui, belum divalidasi, ditolak dan status lain dipisahkan. Izin tidak ikut dihitung lagi sebagai catatan negatif pada kolom jumlah jenis yang disetujui.
- Catatan **sesi** hanya masuk pasangan sesi/peserta/Jenjang yang sesuai. Program/Jenjang lain tidak ikut tercampur, meskipun orangnya sama.
- Catatan **program** ditampilkan pada kolom terpisah sebagai konteks yang sama pada setiap sesi peserta. **Jangan menjumlah kolom catatan program lintas sesi**, karena konteks tersebut berulang. Rincian aslinya tetap satu baris per ID catatan pada Catatan_Sikap_Perilaku.
- Penilaian Pengajar lama tidak dipakai sebagai pengganti nilai Pengajar baru. Riwayat tetap berada pada Rekap_Evaluasi_Peserta. Keikutsertaan nonaktif tidak dimasukkan sebagai peserta aktif rekap terpadu, tetapi nilai/nota sumber yang masih ada tetap dapat dibaca pada tab rincian.
- Sumber yang berubah sejak penilaian ditandai **berubah; periksa kembali**. Catatan yang indikatornya tidak ditemukan ditandai pada rincian dan tidak masuk hitungan terpadu. Relasi operasional lintas Program/Jenjang yang tidak valid atau ID duplikat menahan pembaruan sampai diperbaiki.

## Pembaruan dan sumber data

Rekap ini adalah **snapshot manual**. Perbarui setelah ada nilai baru, perubahan Pengajar/peserta/sesi, catatan, validasi atau penghapusan, dan sebelum menggunakan rekap untuk evaluasi. Status pada aplikasi akan menunjukkan USANG bila versi sumber berbeda dari snapshot terakhir. Tab spreadsheet mencantumkan waktu snapshot; tidak diperbarui otomatis ketika seseorang mengisi nilai.

Pembaruan manual dipilih agar setiap simpan nilai/catatan tidak membangun ulang seluruh database. Tidak ada trigger otomatis baru. Nilai tetap langsung tersimpan pada jurnal Evaluasi_Peserta; Catatan_Perilaku di database utama tetap menjadi sumber catatan Admin/Petugas. Fitur ini **menyalin dan menghubungkan untuk rekap**, belum memindahkan sumber catatan atau rumus penilaian lama.

Tab rekap merupakan keluaran aplikasi dan akan ditulis ulang saat diperbarui. Jangan gunakan tab itu untuk memasukkan nilai/catatan sumber. Tab jurnal Pengajar_Sesi dan Evaluasi_Peserta, file utama/akses, ID operasional, kehadiran dan JP tidak ditulis ulang oleh pembaruan ini. Tab lain yang bukan milik rekap tidak dihapus. Jika ada tab berisi data dengan nama keluaran yang sama, aplikasi berhenti; ubah nama tab tersebut sebelum mencoba lagi.

## Jika pembaruan terputus

Sumber dibaca dalam kunci bersama dan dibandingkan ulang sebelum dinyatakan selesai. Setiap keluaran dibaca ulang untuk memeriksa isi. Status MENYIAPKAN/GAGAL berarti **jangan memakai hasil parsial**. Jalankan Perbarui Rekap Spreadsheet lagi; hasil ditulis ulang dari sumber terkini dan ekor baris lama dibersihkan sehingga tidak menggandakan nilai.

Ini bukan transaksi atomik lintas-tab Google Sheets. Penanda status dan generasi digunakan untuk membedakan hasil selesai dari pembaruan parsial. Nilai/catatan sumber tidak diubah bila rekap gagal. Transaksi operasional/verifikasi/penghapusan yang belum selesai harus dipulihkan melalui alur asal sebelum rekap diperbarui.

Batas prototipe: 10.000 baris sumber per tabel, 10.000 nilai terbaru/baris rincian, 5.000 pasangan peserta–sesi terpadu, 350.000 sel dan 5 juta karakter keluaran; satu sel maksimal 45.000 karakter. Kuota/waktu Google nyata bisa membatasi lebih awal. Maksimal 50 peringatan dicantumkan.

## Pengujian

266 tes backend lulus, termasuk penulisan hanya pada tab turunan, nilai enam aspek dan catatan berbagai status, isolasi program/Jenjang, nilai kosong, riwayat Pengajar/sesi dihapus, teks/NIP literal, status usang, kegagalan/percobaan ulang, sumber berubah saat menulis, nama tab bentrok, pemulihan tab kosong, pembatasan peran/akun dicabut, pemilik asli dan batas ukuran. Chromium memakai HTML aktual dengan layanan Google tiruan untuk tombol Admin, status, gagal/ulang, link file, modal pemilik dan regresi Pengajar/Petugas; suite login/navigasi/sidebar/verifikasi juga lulus. Ini belum membuktikan izin, format/filter sheet, kuota atau latensi Google nyata.

Uji setelah deployment pada data dummy/salinan:

1. Perbarui rekap melalui menu spreadsheet. Periksa empat tab baru pada file penilaian yang sudah terhubung.
2. Cocokkan enam skor satu peserta dengan aplikasi, serta satu catatan Admin/Petugas dan statusnya.
3. Pastikan peserta yang belum dinilai tetap kosong dan peserta/sesi Jenjang lain tidak tercampur.
4. Tambah/ubah nilai atau catatan, buka kembali modal Admin dan periksa USANG, lalu perbarui rekap.
5. Perbarui dua kali tanpa mengubah sumber: jumlah baris tidak bertambah.
6. Cocokkan NIP 18 digit, filter/header, catatan program dan waktu snapshot. Gunakan sumber aplikasi untuk mengubah nilai/catatan, bukan tab rekap.

Tidak ada file Google nyata, trigger, deployment atau data pengguna yang diubah dari workspace agent.
