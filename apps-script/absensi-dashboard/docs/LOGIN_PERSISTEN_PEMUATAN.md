# Login tersimpan dan pengurangan pembacaan berulang

Branch `feat/login-tersimpan-pemuatan-data`, melanjutkan evaluasi Panitia `e7cfaa7` yang sudah diterima pengguna. Pengguna memilih **tetap masuk hingga 4 jam sejak login**, termasuk saat web ditutup. Pekerjaan lain ditunda.

## Pemasangan

Ganti isi lengkap **Akses.gs, Code.gs dan Jenjang.gs bersama-sama** dari branch ini. Semua pembaruan sebelumnya sudah termasuk; Evaluasi.gs dan sumber lain tetap versi terakhir yang dipasang.

Simpan, lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Pertahankan URL deployment. Tidak perlu Script/HTML baru, spreadsheet baru, kolom, migrasi, setup akun atau konfigurasi OAuth ulang.

## Perilaku login

- Login berlaku **maksimal 4 jam sejak login berhasil**. Menutup web, membuka tab baru, berpindah halaman dan aktivitas tidak memperpanjang batas tersebut. Batas keluar setelah 30 menit tanpa aktivitas dihapus sesuai pilihan pengguna.
- Pada profil browser dan alamat aplikasi yang sama, halaman yang dibuka kembali membaca sesi tersimpan lalu memverifikasinya di server. Tidak perlu memilih akun Google lagi selama sesi masih sah.
- **Log Out** menghapus sesi browser dan mencabut token di server. Tab lain pada browser/origin yang sama ikut terkunci. Pergantian akun pada tab lain mengunci halaman lama agar identitas/tampilan tidak bercampur; gunakan Coba Lagi untuk memuat akun yang aktif.
- Akun dinonaktifkan/diubah, penugasan dicabut, Jenjang tidak aktif, konfigurasi login berubah, atau transaksi akses belum selesai tetap diperiksa. Penyimpanan login tidak memberi tambahan kewenangan.
- Browser harus mengizinkan penyimpanan situs. Jika diblokir, aplikasi tetap dapat dipakai melalui penyimpanan tab/memori dan menampilkan pemberitahuan. Login setelah tab ditutup belum dapat dijamin pada mode tersebut. Profil berbeda, mode privat dan penghapusan data situs memiliki penyimpanan terpisah. Gunakan Log Out pada perangkat bersama.

Sesi lama yang masih valid dapat dipakai dan dipindahkan ke penyimpanan baru tanpa mengulang masa 4 jam. Sesi lama yang sudah hilang/kedaluwarsa tetap memerlukan login. OAuth state/PKCE/browser key tetap untuk satu alur/tab login dan tidak dijadikan sesi jangka panjang. Token tidak ditambahkan ke URL atau kode HTML.

Server menggunakan metadata sesi di ScriptProperties agar sesi sah tidak hilang hanya karena CacheService terhapus lebih awal. Kunci memakai hash token; token mentah dan token akses Google tidak disalin ke metadata tersebut. Penanda pencabutan mencegah cache lama menghidupkan kembali sesi yang sudah Log Out. Entri yang kedaluwarsa dibersihkan saat login baru, dengan batas 500 entri sesi/penanda per database. Penyimpanan ini dibuat otomatis dan tidak memerlukan sheet tambahan.

## Pemuatan data

Pembacaan sheet berulang dideduplikasi **hanya di dalam satu permintaan baca**. Data tidak disimpan bersama lintas pengguna atau lintas permintaan. Permintaan baru membaca ulang sumber. Setelah menunggu kunci dan sebelum pemeriksaan akses ulang, snapshot dibuang agar pencabutan terbaru terbaca. Jalur penulisan data operasional tetap memakai pembacaan/verifikasi segar. Validasi header, rumus, relasi Jenjang dan transaksi tertunda dipertahankan.

Pengukuran lokal pada fixture dummy yang sama, sebelum dan sesudah pembaruan:

| Permintaan | Sebelum | Sesudah |
| --- | ---: | ---: |
| Pemeriksaan sesi | 10 | 8 |
| Data awal Monitoring | 21 | 12 |
| Kehadiran sesi | 26 | 14 |
| Beranda | 30 | 13 |
| Rekap JP program | 30 | 15 |
| Nilai perilaku program tanpa aturan | 13 | 10 |

Angka adalah panggilan **getValues/getFormulas pada data range**, termasuk sumber akses dan operasional dalam fixture Node. Ini bukan pengukuran waktu jaringan, render browser atau kuota produksi. Ukuran data, layanan Google dan koneksi masih memengaruhi waktu nyata. Tidak ada perubahan sidebar atau penggabungan halaman menjadi SPA.

## Pengujian pengguna

1. Login sekali, tutup tab aplikasi, lalu buka URL yang sama melalui profil browser yang sama sebelum 4 jam. Beranda seharusnya terbuka setelah pemeriksaan sesi tanpa memilih Google lagi.
2. Buka dua tab, lakukan Log Out di satu tab; tab lain harus terkunci. Login setelah batas 4 jam tetap diperlukan.
3. Uji Admin, Petugas dan Pengajar pada Jenjang/sesi masing-masing; nonaktifkan akun/penugasan lalu pastikan permintaan berikutnya ditolak atau cakupannya diperbarui.
4. Bandingkan pemuatan Beranda, Monitoring dan Rekap JP menggunakan data serta koneksi yang sama. Coba Muat Ulang setelah data berubah; perubahan harus terbaca.
5. Pastikan izin, evaluasi dan penyimpanan lain tetap berjalan. Tidak perlu menunggu 4 jam untuk memverifikasi pencabutan melalui Log Out.

## Verifikasi lokal

351 tes backend lulus: termasuk 8 kasus sesi persisten dan 6 kasus snapshot/read-count baru, serta pengujian kebijakan lama yang disesuaikan dengan pilihan 4 jam. Meliputi cache terhapus, batas waktu tetap, sesi lama, penanda pencabutan, token asing, data/penugasan berubah, pemeriksaan ulang setelah kunci, salinan Date/matriks, pembersihan saat error dan penulisan tanpa snapshot operasional.

Chromium dengan Google tiruan lulus untuk penutupan/pembukaan halaman pada profil yang sama, tab baru, Log Out antar-tab, pergantian akun, 31 menit tanpa keluar, kedaluwarsa 4 jam, penyimpanan diblokir, OAuth/callback, akses/navigasi/sidebar, serta regresi izin/indikator/evaluasi. Pemeriksaan sintaks, ID HTML dan hash sumber dilakukan. Agent tidak mengubah data/deployment Google; hasil penyimpanan browser dan waktu muat pada deployment nyata masih perlu dikonfirmasi pengguna.
