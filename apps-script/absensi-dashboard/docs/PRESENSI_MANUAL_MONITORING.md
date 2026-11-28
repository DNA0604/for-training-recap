# Presensi manual, Absensi & Izin, dan tabel Monitoring

Branch `feat/presensi-manual-monitoring` melanjutkan `28e0415` (perataan paragraf laporan). Ketentuan presensi manual telah dikonfirmasi pengguna pada 2 November 2026. Implementasi dan pengujian di repository selesai; pengujian deployment Google masih diperlukan.

## Pemasangan melalui GitHub

Buka file lengkap dari branch ini, pilih **Raw**, lalu salin seluruh isinya. Tambahkan **Script** baru `PresensiManual.gs` dan ganti lengkap tujuh file berikut **bersama-sama**:

| File | Jenis | Perubahan |
| --- | --- | --- |
| [PresensiManual.gs](../PresensiManual.gs) | Script baru | Aturan manual, simpan/audit/pemulihan, izin satu sesi dari Kehadiran |
| [Code.gs](../Code.gs) | Script pengganti | QR/manual terpisah; Monitoring, JP, rekap, CSV, profil dan Beranda |
| [Akses.gs](../Akses.gs) | Script pengganti | Otorisasi, verifikasi sesi, referensi/hasil baca dalam satu permintaan |
| [Jenjang.gs](../Jenjang.gs) | Script pengganti | Pembacaan struktur Jenjang dalam satu permintaan |
| [Index.html](../Index.html) | HTML pengganti | Card Absensi & Izin, modal manual, status jelas, tabel tetap dan 10 peserta per halaman |
| [Profil.html](../Profil.html) | HTML pengganti | Keterangan dasar kehadiran QR/manual |
| [Laporan.gs](../Laporan.gs) | Script pengganti | Ringkasan Sakit/Izin/Alpa terpisah dari data belum tercatat |
| [LaporanTampilan.gs](../LaporanTampilan.gs) | Script pengganti | Keterangan manual, tabel dan grafik laporan yang sesuai sumber |

File lainnya tetap memakai versi terakhir. Paket aktif berjumlah **18 HTML/GS**, dicatat dalam SOURCE_SNAPSHOT.json. Folder tests/docs/previews bukan kode yang dipasang ke Apps Script. Tidak perlu spreadsheet, sheet, kolom, migrasi, atau manifest baru. Jangan mengganti manifest/scopes proyek yang sudah berjalan.

Simpan seluruh file. Untuk `/exec`, **Manage deployments → Edit deployment yang sama → New version → Deploy**. Pertahankan URL agar QR lama tetap memakai alamat deployment yang sama. Agent tidak melakukan deployment atau mengubah data Google.

## Aturan dan cara menggunakan

Pada Monitoring, pilih Program, Jenjang dan Sesi. Card **Absensi & Izin** di Ringkasan Sesi memuat **Presensi Manual**, **QR Absensi**, dan **Catat Izin**. Admin dan Petugas yang ditugaskan boleh mencatat manual; Pengajar tetap hanya membaca kehadiran. Presensi manual tersedia sejak sesi dimulai menurut jadwal.

Form memilih satu peserta dan status satu sesi, dengan keterangan opsional. Tidak ada status bawaan dan tidak otomatis menandai seluruh peserta alpa. Pencarian form menjangkau seluruh peserta sesi, termasuk peserta di halaman tabel lain.

| Status manual | Menit/JP diakui |
| --- | --- |
| Hadir (tepat waktu) | Durasi efektif sesi ÷ 45 |
| Terlambat | Maksimum(0, durasi efektif − 15 menit) ÷ 45 |
| Sakit | 0 |
| Izin satu sesi | 0 |
| Alpa | 0 |

Jeda tidak dihitung sebagai durasi efektif. Catatan izin sebagian sesi yang sudah ada tetap mengikuti aturan pengurangan JP yang berlaku, dengan interval jeda/izin digabung agar tidak dipotong dua kali. Sesi tanpa JP tetap tidak memberikan JP. Potongan tetap 15 menit hanya untuk **manual**; QR tetap memakai toleransi datang 10 menit dan durasi datang/pulang sebenarnya. Nilai durasi keterlambatan aktual manual tetap kosong: 15 menit adalah kebijakan potongan, bukan waktu keterlambatan yang diobservasi.

