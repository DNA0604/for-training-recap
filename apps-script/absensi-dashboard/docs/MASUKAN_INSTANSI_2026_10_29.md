# Masukan instansi — 29 Oktober 2026

Dokumen pendataan permintaan dan opsi pembahasan. Rekomendasi di sini belum menjadi keputusan format penilaian atau migrasi.

| Permintaan | Status / langkah |
| --- | --- |
| Peran Pengajar dengan tampilan Admin | Menunggu batas kewenangan. Tambahan pilihan peran harus disertai otorisasi server, scope dan larangan penilaian pengajar oleh non-Admin. |
| Penilaian Pengajar khusus Admin | Menunggu indikator, skala, bobot, periode evaluasi dan aturan hasil. Belum ada nilai/formula yang dibuat. |
| Spreadsheet penilaian terpisah | Usulan: spreadsheet operasional, akses, dan penilaian tetap mempunyai fungsi masing-masing. Bahas hasil final/snapshot peserta, catatan sumber, aturan versi, kepemilikan dan migrasi sebelum memindah data. |
| Nama Pengajar pada Sesi | Menunggu satu/beberapa pengajar per sesi. Usulan identitas Pengajar stabil dan tautan akun opsional, sehingga laporan tidak mencocokkan orang berdasarkan teks nama. |
| Manajemen Akses memakai sidebar | Dapat diseragamkan dengan halaman lain. Opsi memisahkan HTML dari Akses.gs perlu mempertahankan panel native pemilik dan gateway Admin. Tidak otomatis harus menambah file jika renderer bersama cukup. |
| Kolom CSV Rekap Program | Menunggu contoh file/kolom dari pengguna. Nilai keseluruhan saat ini sengaja kosong karena aturan akhir belum disepakati. |
| Edit / Ubah Status indikator macet | Diperbaiki di Index.html: tombol disinkronkan kembali setelah pemuatan selesai. |
| Hapus indikator pada modal/card pengelolaan | Belum dibuat. Katalog indikator saat ini global untuk seluruh program. Perlu membedakan penghapusan indikator belum dipakai, penonaktifan indikator yang dirujuk dan pengaturan poin per program; riwayat nilai harus tetap dapat dibaca. IZIN_SESI wajib aktif. |
| Tambah Indikator Baru di kanan atas | Dipindahkan ke heading Nilai Sikap & Perilaku, di samping Muat Ulang Nilai. |
| Tetap masuk jika web ditutup kurang dari 4 jam | Belum diubah. Saat ini token di sessionStorage, server juga membatasi idle 30 menit dan memakai ScriptCache yang dapat terhapus sebelum TTL. Bahas sesi persisten dengan batas absolut dan pencabutan akses/Log Out tetap berlaku. |
| Pemuatan data lambat | Belum dioptimalkan. Ukur waktu verifikasi, pembacaan Sheets dan render terlebih dahulu. Kandidat: pembacaan berulang direktori/riwayat, pemindaian seluruh tabel dan validasi relasi berulang. Optimasi harus menjaga perubahan hak akses segera berlaku. |

## Temuan sumber

- Index.html: renderIndicatorCatalog membuat tombol disabled ketika scoreLoading masih true; loadScore akhirnya memanggil controls, yang sebelumnya tidak mengatur tombol baris indikator. Perbaikan hanya menyinkronkan state tombol; handler edit dan kontrak RPC tetap.
- Code.gs: muatNilaiPerilakuProgramIndex menghitung hasil dari Program, aturan versi, keikutsertaan, kehadiran dan Catatan_Perilaku. Pemindahan hasil peserta tidak sama dengan menyalin satu tab nilai final.
- Code.gs/Jenjang.gs: tabelIndex membaca seluruh data range, lalu validasi relasi dapat membaca Jenjang/Sesi/Keikutsertaan lagi. Akses.gs membaca direktori dan riwayat pada setiap pemeriksaan sesi. Ini kandidat biaya, bukan pengukuran latensi Google yang terbukti.

## Urutan kerja yang diusulkan

1. Perbaikan kecil yang jelas: kontrol indikator dan letak tombol (paket ini).
2. Pengukuran/optimasi pemuatan dan desain sesi login persisten; seragamkan tampilan Manajemen Akses.
3. Tetapkan kewenangan Pengajar dan relasi Pengajar–Sesi, lalu implementasikan dan uji isolasinya.
4. Sepakati format serta struktur spreadsheet penilaian, kemudian kembangkan penilaian Pengajar dan migrasi/snapshot peserta secara bertahap.
5. Sesuaikan CSV berdasarkan contoh instansi dan uji konsistensi dengan profil, rekap serta laporan.

Tidak ada spreadsheet, data Google, konfigurasi sesi, peran baru atau aturan penilaian yang diubah pada pendataan ini.
