# Presensi ringkas dan bukti Sakit/Izin

Branch `ui/presensi-ringkas-bukti` melanjutkan `63e6a75`. Pengguna sudah mencoba pemasangan presensi manual sebelumnya dan meminta empat penyesuaian tampilan serta bukti opsional. Ketentuan JP tetap sama; menunggu perhitungan berarti Admin perlu menggunakan Hitung JP Sesi, bukan menunggu absen pulang manual.

## Pemasangan

Jika paket presensi manual sebelumnya sudah dipasang, **ganti lengkap tiga file berikut bersama-sama** dari branch ini:

| File | Perubahan |
| --- | --- |
| [Index.html](../Index.html) | Lima kartu satu baris desktop, pencarian nama tunggal, status Hadir/Tidak Hadir, bukti opsional, tombol Presensi dan dialog pilihan |
| [PresensiManual.gs](../PresensiManual.gs) | Validasi/penyimpanan referensi bukti, label Tanpa Keterangan, daftar gabungan izin/sakit tanpa perubahan poin |
| [Akses.gs](../Akses.gs) | Pembatasan tombol Presensi untuk Pengajar dan bukti pada rincian verifikasi sesi |

Buka file di GitHub → **Raw** → salin seluruh isi. Nama dan jenis file tetap; tidak menambah file Apps Script. File lainnya tetap dari paket sebelumnya. Simpan proyek, lalu **Manage deployments → Edit deployment yang sama → New version → Deploy**. Pertahankan URL. Tidak perlu spreadsheet, sheet, kolom, migrasi, atau perubahan manifest baru.

Jika belum memasang paket `63e6a75`, pasang dahulu seluruh dependensi dalam [panduan presensi manual](PRESENSI_MANUAL_MONITORING.md), menggunakan sumber versi terbaru pada branch ini. Snapshot tetap memuat 18 sumber HTML/GS. Tests/docs bukan kode yang ditambahkan ke editor Apps Script.

## Tampilan dan penggunaan

1. Pada desktop, lima kartu ringkasan berada pada satu baris dan memiliki tinggi sejajar. Ponsel/tablet tetap responsif agar teks terbaca; perhitungan ringkasan dan tabel 10 peserta per halaman tetap.
2. Tombol di Ringkasan Sesi menjadi **Presensi**. Klik untuk membuka pilihan **Presensi Manual**, **QR Absensi**, atau **Catat Izin**. Dialog pilihan ditutup sebelum membuka form berikutnya. Pengajar tetap tidak mendapat tindakan pencatatan ini; Admin/Petugas mengikuti kewenangan yang sudah ada.
3. Form manual hanya mempunyai satu kolom **Nama peserta**. Tombol di baris peserta mengisinya langsung. Nama dapat dihapus untuk mencari peserta lain; teks pencarian saja belum dianggap memilih peserta. Tombol melalui Presensi → Presensi Manual selalu membuka kolom kosong. Hasil pencarian mengikuti seluruh peserta aktif sesi/Jenjang, termasuk halaman tabel lain; peserta yang sudah menggunakan QR tetap memakai Koreksi.
4. **Status Kehadiran** memakai dua radio: **Hadir** dan **Tidak Hadir**. Hadir menyediakan **Tepat Waktu / Terlambat**; Tidak Hadir menyediakan **Sakit / Izin / Tanpa Keterangan**. Mengganti kelompok mengosongkan pilihan rinci sebelumnya, sehingga tidak menyimpan kombinasi tersembunyi yang salah. Tanpa Keterangan tetap memakai kode tersimpan `alpa`, agar data/rekap lama kompatibel.
5. Pada Sakit/Izin terdapat **Bukti pendukung (opsional)**: PDF, JPG/JPEG, PNG, maksimal 5 MB. Simpan tanpa bukti tetap boleh. Bukti lama dipertahankan bila mengedit Sakit/Izin tanpa file pengganti; memilih file baru mengganti referensi aktif. Mengubah status menjadi Hadir/Terlambat/Tanpa Keterangan menghapus referensi bukti dari presensi aktif; file dan riwayat lama tetap dipertahankan.