Simpan manual mengosongkan hasil JP lama dan menandainya menunggu perhitungan. Admin menggunakan **Hitung JP Sesi**, lalu memuat ulang Rekap. Petugas tetap menggunakan **Ajukan Verifikasi** per sesi/Jenjang; Admin meninjau status manual dan keterangannya, lalu menyetujui atau menolak paket yang sama. Status manual Sakit/Izin/Alpa merupakan pencatatan lengkap tentang ketidakhadiran, bukan kehadiran atau kelulusan.

Manual tidak menulis Catatan_Perilaku atau memberi/mengurangi poin otomatis. Catatan perilaku/izin lama yang sudah ada tetap mengikuti aturan dan keputusan validasinya; tidak dibatalkan otomatis. Catat Izin tetap tersedia untuk izin berdasarkan rentang waktu dan bukti; gunakan status manual Izin untuk ketidakhadiran satu sesi. Daftar Izin menampilkan kedua sumber dengan label terpisah, tanpa menggandakan catatan perilaku.

## Sumber data dan pengamanan

Tetap satu sumber **Kehadiran** di spreadsheet utama, satu baris per peserta-sesi. Manual memakai `metode_input=manual_status_v1` dan `status_kehadiran=manual_hadir/manual_terlambat/manual_sakit/manual_izin/manual_alpa`. Semua kolom waktu datang/pulang asli maupun terverifikasi tetap kosong. Keterangan disimpan pada kolom alasan yang sudah ada; perhitungan diberi dasar `JP_MANUAL_STATUS_V1`.

QR dan manual boleh dipakai peserta berbeda dalam sesi yang sama. Untuk peserta yang sudah memiliki presensi QR/pencatatan waktu, gunakan koreksi waktu; manual tidak menimpa scan. Sebaliknya, QR baru ditolak jika peserta itu sudah memakai manual. Log QR diterima yang ringkasannya belum selesai juga menghalangi manual, agar retry QR dapat dipulihkan dengan benar.

Server memeriksa sesi/peran/Jenjang, peserta aktif, duplikasi, versi sumber dan akun aktif kembali di bawah ScriptLock. Identitas pencatat berasal dari sesi server. Perubahan diaudit pada Riwayat_Validasi (PENDING → SELESAI), dengan rencana sebelum/sesudah dan ID permintaan tetap. Tidak ada perubahan data Google saat memasang file; baris baru dibuat hanya setelah pengguna menyimpan.

Jika respons simpan terputus, **Coba Lagi / Lanjutkan** memakai payload dan ID yang sama. Menutup modal mempertahankan draf tersebut. Setelah memuat ulang halaman/tabel, draf transaksi yang benar-benar tertunda dapat dibuka melalui **Lanjutkan Presensi** oleh pencatat atau Admin. Admin yang melanjutkan dicatat dalam alasan audit pemulihan; pencatat asal tetap tersimpan. Permintaan baru, QR, izin yang mengubah baris, verifikasi sesi dan rekap terkait tidak boleh melewati transaksi belum selesai. Data yang diubah langsung di spreadsheet di luar rencana tidak ditimpa. Jangan mengubah status audit manual menjadi SELESAI untuk melewati pemeriksaan.

## Dampak pada ringkasan dan laporan

- Monitoring menampilkan hadir lengkap, tidak hadir tercatat, belum absen, dan perlu diperiksa secara terpisah. Ringkasan sesi selalu menghitung seluruh peserta, bukan hanya halaman yang terlihat.
- CSV jumlah kehadiran mencakup Hadir/Terlambat manual; keterlambatan manual dihitung sebagai kejadian yang ditandai petugas. Izin satu sesi manual masuk jumlah izin hanya sesudah terverifikasi, tetap satu kali per sesi bersama izin lama yang disetujui. Catatan positif/negatif tidak bertambah hanya karena status manual.
- Profil, Beranda dan laporan membedakan Sakit/Izin/Alpa dari data absensi yang belum diketahui. JP 0 yang sudah dihitung untuk ketidakhadiran dapat memiliki rekap data lengkap; itu bukan keputusan lulus.
- PDF menyajikan kategori ketidakhadiran manual dan menjelaskan potongan manual. Template, sampul, batas grafik, tiga rubrik evaluasi serta pembatasan Admin/program selesai tetap. Laporan diblokir jika ada presensi manual tertunda pada program tersebut.

