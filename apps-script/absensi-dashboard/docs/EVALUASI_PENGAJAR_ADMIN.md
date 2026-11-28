# Evaluasi Pengajar oleh Admin

Branch **feat/evaluasi-pengajar-admin**, 30 Oktober 2026, Asia/Jakarta. Melanjutkan a038cd7 (aplikasi a8f9e16 yang rekap spreadsheet-nya diterima pengguna).

## Ketentuan yang disepakati

Admin menilai Pengajar **per sesi**, dengan lima aspek:

1. Penguasaan materi.
2. Kejelasan penyampaian.
3. Penggunaan metode dan media pembelajaran.
4. Interaksi serta respons terhadap peserta.
5. Kedisiplinan waktu.

Skala angka bulat **1–5**: Sangat kurang, Kurang, Cukup, Baik, Sangat baik. Catatan evaluasi opsional maksimal 2.000 karakter. Kelima aspek wajib lengkap sebelum disimpan. Nilai kosong tetap Belum dinilai. Tidak ada persentase, bobot, rata-rata atau nilai akhir otomatis; persentase pada draf pembahasan lama tidak diterapkan.

Pengajar dan Petugas Kelas tidak dapat membaca, mengisi atau mengubah evaluasi Pengajar. Penilaian enam aspek **Pengajar terhadap peserta** tetap menjadi fitur terpisah.

## Pemasangan setelah paket rekap spreadsheet terpasang

1. Ganti seluruh isi **Evaluasi.gs dan Akses.gs** dari branch ini secara bersamaan. Semua HTML, Code.gs dan Script lain tetap memakai versi sebelumnya.
2. Simpan, lalu Manage deployments → Edit deployment yang sama → New version → Deploy. Pertahankan URL, manifest/scopes, OAuth dan konfigurasi spreadsheet.
3. Masuk sebagai Admin, buka **Monitoring**, pilih sesi, lalu tekan **Evaluasi Pengajar** di Ringkasan Sesi, setelah Lihat Evaluasi Peserta.

Tidak perlu Script, spreadsheet atau ID file baru dan tidak perlu setup ulang. Tab jurnal baru dibuat pada penyimpanan valid pertama. File penilaian lama yang baru memiliki Pengajar_Sesi dan Evaluasi_Peserta tetap dapat dipakai; membaca modal saja tidak menulis nilai/jurnal baru.

## Alur penggunaan

- Formulir otomatis menampilkan Program, Jenjang, sesi dan Pengajar dari penugasan sesi, bukan input nama bebas.
- Jika sesi belum memiliki Pengajar, isian/simpan dinonaktifkan. Tetapkan melalui Pengelolaan → Pengajar Sesi; riwayat lama tetap dapat dibaca ketika penugasan dilepas.
- Pilih lima nilai, tambahkan catatan bila diperlukan, lalu Simpan Evaluasi Pengajar. Tombol X dan simpan berada di luar area formulir yang bergulir; draft meminta konfirmasi sebelum ditinggalkan.
- Admin bisa melanjutkan penilaian sesi yang sudah selesai dan Pengajar yang akunnya nonaktif selama penugasan sesi masih tercatat. Status akun mengatur akses login; penonaktifan tidak menghapus riwayat atau menghalangi evaluasi pelatihan yang telah berlangsung.
- Satu pasangan sesi/Pengajar memiliki satu penilaian terkini bersama untuk para Admin. Perubahan menyimpan nilai sebelum/sesudah, Admin dan waktu, bukan membuat nilai akhir terpisah per Admin.
- Jika Admin lain mengubah penilaian atau sesi/penugasan berubah, simpan dari versi lama ditolak. Muat ulang, periksa nilai/sumber lalu simpan kembali. Nilai dari sumber yang berubah diberi penanda; tidak diubah otomatis.
- Jika respons terputus, isian terkunci dan Simpan mengulang **ID serta payload yang sama**. Muat Ulang memeriksa hasil terbaru; jangan membuat permintaan baru untuk hasil yang belum pasti.
- Riwayat memperlihatkan paling banyak 50 perubahan/penilaian sebelumnya pada sesi yang dipilih, termasuk penilaian Pengajar lama. Semua event tetap disimpan pada jurnal; jumlah riwayat total ditampilkan.