Tidak ada absen pulang manual. Setelah menyimpan, JP tetap menunggu perhitungan Admin. Hadir mendapat durasi efektif, Terlambat manual dipotong tetap 15 menit, dan Sakit/Izin/Tanpa Keterangan mendapat JP 0. Aturan QR serta penilaian tidak diubah.

## Integrasi izin, bukti, dan pengamanan

Database saat ini tidak mempunyai sheet operasional khusus bernama Izin. Catatan izin dengan rentang waktu berada pada Catatan_Perilaku; izin satu sesi manual berasal dari Kehadiran. Tampilan kini **Daftar Izin & Sakit**, menggabungkan catatan izin lama dengan presensi manual Sakit/Izin dan memberi label sumber/status yang jelas. Jumlah izin pada ringkasan/CSV tetap hanya izin; Sakit tidak dihitung sebagai izin.

Lampiran manual menggunakan mekanisme unggah yang sudah ada: folder bukti Drive dan target pasangan `IZIN|id_sesi|id_keikutsertaan`. Ini juga dipakai untuk surat Sakit, tanpa membuat catatan perilaku/izin baru atau pengurangan poin otomatis. Referensi tersimpan pada kolom **Kehadiran.dasar_verifikasi** setelah penanda `PRESENSI_MANUAL_V1`; audit sebelum/sesudah tetap pada **Riwayat_Validasi**. Jadi tidak ada salinan baris absensi atau jurnal perilaku kedua.

Server memeriksa tipe/isi awal/ekstensi/ukuran file, folder, metadata target peserta-sesi, serta file tidak di Sampah menggunakan mekanisme lama. URL bebas dari browser tidak dijadikan bukti. Unggah dan simpan tetap melewati otorisasi serta pemeriksaan ulang akun/Jenjang di bawah lock. Pengajar tidak dapat mengunggah atau menyimpan presensi. Hak berbagi Drive mengikuti mekanisme yang sudah ada; tidak ada berbagi publik otomatis.

Jika unggah terputus, pengulangan memakai ID unggahan yang sama. Jika unggah sudah berhasil tetapi respons simpan presensi terputus, pengulangan memakai payload/ID presensi yang sama dan tidak mengunggah ulang. Menutup form lalu membuka jalur mandiri tetap mengosongkan nama; memilih peserta yang memiliki permintaan belum terkonfirmasi memulihkan drafnya. Sesudah muat ulang, rencana tertunda server tetap dapat dilanjutkan pencatat/Admin. Permintaan lama tanpa field bukti tetap kompatibel. Data/version, QR/manual, verifikasi dan pengamanan transaksi dari paket sebelumnya tetap.

## Pengujian

- **407 pengujian backend lolos**. Tambahan mencakup unggah nyata melalui layanan tiruan, target/folder/Sampah, bukti opsional dan pelestarian/penggantian referensi, QR/JP/poin tetap, Sakit tidak menjadi Izin, verifikasi, serta pemulihan Admin setelah respons tulis terputus.
- Chromium memakai HTML aplikasi terinjeksi sebenarnya dengan layanan Google tiruan: lima kartu satu baris pada desktop 1349 px, pencarian tunggal/prefill/clear/kolom mandiri kosong, radio dan pilihan rinci, unggah gagal/ID tetap, bukti pada Daftar Izin & Sakit, tiga pilihan Presensi, pagination/pencarian/filter, ponsel 390 px dan keyboard.
- Suite login/navigasi/Admin/Petugas serta suite Pengajar/evaluasi sebelumnya juga lolos dengan jalur tombol baru. Seluruh JS/GS diparse, ID HTML unik dan hash 18 sumber diperbarui.

Agent tidak mengubah data Google, deployment, atau main. Uji pada deployment Google tetap diperlukan: unggah surat Sakit/Izin sebagai Petugas, tinjau sebagai Admin, lihat bukti sesuai izin Drive, coba tanpa file, ubah peserta/status, dan bandingkan JP/CSV. Hasil lokal bukan konfirmasi produksi.
