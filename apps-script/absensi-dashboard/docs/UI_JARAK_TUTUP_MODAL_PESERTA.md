# Perapian jarak, tombol X dan Program → Jenjang

**4 November 2026, Asia/Jakarta.** Pengguna meminta implementasi setelah menerima [audit UI](AUDIT_UI_2026-11-04.md). Branch **ui/jarak-tutup-modal-peserta** melanjutkan **61ebc38** dan paket pemuatan **96671c9**. Hasil pemeriksaan lokal di bawah belum merupakan penerimaan deployment Google oleh pengguna.

## Pemasangan

Ganti seluruh isi tujuh file berikut bersama-sama dari branch yang sama melalui GitHub Raw:

1. **Index.html**
2. **Pengelolaan.html**
3. **Peserta.html**
4. **Profil.html**
5. **ManajemenAkses.html**
6. **Akses.gs**
7. **Evaluasi.gs**

Simpan semua sebelum memperbarui **New version pada deployment yang sama**. Pertahankan URL deployment. Tidak ada file Apps Script, sheet, kolom atau migrasi baru; jumlah sumber aplikasi tetap 19. Jangan memasang tests/docs sebagai file aplikasi.

Jika paket pemeriksaan pemuatan sebelumnya belum terpasang, ganti juga **Code.gs** dari branch ini agar tiga file paket pemuatan (`Code.gs`, `Akses.gs`, `Index.html`) lengkap. Code.gs tidak diubah oleh pekerjaan UI ini. File perhitungan nilai akhir/laporan lain mengikuti paket sebelumnya.

## Perubahan yang terlihat

- Kelompok tindakan, pagination, tombol form/evaluasi/verifikasi, tombol template/tambah data dan tindakan Manajemen Akses memakai jarak **12 px**, termasuk saat tombol membungkus di ponsel. Tab tersegmentasi dan jarak ikon–teks/sidebar tetap mengikuti desain masing-masing.
- Kelompok kartu statistik/layout memakai 12 px. Card **Jenjang Program → Program & Sesi** di Pengelolaan yang sebelumnya menempel kini berjarak **12 px**; tumpukan card terkait pada Pengelolaan/Peserta juga diselaraskan tanpa menjumlahkan margin dan gap secara berlebihan.
- Semua dialog pada enam halaman Admin yang dicakup audit memiliki satu X: tombol **44 × 44 px**, ikon SVG **20 × 20 px**, sudut 12 px, label aksesibel dan fokus keyboard. Tombol Tutup yang sudah berada pada header memakai ID/handler lama dengan tampilan X. Dialog yang hanya memiliki pembatalan di footer mendapat X baru pada header.
- X baru meneruskan klik ke tombol Batal/Tutup lama. Keadaan disabled mengikuti kontrol lama, sehingga penguncian penyimpanan, konfirmasi pembatalan, pembersihan konteks dan ID retry tetap melalui alur lama. Pada konfirmasi penghapusan, X setara **Batal**, tanpa RPC hapus.
- Header modal panjang tetap terlihat saat digulir; latar putih menutup konten yang lewat di belakangnya. Judul panjang dapat membungkus, X tetap di kanan atas. Modal evaluasi mempertahankan scroll tabel terpisah dan pemeriksaan draft yang sudah ada.
- Pada Peserta, urutan menjadi **Program Tujuan → Jenjang Tujuan / Filter Peserta**. Jenjang nonaktif dengan petunjuk memilih Program jika Program kosong, termasuk ketika Program dikosongkan kembali. Satu Jenjang tetap dipilih otomatis; beberapa Jenjang tetap menawarkan “Semua Jenjang (lihat)”. Pergantian Program membuang pilihan Jenjang lama. Penguncian impor/simpan dan pembatasan penugasan tetap berlaku.