## Penyimpanan dan rekap

File penilaian yang sudah terhubung mendapat tab **Evaluasi_Pengajar**, jurnal append-only dengan skema event yang sama (ID event/permintaan/signature/sesi/payload/pelaku/waktu). Rubrik diberi versi pengajar-sesi-v1. ID Pengajar berasal dari penugasan; ID/nama/email Admin berasal dari sesi terverifikasi, bukan isian browser. Lima nilai divalidasi pada server. Audit sebelum/sesudah tetap ada ketika penilaian diubah.

Setelah menyimpan, gunakan **Manajemen Pelatihan → Rekap Penilaian Terpadu → Perbarui Rekap Spreadsheet**, atau tombol pembaruan pada modal Lihat Evaluasi Peserta. Rekap tetap **manual**, mencakup seluruh program. Tab baru **Rekap_Evaluasi_Pengajar** menampilkan identitas program/Jenjang/sesi/Pengajar, lima skor, catatan, Admin penilai, waktu, status sumber dan riwayat. Pembaruan berikutnya tidak menggandakan baris.

Sesi tanpa nilai tetap ditampilkan dengan kolom skor kosong. Pergantian Pengajar memberi penilaian kosong kepada Pengajar baru; nilai lama menjadi riwayat dan tidak digunakan sebagai pengganti. Penghapusan sesi/program pada database operasional tidak menghapus jurnal penilaian di file terpisah; rekap menandainya sebagai sumber tidak tersedia dan mempertahankan snapshot identitas/nilai.

Tab rekap lama tetap ada. File penilaian kini dapat berisi tiga tab jurnal serta lima tab keluaran rekap (empat tab data dan Status_Rekap_Penilaian). Batas snapshot/status gagal dan kepemilikan tab tetap mengikuti [panduan rekap](REKAP_PENILAIAN_SPREADSHEET.md). Bila ada tab bernama Evaluasi_Pengajar dengan struktur lain, aplikasi berhenti tanpa menimpanya; ubah nama tab tersebut sebelum mencoba fitur ini. Tab kosong akibat inisialisasi terputus dapat dilanjutkan pada simpan berikutnya.

Tidak ada perubahan sumber catatan Admin/Petugas, nilai peserta, kehadiran, rumus JP, role, masa login atau animasi sidebar. Belum ada kolom CSV/PDF baru untuk evaluasi Pengajar; belum ada finalisasi atau penguncian nilai akhir.

## Pemeriksaan setelah deployment

1. Admin membuka sesi bertugas dan mengisi lima nilai; cocokkan hasil setelah Muat Ulang.
2. Coba isian belum lengkap: penyimpanan harus ditahan. Coba X dengan draft: Batal mempertahankan isian.
3. Ubah catatan/nilai dan periksa riwayat Admin/waktu/nilai sebelumnya.
4. Buka sebagai Pengajar/Petugas: tombol dan data evaluasi Pengajar tidak tersedia. Nilai peserta tetap dapat diisi Pengajar sesuai sesi tugasnya.
5. Ganti Pengajar pada sesi dummy: Pengajar baru belum dinilai, riwayat Pengajar lama masih ada.
6. Perbarui rekap; cocokkan Rekap_Evaluasi_Pengajar dan pastikan nilai peserta/JP/catatan tetap seperti sebelumnya.

**283 tes backend** lulus (17 kasus baru). Chromium memakai HTML aktual dengan Google tiruan pada desktop/390 px: visibilitas tiga peran, validasi lima aspek, draft/X, simpan/response terputus/retry identik, header/footer dan scroll, riwayat dengan teks aman, sesi belum ditugaskan serta regresi enam aspek/rekap. Suite aplikasi login/navigasi/sidebar/verifikasi dan direktori/panel pemilik juga lulus. Source/generated scripts serta ID HTML diperiksa. Pengujian lokal ini belum membuktikan izin, kuota, format spreadsheet atau deployment Google nyata. Agent tidak menulis file Google, mengubah deployment atau menggabungkan main.

Pratinjau dengan data sintetis: [desktop](../preview/evaluasi-pengajar-admin/Desktop.png) dan [ponsel](../preview/evaluasi-pengajar-admin/Mobile.png).
