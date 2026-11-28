# Pemeriksaan pemuatan data — 3 November 2026

Pengguna melaporkan **sekitar 2,5 menit untuk review keseluruhan halaman Admin**. Ini adalah durasi alur keseluruhan yang dilaporkan pengguna, bukan waktu satu halaman/RPC. Branch `perf/pemeriksaan-pemuatan-data` melanjutkan `177a606`, setelah nilai akhir diterima. Pemeriksaan dan perbaikan lokal sudah dilakukan; hasil pada deployment Google masih perlu dibandingkan dengan alur pengguna yang sama.

## Pasang tiga file bersama-sama

Ganti seluruh isi **Code.gs, Akses.gs dan Index.html** dari branch ini. File aplikasi lain tetap mengikuti paket nilai akhir yang sudah terpasang. Simpan semua, lalu perbarui **New version pada deployment yang sama**; pertahankan URL. Tidak ada file GS baru, spreadsheet/kolom baru, migrasi atau pemindahan data. `SOURCE_SNAPSHOT.json` tetap mencatat 19 sumber HTML/GS.

## Temuan dan perbaikan

1. **Pustaka QR di bagian head Monitoring sebelumnya menahan parser HTML.** Jika CDN lambat, pembacaan script aplikasi setelahnya ikut tertunda. Script QR kini memakai `async`, sehingga program/tabel dapat dimuat sambil pustaka QR diunduh. Jika tombol Terbitkan ditekan sebelum pustaka tersedia, tidak ada token yang diterbitkan dan pesan meminta mencoba lagi sesaat kemudian. Setelah pustaka tersedia, QR dapat diterbitkan tanpa memuat ulang halaman. Renderer, ukuran QR, aturan token dan presensi tetap sama; tidak menambah layanan eksternal.
2. **Tanggal dan jadwal yang sama dikonversi berulang pada peserta/sesi.** `nilaiHitungBacaan_` menyimpan hanya hasil skalar dalam snapshot baca yang sudah diizinkan, maksimum 2.000 kunci per permintaan. Kunci format memuat epoch, zona dan pola; kunci parse memuat teks lengkap serta zona. Objek Date hasil parse selalu dibuat baru; kesalahan tidak disimpan. Nilai dihapus saat permintaan berakhir dan saat akses diperiksa ulang setelah menunggu lock. Penyimpanan/koreksi/perhitungan JP/ekspor tidak mengaktifkan snapshot baru. Tidak ada cache data/otorisasi lintas permintaan, pemakaian ulang nilai lama setelah koreksi, atau perubahan rumus nilai akhir/JP/perilaku.
3. **Data awal membaca lagi display range Program/Sesi di luar snapshot.** `muatAwalIndex` kini memakai sumber tervalidasi yang sama dengan pembacaan halaman. Fungsi QR publik `ambilDataProgramSesiQR` tetap ada dan tidak diubah. Bentuk hasil data awal, pilihan Jenjang dan pembatasan peran dipertahankan.
4. **Rekap memindai seluruh kehadiran untuk setiap peserta–sesi.** Pembacaan sekarang membuat indeks pasangan peserta–sesi serta kelompok catatan per sesi. Duplikat tetap disimpan sebagai kumpulan dan ditolak sesuai alur lama; catatan yang menunjuk kehadiran peserta lain tetap diperiksa, bukan dibuang diam-diam.
5. **Durasi deployment belum terukur per panggilan.** Bridge menyediakan `window.pelatihanPemuatan.baca()` untuk membaca durasi panggilan pada halaman saat ini. Ini alat pemeriksaan ringan tanpa tombol/alur produk baru; tidak menulis spreadsheet atau mengirim data ke analitik eksternal.

Pemeriksaan identitas, masa login empat jam, pencabutan akun/penugasan, sidebar/navigasi, cakupan Jenjang, grup empat RPC baca dan penanganan error tetap berlaku. Pemanggilan awal masih melalui verifikasi sesi. Kegagalan sumber Rekap tetap memblokir CSV. Tidak ada perubahan SPA, praambil data lintas halaman atau perluasan grup baca ke penulisan/ekspor.

## Hasil lokal yang bisa direproduksi

Data sintetis: 22, 100 dan 500 peserta dalam Jenjang yang diuji; dua sesi, waktu QR berbeda antar peserta dan campuran status manual. Ada Jenjang/program lain untuk memastikan pembatasan tetap berlaku. Tujuh pembacaan Admin diuji: data awal, Beranda, kehadiran, Rekap, Pengelolaan, daftar peserta dan evaluasi Panitia. Sebanyak **21 perbandingan** menegaskan seluruh respons sebelum/sesudah identik menggunakan waktu uji yang sama.

Jumlah pemanggilan konversi `Utilities.formatDate` pada beberapa pembacaan:

| Peserta | Beranda sebelum → sesudah | Kehadiran sebelum → sesudah | Rekap sebelum → sesudah |
| --- | --- | --- | --- |
| 22 | 321 → 43 | 97 → 55 | 696 → 73 |
| 100 | 1.323 → 106 | 427 → 181 | 2.958 → 199 |
| 500 | 6.443 → 426 | 2.107 → 821 | 14.478 → 839 |