Form tetap menyediakan tindakan Batal yang diperlukan; card utama halaman tidak diberi X untuk menyembunyikan fitur. Tidak ada perubahan peran, RPC, data, nilai, JP, QR, login empat jam, rumus laporan atau animasi/navigasi sidebar.

## Cara implementasi untuk maintenance

Lima HTML di atas memiliki blok `ui-consistency` untuk ukuran/spacing yang sama, termasuk jalur pemilik tanpa bridge login. Akses.gs membawa aturan yang sama untuk dialog dinamis, termasuk koreksi lama pada Beranda, serta membuat X pada dialog koreksi/verifikasi. Evaluasi.gs memakai kelas X yang sama dan gap tindakan 12 px.

Kontrol baru yang merujuk pembatalan lama menggunakan `data-close-target`. Listener lokal meneruskan klik dan MutationObserver yang hanya mengamati atribut disabled menjaga keadaan X. Tidak ada observer seluruh data/tabel, panggilan server tambahan, atau pengubahan data dari helper ini. Kontrol header lama tetap menggunakan ID serta listener aslinya. Pada Peserta, field Program dibungkus `participantProgramField`; penyesuaian teks untuk Petugas di Akses.gs mengikuti selector baru tersebut.

## Verifikasi lokal

- **431 pengujian backend lulus** untuk perilaku/peran/nilai/presensi yang sudah ada. Pekerjaan ini tidak menambah rumus backend baru.
- Chromium pada **1361 px dan 390 px** memeriksa **66 kemunculan dialog** (33 per ukuran): tepat satu X aksesibel 44×44 dan ikon 20×20 pada setiap dialog, termasuk dialog yang dihasilkan server.
- Jarak dua card Pengelolaan terukur 12 px pada kedua ukuran. Kelompok tindakan diperiksa 12 px; Program/Jenjang diuji dari kosong → beberapa Jenjang → satu Jenjang pada program lain → kosong kembali.
- X form peserta/perilaku/izin diuji tanpa penulisan server; X baru mengikuti disabled tombol pembatalan lama. Konfirmasi hapus indikator dibuka melalui alur sebenarnya lalu dibatalkan dengan X, mempertahankan alasan tanpa memanggil hapus. Modal panjang/judul panjang diuji pada ponsel agar X tetap dapat dijangkau saat scroll.
- Regresi Chromium aplikasi/login/sidebar/navigasi/peran, Jenjang, evaluasi Pengajar/Panitia, presensi manual/bukti/pagination serta nilai akhir/CSV tetap lulus dengan layanan Google tiruan. Pengukuran sticky header pada uji presensi dilakukan dalam satu pembacaan DOM supaya transisi sidebar yang berjalan tidak membandingkan dua frame berbeda.
- Sumber GS/script HTML dan halaman hasil injeksi diparse, ID HTML diperiksa unik, SOURCE_SNAPSHOT diperbarui. Tidak ada Google data/deployment atau branch main yang diubah.

Jalankan pemeriksaan terkait dari root repositori:

```bash
npm test
python apps-script/absensi-dashboard/tests/browser/ui_consistency_browser.py
python apps-script/absensi-dashboard/tests/browser/sesi_akses_browser.py
python apps-script/absensi-dashboard/tests/browser/pengajar_browser.py
python apps-script/absensi-dashboard/tests/browser/presensi_manual_browser.py
python apps-script/absensi-dashboard/tests/browser/nilai_akhir_browser.py
python apps-script/absensi-dashboard/tests/browser/jenjang_browser.py
```

Setelah dipasang di Google, periksa tiga hal yang diminta: jarak card/tombol, X seluruh modal pada desktop/ponsel dan urutan/disabled Program–Jenjang. Coba juga proses simpan yang sedang berjalan dan draft evaluasi untuk memastikan penutupan tetap mengikuti peringatan sebelumnya. Paket UI ini tidak menyatakan audit pemuatan 2,5 menit sudah diterima; pengukuran deployment itu tetap pekerjaan terpisah.
