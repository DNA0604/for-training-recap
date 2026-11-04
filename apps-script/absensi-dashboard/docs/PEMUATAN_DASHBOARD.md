# Pemuatan data utama lebih dahulu

Branch `perf/pemuatan-dashboard-bertahap` melanjutkan paket login empat jam `c939a2b`. Pengguna meminta melanjutkan perbaikan pemuatan data; belum ada hasil pengukuran waktu pada Google yang diberikan.

## Pemasangan

Jika paket login sebelumnya sudah dipasang lengkap, ganti **Akses.gs saja**, simpan, lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Pertahankan URL.

Jika paket login sebelumnya belum dipasang, ganti lengkap **Akses.gs, Code.gs dan Jenjang.gs bersama-sama** dari branch ini. Tidak perlu file Apps Script, sheet, spreadsheet, migrasi, OAuth atau pendataan akun baru. Sumber lain tetap versi terakhir.

## Yang berubah

- Beranda/Monitoring meminta data utama dahulu. Kartu riwayat koreksi dan verifikasi dibuat serta dimuat sesudah respons data utama berhasil. Bila data utama gagal, gunakan Coba Lagi; permintaan tambahan belum dijalankan. Ini menghindari persaingan permintaan tambahan saat halaman mulai dibuka, tanpa menyembunyikan riwayat yang tersedia.
- Pada Monitoring, riwayat koreksi lama dan daftar verifikasi yang diminta bersamaan menggunakan satu panggilan server, bukan dua. Pada Beranda hanya ada riwayat koreksi, sehingga tetap satu panggilan biasa.
- Rekap Program meminta JP dan nilai perilaku bersama melalui satu panggilan, bukan dua. Keduanya tetap diperlukan agar CSV tidak memakai rekap parsial. Jika salah satu gagal, rekap/download tetap belum tersedia dan Muat Ulang dapat dicoba lagi.
- Tidak ada hasil bisnis yang disimpan di localStorage/sessionStorage atau dipakai kembali sesudah respons selesai. Muat Ulang selalu meminta server kembali. Penyimpanan token login empat jam tetap seperti pembaruan sebelumnya.

Gateway kelompok hanya menerima empat nama baca yang ditetapkan di server, dengan jumlah/tipe argumen terbatas dan maksimal enam anggota. Sesi/direktori dibaca sekali dalam permintaan itu; izin peran dan target diperiksa untuk setiap anggota. Pengajar tetap tidak dapat mengakses riwayat/verifikasi panitia. Penulisan, penghapusan, evaluasi, QR, unggahan dan ekspor tidak dapat disisipkan ke kelompok. Semua jalur tersebut tetap memakai gateway/validasi semula.

Snapshot sheet hanya hidup selama satu permintaan server. Permintaan berikutnya membaca sumber serta akses terkini; tidak ada cache bersama lintas permintaan/pengguna. Hasil anggota yang gagal memuat sumber ditampilkan sebagai kesalahan, bukan statistik nol. Sesi yang tidak sah/akses ditahan menolak kelompok. Respons terlambat tetap ditolak setelah Log Out, pergantian akun atau batas empat jam. Sidebar, pemilihan Program/Jenjang, aturan JP dan skor tidak berubah.

## Pengukuran lokal

Pada fixture dummy Petugas yang sama, jumlah panggilan `getValues/getFormulas` ke data range:

| Bagian | Dua permintaan terpisah | Satu permintaan kelompok |
| --- | ---: | ---: |
| Dua riwayat Monitoring | 20 | 11 |
| JP + nilai perilaku Rekap Program | 25 | 16 |

Angka ini membandingkan paket login sebelumnya dengan pembaruan ini, bukan waktu render atau latensi Google. Primary data dan pemeriksaan login tetap memiliki permintaan sendiri; tidak semua panggilan aplikasi digabungkan. Koneksi, ukuran data, jadwal layanan Google dan validasi masih memengaruhi waktu nyata. Tidak ada janji persentase peningkatan waktu.

## Uji setelah deployment

1. Masuk sebagai Admin/Petugas. Buka Beranda lalu Monitoring; data utama dan filter tersedia terlebih dahulu, kemudian kartu pengajuan menyusul. Tidak perlu klik tambahan untuk memuatnya.
2. Pilih program/Jenjang/sesi, lalu buka Rekap Program. Cocokkan nama/jumlah peserta, JP, status nilai dan CSV dengan hasil sebelumnya. Muat ulang setelah sumber berubah; perubahan harus muncul.
3. Uji Pengajar dan Petugas pada penugasan berbeda. Data tidak boleh meluas ke sesi/Jenjang lain. Cabut penugasan/nonaktifkan akun; permintaan berikutnya tetap mengikuti perubahan tersebut.
4. Saat pemuatan berlangsung, lakukan Log Out atau ganti akun melalui tab lain. Respons lama tidak boleh membuka kembali halaman yang terkunci.
5. Uji catat izin/evaluasi dan perhitungan JP seperti biasa. Perubahan ini tidak mengganti alur simpan.
6. Bandingkan durasi pada data/koneksi yang sama beberapa kali sebelum/sesudah deployment. Pisahkan waktu pemeriksaan sesi, data awal, kehadiran dan Rekap; satu percobaan tidak membuktikan peningkatan produksi.

## Verifikasi lokal

359 tes backend lulus, termasuk delapan pengujian kelompok: hasil identik dan pengurangan baca, isolasi per anggota, batas Pengajar, kegagalan parsial, sumber/pencabutan akses terbaru, token tidak sah/kedaluwarsa/Log Out, penolakan payload/nama tulis dan pembersihan konteks saat gagal.

Chromium memakai HTML hasil injeksi server dan layanan Google tiruan untuk prioritas data utama, satu permintaan riwayat/Rekap, Muat Ulang, error anggota/koneksi/respons tidak lengkap, respons terlambat setelah Log Out, serta regresi akses/login empat jam/sidebar/navigasi/izin/indikator/evaluasi. Pemeriksaan sumber/sintaks/hash dilakukan. Tidak ada deployment atau data Google nyata yang diubah oleh agent; hasil produksi tetap perlu pengujian pengguna.