Pembacaan nilai/formula range data awal dalam harness turun **12 → 10** per panggilan, termasuk sumber akses. Selain penghapusan dua pembacaan ganda ini, jumlah pembacaan sumber dipertahankan. Jangan menganggap format tanggal sebagai pembacaan spreadsheet.

Waktu CPU Node dengan layanan Google tiruan untuk Rekap tercatat 59 → 25 ms (22 peserta), 217 → 89 ms (100), dan 1.344 → 314 ms (500) pada satu pengambilan hasil. Ini **bukan waktu Apps Script/Google Sheets, ukuran cold start atau jaminan penurunan 2,5 menit**. Waktu lokal kecil berfluktuasi; hasil Pengelolaan/evaluasi tidak menunjukkan penurunan berarti pada semua ukuran. Bukti utama adalah kesetaraan respons dan berkurangnya pekerjaan berulang, bukan janji kecepatan semua halaman.

Hasil lengkap: [JSON perbandingan](../tests/results/pemuatan-audit-2026-11-03.json).

Jalankan dari root repositori:

```bash
node apps-script/absensi-dashboard/tests/benchmark-pemuatan.mjs --base=177a606 --out=/tmp/pemuatan-audit/comparison.json
npm test
python apps-script/absensi-dashboard/tests/browser/pemuatan_audit_browser.py
```

431 pengujian backend mencakup regresi lama serta kesetaraan tujuh respons pada 22/100 peserta, pembatasan cache, zona/pola/tanggal, objek Date independen, kegagalan parse, perubahan jadwal/penugasan, pengosongan snapshot saat recheck dan kesalahan relasi/duplikat. Chromium memakai HTML asli hasil injeksi server dengan layanan Google tiruan: desktop/ponsel, CDN QR sengaja ditahan, tabel 10 baris tetap tampil, QR bisa diterbitkan setelah CDN tersedia, error Rekap tetap memblokir CSV, serta pencatat waktu tidak membocorkan payload. Regresi aplikasi/login/navigasi/peran, evaluasi dan nilai akhir juga diuji. Hasil ini tidak menggantikan pengujian deployment Google.

## Mengukur di deployment Google

1. Setelah tiga file dipasang, gunakan akun Admin dan koneksi yang sama. Ulangi urutan halaman/tindakan yang sebelumnya sekitar 2,5 menit, dengan jumlah peserta/program yang sama. Catat waktu menunggu dan waktu total alur secara terpisah. Lakukan tiga kali, termasuk pembukaan pertama dan pengulangan, agar variasi jaringan/cold start terlihat.
2. Periksa Beranda, Monitoring, Rekap Program, Pengelolaan, Peserta, profil dan Manajemen Akses. Untuk evaluasi, bedakan waktu membuka pilihan Evaluasi dari waktu nilai peserta benar-benar muncul.
3. Jika suatu halaman masih lambat, sebelum berpindah halaman buka DevTools → Console pada **frame aplikasi** (biasanya `userHtmlFrame` pada Apps Script). Jalankan:

```js
console.table(window.pelatihanPemuatan.baca().permintaan)
```

Untuk menyalin hasil pada Chrome/Edge DevTools:

```js
copy(JSON.stringify(window.pelatihanPemuatan.baca(), null, 2))
```

Jika variabel tidak ditemukan, pilih frame aplikasi pada daftar konteks Console, bukan frame pembungkus Google. Pencatat tersedia pada halaman login aplikasi terproteksi; halaman presensi QR publik tidak menggunakannya.

Setiap entri hanya memuat nama transport/tindakan, durasi milidetik dari pemanggilan sampai respons di browser, dan status berhasil. Grup dengan satu anggota gagal diberi status tidak berhasil. Tidak ada token, email, ID/nama/NIP peserta, argumen, nilai penilaian, respons atau isi error. Maksimal 100 entri, hanya di memori halaman; berpindah/muat ulang halaman menghapus catatan. Hasil baca berupa salinan, bukan akses ke buffer internal.

`data_awal_ms` adalah waktu dari awal script bridge sampai respons data awal diterima, **bukan sampai semua bagian halaman selesai dirender**. Durasi RPC mencakup jaringan, antrean dan eksekusi server sekaligus; tidak memisahkannya. Jangan menjumlah semua durasi menjadi waktu halaman karena beberapa panggilan berjalan paralel. Waktu unduh HTML/pembungkus Google sebelum script berjalan juga tidak masuk angka ini.

Pastikan sesudah pemasangan: total/rincian/CSV/nilai akhir tetap sama, Muat Ulang menampilkan perubahan terbaru, login/peran tetap benar, dan presensi manual/QR tetap dapat dipakai. Laporkan hasil waktu ulang serta catatan halaman yang masih lambat untuk menentukan apakah hambatan tersisa ada pada Apps Script, pembacaan sumber, konversi/hasil besar atau jaringan. Tidak ada data atau deployment Google yang diubah oleh agent.