## Pemuatan dan pagination

Tabel peserta berisi paling banyak **10 baris per halaman**, dengan **Sebelumnya/Selanjutnya**, scroll tabel tersendiri, tinggi tetap (620 px desktop/480 px ponsel) dan header tabel melekat saat scroll. Pencarian/filter diterapkan pada seluruh roster sebelum dibagi halaman. Pergantian halaman tidak membuat RPC tambahan. Seluruh roster sesi tetap dikirim satu kali oleh server; ini belum merupakan pagination data di server atau pemisahan spreadsheet.

Pada allowlist baca yang sudah ada, referensi sheet dan hasil parsing disimpan hanya selama satu permintaan. Salinan data/Date tidak dapat mengubah snapshot permintaan. Pemeriksaan hak akses tetap hidup pada setiap RPC; snapshot dibuang saat keluar dan sebelum pemeriksaan ulang di bawah lock. Mutasi, ekspor dan izin tidak ditambahkan ke allowlist pembacaan kelompok. Sesi login empat jam dan animasi sidebar tidak berubah.

Pengukuran lokal menggunakan fixture dan otorisasi Petugas yang sama, dengan cache baru dimatikan/dihidupkan:

| RPC | Pemanggilan getSheetByName tanpa/dengan cache baru |
| --- | --- |
| muatAwalIndex | 22 → 12 |
| muatKehadiranIndex | 40 → 14 |
| muatBerandaIndex | 41 → 13 |

Jumlah baca matriks tidak bertambah dalam perbandingan ini; perbaikan sebelumnya sudah membatasi pembacaan sumber sekali per permintaan. Angka di atas merupakan jumlah pemanggilan metode pada simulasi, bukan jumlah perjalanan jaringan atau ukuran waktu Google. Tidak ada janji bahwa pemuatan menjadi instan; Spreadsheet/Apps Script masih membaca roster dan sumber operasional yang diperlukan.

## Verifikasi dan uji deployment

- `npm test`: **400 pengujian backend lolos**. Termasuk lima status/JP, batas sesi pendek, jeda/izin, pemulihan sebelum/sesudah tulis/receipt, stale data, scope Jenjang, Pengajar ditolak, pencabutan akun di bawah lock, QR/manual, verifikasi, CSV, profil, laporan dan cache per permintaan.
- Chromium dengan HTML injeksi sebenarnya dan layanan Google tiruan: suite login/navigasi/verifikasi, suite Pengajar/Admin/Petugas/evaluasi, serta suite baru 23 peserta/10 per halaman, pencarian lintas halaman/filter tanpa RPC, tinggi/scroll/header, modal, draft, busy/same-ID retry dan ponsel lolos.
- Semua inline JS/GS diparse; ID HTML unik dan hash 18 sumber diperbarui. Pratinjau PDF lokal dengan fixture manual mencakup 2/13 peserta; layanan konversi Google tetap harus diuji tersendiri.

Pada salinan/uji deployment Google, periksa kelima status dan bandingkan JP dengan jadwal/jeda. Coba QR dan manual pada peserta berbeda; pastikan peserta yang sama tidak mendapat baris ganda. Ajukan/setujui paket sebagai Petugas/Admin, periksa Daftar Izin, Rekap, CSV, profil serta PDF. Coba 11+ peserta, pencarian peserta halaman akhir dan tinggi tabel ponsel. Bandingkan waktu Muat Ulang beberapa kali dengan jumlah baris yang sama; pisahkan waktu data utama dari pemuatan riwayat. Hasil lokal bukan konfirmasi bahwa deployment pengguna sudah diuji.
