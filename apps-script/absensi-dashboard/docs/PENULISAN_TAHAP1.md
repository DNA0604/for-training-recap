# Tahap 1 — jalur tulis lebih ringan — 18 November 2026

Melanjutkan branch **fix/akses-tombol-login**. Branch yang disarankan untuk paket ini: **perf/penulisan-tahap1**. Cakupan hanya **Code.gs**: cara aplikasi memverifikasi dan menulis saat **menambah program, menambah sesi, dan mengimpor peserta**. Tampilan, aturan akses, skema sheet, ID, rumus nilai/JP, dan kontrak `google.script.run` tidak berubah.

## Pasang satu file

Ganti **seluruh isi `Code.gs`** di Apps Script dengan `Code.gs` dari paket ini. Tidak ada file GS/HTML baru, kolom baru, migrasi, atau perubahan manifest. Simpan, lalu **Deploy → Manage deployments → Edit → New version** pada deployment yang sama; alamat aplikasi tidak berubah.

Sebelum mengganti, simpan salinan `Code.gs` lama (atau catat nomor versi deployment saat ini) agar mudah dikembalikan. Untuk kembali: tempel `Code.gs` lama lalu buat New version lagi, atau pilih versi lama pada Manage deployments.

## Apa yang diubah

1. **Verifikasi setelah penulisan membaca tiap sheet sekali.** Sebelumnya `verifikasiWriteKelola_` membaca seluruh sheet dua kali untuk *setiap* baris yang ditulis. Sekarang `verifikasiBanyakWriteKelola_` membaca satu kali per sheet lalu mencocokkan lewat indeks ID di memori. Pesan galat dan aturan pencocokan sama. `verifikasiWriteKelola_` tetap ada sebagai pembungkus untuk pemanggil lain (pemulihan, tambah indikator).
2. **Tambah program/sesi (`pembuatanKelola_`).** Header setiap sheet tujuan dibaca sekali (bukan dua kali per baris). Penulisan tetap berurutan per kelompok sheet: induk (mis. Sesi) ditulis dan diverifikasi sebelum anak (Jeda_Sesi) ditambahkan. `flush()` turun dari satu per baris menjadi satu per kelompok.
3. **Impor peserta.** Registri peserta yang baru dibaca pada batch baru dipakai ulang untuk preflight (batch ulang/retry tetap membaca ulang). Pemeriksaan "baris sudah ada" memakai tabel itu, bukan membaca sheet per baris. Kolom Jenjang dicari sekali per batch, bukan per peserta. Verifikasi akhir satu kali untuk seluruh batch.
4. **Pemulihan pembuatan sesi** memakai verifikasi satu kali yang sama.

## Perbedaan perilaku kecil

- Jika verifikasi sebuah kelompok gagal, kelompok berikutnya tidak ditulis (induk-lalu-anak tetap terjaga). Beberapa baris dalam satu kelompok sheet yang sama (mis. beberapa jeda) kini ditulis bersama lalu diverifikasi bersama.
- Bila beberapa masalah muncul sekaligus pada retry impor, urutan pesan galat yang tampil pertama bisa berbeda. Tidak ada data yang ditulis pada kasus galat.
- Rencana impor yang menyebut sheet selain Peserta/Keikutsertaan kini ditolak dengan pesan jelas.

## Bukti lokal

Data sintetis 22/100/500 peserta, layanan Google tiruan. **18 perbandingan menghasilkan respons dan isi sheet yang identik** dengan versi sebelumnya. Angka berikut adalah hitungan pembacaan sheet dan sel pada layanan tiruan, **bukan waktu Google**. Setiap skenario impor memuat pratinjau + simpan.

| Aksi | Pembacaan sheet (22 peserta) sebelum → sesudah | Sel dibaca (500 peserta) sebelum → sesudah |
| --- | --- | --- |
| Tambah program | 52 → 48 | 48.507 → 48.392 |
| Tambah sesi + 3 jeda | 68 → 55 (`flush` 6 → 4) | 53.145 → 52.751 |
| Impor 1 peserta | 81 → 67 | 110.789 → 78.423 |
| Impor 5 peserta | 125 → 67 | 212.621 → 78.479 |
| Impor 10 peserta | 180 → 67 | 341.171 → 78.549 |
| Impor 20 peserta | 290 → 67 | 602.471 → 78.689 |

Impor kini tidak bertambah berat per peserta. Tambah program/sesi hampir tidak berubah: sisa biayanya ada pada otorisasi per panggilan dan validasi integritas seluruh data, yang termasuk Tahap 2–3 dan belum dikerjakan.

**451 pengujian backend lulus** (445 sebelumnya + 6 baru di `penulisan-tahap1.test.mjs`): jumlah pembacaan tidak bertambah menurut jumlah baris impor, batch selesai idempoten, verifikasi gagal lalu retry tidak menggandakan peserta, retry setelah penulisan sebagian hanya melengkapi baris yang hilang, sesi dengan beberapa jeda tersimpan lengkap, serta pembuatan program menulis Program dan Jenjang pertama tepat sekali. Tes pembacaan gagal pada `Code.gs` lama sehingga benar-benar mendeteksi perbedaan.

Jalankan dari root repositori:

```bash
npm test
node apps-script/absensi-dashboard/tests/benchmark-penulisan-tahap1.mjs --base=<hash commit sebelum paket ini>
```

## Yang belum diuji

Tidak ada tes browser (HTML tidak berubah), tidak ada pengujian di deployment Google, dan tidak ada pengukuran waktu nyata. Mohon uji setelah dipasang, dengan akun Admin:

1. Tambah satu program baru; pastikan muncul di daftar dan di sheet Program/Jenjang.
2. Tambah satu sesi dengan 2–3 jeda; pastikan sesi dan semua jeda tampil benar.
3. Impor 5–20 peserta dari berkas; pastikan jumlah baru/terdaftar/dilewati sesuai pratinjau dan tidak ada peserta ganda.
4. Cek sheet Riwayat_Validasi: setiap transaksi berakhir dengan status SELESAI.
5. Catat waktu tiap aksi (sebelum/sesudah) dan, bila perlu, `console.table(window.pelatihanPemuatan.baca().permintaan)` pada frame aplikasi.

## Berikutnya (menunggu persetujuan)

Tahap 2–3 menyentuh aturan proyek (cache otorisasi dengan penanda versi, pembacaan per kolom, memindahkan validasi integritas dari jalur harian) dan tidak termasuk dalam paket ini.

`SOURCE_SNAPSHOT.json` diperbarui untuk Code.gs dan Akses.gs (hash Akses.gs sudah berbeda sejak branch fix/akses-tombol-login).
