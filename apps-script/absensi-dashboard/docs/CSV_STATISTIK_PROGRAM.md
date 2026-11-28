# CSV Rekap Program — statistik kehadiran dan catatan

Branch `feat/csv-statistik-kehadiran-perilaku`, melanjutkan paket pemuatan dashboard `405d40b`. Pengguna mengirim contoh CSV lama dengan 16 header, meminta enam kolom tambahan, lalu menyetujui catatan yang disetujui saja, izin per sesi, dan total poin sebelum batas tambahan positif/tanpa nilai dasar.

## Pemasangan

Ganti seluruh isi **Code.gs dan Index.html bersama-sama**, simpan, lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Pertahankan URL. Tidak perlu sheet, spreadsheet, Script/HTML, konfigurasi akun atau migrasi baru. File lain tetap versi pembaruan terakhir, termasuk Akses.gs untuk login/pemuatan.

Monitoring → pilih Program → Rekap Program → Muat Ulang Rekap → Unduh CSV. CSV mencakup seluruh peserta pada hasil rekap program yang diizinkan bagi akun tersebut; pencarian tabel tidak mempersempit ekspor. Petugas dibatasi Jenjang penugasan; Pengajar hanya sesi mengajarnya.

## Definisi enam kolom baru

| Header | Arti |
| --- | --- |
| `jumlah_kehadiran` | Jumlah sesi peserta dengan waktu datang valid pada tanggal sesi. Koreksi datang menggantikan scan asli jika tersedia. Presensi datang tanpa pulang sudah dihitung; jumlah ini bukan jumlah sesi dengan JP lengkap. Termasuk sesi tanpa JP. Izin saja atau hanya scan pulang tidak menambah kehadiran. |
| `jumlah_keterlambatan` | Jumlah sesi dengan datang efektif lebih dari 10 menit sesudah jadwal mulai, sesuai ringkasan Monitoring. Tepat 10 menit belum terlambat. Toleransi poin perilaku tetap mengikuti aturan program yang terpisah. |
| `jumlah_izin` | Jumlah sesi unik dengan catatan IZIN_SESI berstatus disetujui. Dua izin pada satu sesi tetap satu. Tidak mensyaratkan presensi dan tidak memakai status pengurangan JP sebagai pengganti persetujuan catatan. |
| `jumlah_catatan_positif` | Jumlah catatan sesi disetujui dengan jenis indikator positif. Satu catatan = satu kejadian, termasuk jika poinnya nol; indikator nonaktif tetap dihitung pada riwayatnya. |
| `jumlah_catatan_negatif` | Jumlah catatan sesi disetujui dengan jenis indikator negatif, **selain IZIN_SESI**, karena izin sudah memiliki kolom tersendiri. |
| `total_poin_catatan_perilaku` | Jumlah poin positif dikurangi pengurangan dari perhitungan aturan program yang sudah ada, sebelum batas tambahan positif/nilai dasar/bobot/batas nilai akhir. Termasuk konsekuensi izin sesuai aturan, toleransi dan izin bebas poin. Tidak memakai hitungan kejadian × poin bawaan atau nilai evaluasi Pengajar/Panitia. |

Kolom baru ditempatkan sebelum `dimuat_pada`. Header yang sudah ada, termasuk `id_jenjang` pada kode terbaru, dipertahankan: total **23 kolom**. Nilai keseluruhan tetap kosong karena aturan nilai akhir belum disepakati.

Catatan di atas dibatasi pada sesi yang sesuai Program/Jenjang peserta dan cakupan akun, sama seperti sumber nilai perilaku program saat ini. Catatan tingkat program tanpa sesi tidak dimasukkan ke statistik baru atau total poin ini. `jumlah_catatan_perilaku` lama tetap mengikuti perhitungan lama (seluruh status pada sumber nilai, dan kosong jika aturan belum ada); jangan menyamakannya dengan penjumlahan tiga kolom catatan disetujui.

Tanpa aturan, lima kolom jumlah tetap tersedia, tetapi total poin/nilai perilaku kosong. Jika ada catatan belum diverifikasi/tidak lengkap/transaksi tertunda, total poin yang dapat dihitung mengikuti nilai yang masih berstatus `sementara`; hasil ini belum final. Angka nol berarti ada hasil hitung nol. Data waktu datang tidak valid membuat jumlah kehadiran/keterlambatan kosong; jadwal mulai yang tidak valid membuat jumlah keterlambatan kosong. Duplikat presensi/catatan disetujui atau referensi indikator yang tidak tersedia menolak rekap, bukan menggandakan angka.

Jumlah kehadiran, keterlambatan dan izin tidak saling eksklusif: peserta dapat datang terlambat serta izin sebagian sesi. Angka-angka ini tidak dijumlahkan menjadi total peserta atau sesi wajib. Tidak ada perubahan presensi, JP, status persetujuan, aturan penilaian atau jurnal.

CSV tetap UTF-8 dengan BOM, kutip/escape dan nama file seperti sebelumnya. Total poin negatif diekspor sebagai angka negatif, sementara teks bebas yang menyerupai rumus tetap dilindungi. Contoh CSV pengguna tidak dimasukkan ke repository agar data peserta tidak tersalin ke sumber pengembangan.

## Pengujian

368 tes backend lulus, termasuk sembilan pengujian baru untuk batas waktu/koreksi/sesi tanpa JP, izin tanpa presensi, catatan disetujui/ditolak/menunggu, izin ganda, Program/Jenjang/sesi Pengajar, sumber berubah, aturan belum ada, total sebelum cap dan nilai negatif/escape CSV. Sintaks/ID HTML/hash sumber diperiksa.

Chromium dengan HTML hasil injeksi server dan layanan Google tiruan menguji unduhan Blob CSV sebenarnya pada Admin desktop/Petugas mobile: 23 header, jumlah baris/cakupan, nilai statistik, nama file dan tidak adanya permintaan data tambahan ketika mengunduh, ditambah regresi login/pemuatan/akses/evaluasi. Tidak ada deployment atau data Google nyata yang diubah oleh agent.

Setelah deployment, cocokkan satu peserta dengan presensi sesi, catatan yang disetujui dan rincian nilai perilakunya. Uji peserta izin penuh tanpa presensi, peserta terlambat dengan koreksi, serta akun di Jenjang berbeda. Muat ulang rekap setelah perubahan, lalu unduh CSV kembali. Pastikan status `sementara` dipertimbangkan sebelum memakai total poin sebagai bahan evaluasi final.
