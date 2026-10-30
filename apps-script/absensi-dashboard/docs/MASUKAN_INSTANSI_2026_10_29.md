# Masukan instansi — 29 Oktober 2026

Status diperbarui 30 Oktober 2026. Dokumen pendataan permintaan dan opsi pembahasan; rekomendasi/rubrik draf belum menjadi keputusan format penilaian atau migrasi.

| Permintaan | Status / langkah |
| --- | --- |
| Peran Pengajar dengan tampilan Admin | Sudah diimplementasikan: tampilan yang sama, akses sesi/Jenjang mengajar dan evaluasi peserta enam aspek per sesi; tanpa kelola akun/hapus/penilaian Pengajar. Tampilan diperbaiki dan diterima pengguna. |
| Penilaian Pengajar khusus Admin | Lima aspek dan skala 1–5 per sesi disetujui pengguna dan diimplementasikan pada feat/evaluasi-pengajar-admin, khusus Admin dengan riwayat/jurnal/rekap terpisah. Tidak ada bobot atau nilai akhir. Pengguna mengonfirmasi implementasi dan hasil berjalan normal pada 30 Oktober (7683452); fitur dinyatakan selesai. |
| Evaluasi peserta oleh Admin/Petugas | Tambahan permintaan: tiga aspek kedisiplinan peserta, kerja sama dan prakarsa setelah setiap sesi selesai. Diimplementasikan pada feat/evaluasi-peserta-panitia; satu evaluasi bersama per peserta/sesi, riwayat, skala 1–5 dan Rekap_Evaluasi_Panitia di file terhubung. Tidak wajib catatan perilaku. Pengguna mengonfirmasi sudah aman pada e7cfaa7. |
| Spreadsheet penilaian terpisah | Sudah terhubung untuk jurnal penugasan/nilai Pengajar dan rekap terbaca terintegrasi dengan catatan Admin/Petugas. Rekap a8f9e16 diterima pengguna 30 Oktober. Sumber catatan/rumus lama belum dipindah; belum ada nilai akhir gabungan. |
| Nama Pengajar pada Sesi | Sudah diimplementasikan: satu akun Pengajar stabil per sesi, pilihan saat membuat sesi dan modal Pengajar Sesi. Nama tampil pada Ringkasan Sesi ketiga peran; riwayat tetap disimpan. |
| Manajemen Akses memakai sidebar | Diimplementasikan pada ui/manajemen-akses-dashboard: HTML ManajemenAkses untuk header/sidebar/card normal, tetap menggunakan formulir/handler bersama dari Akses.gs. Panel native pemilik/gateway Admin dipertahankan. Pengguna mengonfirmasi semua berjalan normal pada 30 Oktober (8e9a01b). |
| Kolom CSV Rekap Program | Menunggu contoh file/kolom dari pengguna. Nilai keseluruhan saat ini sengaja kosong karena aturan akhir belum disepakati. |
| Edit / Ubah Status indikator macet | Tombol diperbaiki di Index.html. Laporan lanjutan Nonaktif gagal karena pembacaan konfigurasi aturan diperbaiki pada fix/nonaktif-indikator-aturan-lama: ganti Code.gs saja setelah paket sebelumnya. Menunggu uji ulang pengguna. |
| Hapus indikator pada modal/card pengelolaan | Diimplementasikan pada feat/hapus-indikator-belum-digunakan: katalog global, hanya indikator tambahan belum dirujuk; bawaan dan seluruh referensi/riwayat dilindungi, alasan/persetujuan/konfirmasi dan cadangan/pemulihan. Yang terpakai dapat dinonaktifkan; IZIN_SESI wajib aktif. Ganti Hapus.gs + Index.html; menunggu uji deployment pengguna. |
| Tambah Indikator Baru di kanan atas | Dipindahkan ke heading Nilai Sikap & Perilaku, di samping Muat Ulang Nilai. |
| Tetap masuk jika web ditutup kurang dari 4 jam | Diimplementasikan pada feat/login-tersimpan-pemuatan-data: pilihan pengguna maksimal 4 jam sejak login, tanpa idle 30 menit; penyimpanan browser/server dan Log Out/pencabutan tetap berlaku. Menunggu uji deployment. |
| Pemuatan data lambat | Pengurangan pembacaan berulang dalam satu permintaan sudah diimplementasikan: fixture Beranda 30→13 dan Monitoring 26→14 pembacaan data range. Tiap permintaan/recheck tetap membaca akses terbaru; waktu muat Google nyata perlu diukur pengguna. |

## Temuan sumber

- Index.html: renderIndicatorCatalog membuat tombol disabled ketika scoreLoading masih true; loadScore akhirnya memanggil controls, yang sebelumnya tidak mengatur tombol baris indikator. Perbaikan hanya menyinkronkan state tombol; handler edit dan kontrak RPC tetap.
- Code.gs: muatNilaiPerilakuProgramIndex menghitung hasil dari Program, aturan versi, keikutsertaan, kehadiran dan Catatan_Perilaku. Pemindahan hasil peserta tidak sama dengan menyalin satu tab nilai final.
- Code.gs/Jenjang.gs: tabelIndex membaca seluruh data range, lalu validasi relasi dapat membaca Jenjang/Sesi/Keikutsertaan lagi. Akses.gs membaca direktori dan riwayat pada setiap pemeriksaan sesi. Ini kandidat biaya, bukan pengukuran latensi Google yang terbukti.

