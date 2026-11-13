# Konsep, naskah dan storyboard video promosi

Konsep yang disetujui: **Satu Perjalanan Pelatihan, dari Persiapan hingga Evaluasi**. Video ditujukan kepada pimpinan, pegawai pengelola dan stakeholder termasuk dosen/teman pengguna. Tujuannya agar penonton memahami konsep dashboard, merasakan pengalaman penggunaan, dan melihat manfaat jangka panjangnya.

## Draf untuk ditinjau

**[Unduh Draf_Naskah_Storyboard.docx](https://github.com/DNA0604/for-training-recap/blob/docs/intro-tiga-logo/apps-script/absensi-dashboard/video-promosi/Draf_Naskah_Storyboard.docx?raw=true)**

Versi 0.2 berisi **9 bagian, 26 rencana tampilan dan 419 kata narasi**, termasuk intro logo sekitar delapan detik. Alokasi saat ini **4 menit 8 detik**, dengan kelonggaran hingga 4 menit 20 detik sesuai arahan pengguna. Word memakai teks dan tabel yang dapat disunting; 11 halaman pada pemeriksaan tata letak lokal. Ini storyboard tertulis dengan uraian visual/interaksi, teks layar, transisi dan catatan produksi. Belum ada animatic, rekaman suara, musik terpilih atau film final.

- [Baca naskah dan storyboard di GitHub](NASKAH_STORYBOARD.md)
- [Pratinjau konsep](Pratinjau_Konsep.png)
- [Pratinjau halaman rancangan intro logo](Pratinjau_Intro_Logo.png)
- [Pratinjau bagian pembuka](Pratinjau_Pembuka.png)
- [Pratinjau bagian presensi](Pratinjau_Presensi.png)

## Intro logo

Logo **Politeknik STIA LAN Jakarta, LAN dan Komdigi** direncanakan dalam satu baris pada latar putih, masuk lembut, ditahan agar terbaca, kemudian tersambung ke judul dashboard. Warna dan proporsi asli dipertahankan. Ini rancangan tertulis; ketiga logo belum dimasukkan sebagai gambar dalam dokumen atau video.

Gambar kiriman terlihat dalam percakapan, tetapi berkas sumbernya belum tersedia untuk render lokal. Memerlukan unggahan sebagai berkas PNG/SVG agar pratinjau video memakai logo persis seperti kiriman. Tidak menggambar ulang atau mengganti versi aset secara diam-diam.

## Alur kerja

1. Intro tiga logo institusi.
2. Kebutuhan pemantauan pelatihan.
3. Pengenalan dashboard dan peran.
4. Persiapan kelas oleh Admin.
5. Presensi dan pencatatan oleh Petugas.
6. Evaluasi peserta oleh Pengajar/Panitia dan catatan kejadian.
7. Rekap, JP dan laporan pendukung.
8. Riwayat dan manfaat berkelanjutan.
9. Penutup identitas produk dan instansi.

Satu program dan peserta contoh digunakan sepanjang video agar tindakan dan hasilnya saling terhubung. Detail waktu dan redaksi masih merupakan draf. Layout kerja 16:9, karakter suara, pilihan musik dan kredit penutup masih perlu ditetapkan pada tahap berikutnya.

## Bahan kerja

- [Konsep sumber dan metadata referensi](STUDI_REFERENSI.md)
- [Naskah dalam JSON](NASKAH_STORYBOARD.json)
- [Pembuat Word](buat_draf_word.py)
- [Hasil pemeriksaan dokumen](PEMERIKSAAN_DRAF.json)

Untuk membuat ulang Word, dari root repository dengan Python dan python-docx:

```bash
python apps-script/absensi-dashboard/video-promosi/buat_draf_word.py
```

Waktu adegan/tampilan berurutan dan berjumlah 248 detik; seluruh narasi terdapat dalam Word. PDF sementara hanya dipakai di luar repository untuk pemeriksaan halaman. Seluruh 19 sumber aplikasi dan tiga panduan Word sebelumnya tetap identik. Tidak ada perubahan kode, data Google, deployment atau branch main dalam penyusunan draf ini.