## Urutan kerja awal yang diusulkan (historis)

1. Perbaikan kecil yang jelas: kontrol indikator dan letak tombol (paket ini).
2. Pengukuran/optimasi pemuatan dan desain sesi login persisten; seragamkan tampilan Manajemen Akses.
3. Tetapkan kewenangan Pengajar dan relasi Pengajar–Sesi, lalu implementasikan dan uji isolasinya.
4. Sepakati format serta struktur spreadsheet penilaian, kemudian kembangkan penilaian Pengajar dan migrasi/snapshot peserta secara bertahap.
5. Sesuaikan CSV berdasarkan contoh instansi dan uji konsistensi dengan profil, rekap serta laporan.

Tidak ada spreadsheet, data Google, konfigurasi sesi, peran baru atau aturan penilaian yang diubah pada pendataan ini.

## Draf pembahasan penilaian Pengajar

Ini usulan awal untuk ditinjau bersama, bukan ketentuan instansi atau formula yang telah diimplementasikan.

Penilaian dilakukan Admin per satu sesi/pengajar, dengan konteks Program dan Jenjang. Usulan aspek: penguasaan materi (25%), kejelasan penyampaian (25%), metode/media (20%), interaksi/respons peserta (20%), dan disiplin waktu (10%). Usulan skala 1–5: Sangat Kurang, Kurang, Cukup, Baik, Sangat Baik. Hasil berbobot dapat dikonversi ke skala 100 setelah rubrik disepakati. Nilai kosong tetap Belum dinilai, bukan nol; komentar evaluasi, penilai dan waktu harus tercatat. Pengajar tidak mengakses menu/nilai ini sesuai batas peran yang disetujui pengguna.

Usulan pemisahan bertahap: file utama untuk kegiatan/kehadiran/catatan sumber; file akses untuk akun/peran/penugasan; file penilaian untuk evaluasi Pengajar dan salinan hasil final peserta beserta versi sumber/aturan. Perhitungan peserta saat ini dinamis sehingga pemindahan sumber, indikator dan aturan seluruhnya membutuhkan keputusan migrasi tersendiri. Belum ada perpindahan data.

## Keputusan lanjutan dan tahap implementasi

Pengguna menegaskan bahwa Pengajar juga menilai Peserta menggunakan enam aspek dari instansi (keaktifan, kedisiplinan, kerapian, kesopanan, kreativitas, kerja sama), **setiap sesi**, dan menyetujui skala **1–5**. Branch feat/evaluasi-peserta-pengajar mengimplementasikan peran terbatas, satu pengajar pada sesi, serta evaluasi peserta dalam spreadsheet terpisah. Lihat EVALUASI_PESERTA_SESI.md. Bobot/rumus akhir dan penilaian Pengajar oleh Admin tetap belum disepakati. Tabel status/rubrik draf sebelumnya adalah catatan urutan pembahasan, bukan pengganti keputusan enam aspek ini.

## Status dan langkah berikutnya — 30 Oktober 2026

Pengguna menerima rekap pada file penilaian terhubung (a8f9e16). Rekomendasi diskusi berikutnya: **penilaian Pengajar oleh Admin**, karena relasi sesi/Pengajar dan file penilaian sudah tersedia. Mulai dengan menyepakati indikator dan skala; persentase/bobot pada draf lama tidak otomatis berlaku. Satu evaluasi per sesi/Pengajar dan akses Admin adalah usulan alur yang konsisten dengan kebutuhan sebelumnya, bukan formula penilaian baru yang sudah diimplementasikan.

Pekerjaan lain yang masih tertunda: sidebar Manajemen Akses; penghapusan indikator belum dipakai dengan perlindungan referensi/riwayat; sesi login persisten beserta batas idle/absolut; pengukuran dan optimasi pemuatan; kolom CSV menunggu contoh pengguna. Belum ada perubahan kode untuk kandidat-kandidat ini.

## Implementasi evaluasi Pengajar oleh Admin — 30 Oktober 2026

Pengguna menyetujui lima aspek tanpa persentase: penguasaan materi, kejelasan penyampaian, metode/media, interaksi/respons peserta dan kedisiplinan waktu. Skala angka bulat 1–5 per sesi dengan catatan/riwayat telah diimplementasikan; baca [panduan terbaru](EVALUASI_PENGAJAR_ADMIN.md). Draf persentase sebelumnya tetap historis, tidak diterapkan. Penilaian ini tidak digabung dengan enam aspek peserta/JP.

Pembaruan UI Manajemen Akses telah diimplementasikan setelah penerimaan evaluasi Pengajar: [panduan dashboard akses](MANAJEMEN_AKSES_DASHBOARD.md). Permintaan login persisten, optimasi waktu muat, hapus indikator dan CSV tetap terpisah.

## Hapus indikator belum digunakan — 30 Oktober 2026

Setelah pengguna menerima tampilan Manajemen Akses, tahap berikutnya mengimplementasikan hapus indikator tambahan yang belum digunakan. Baca [panduan dua file](HAPUS_INDIKATOR.md). Catatan bagian sebelumnya tetap historis; status terkini ada pada tabel di atas. Belum ada perubahan sesi login persisten/optimasi waktu muat/kolom CSV atau bobot penilaian.
