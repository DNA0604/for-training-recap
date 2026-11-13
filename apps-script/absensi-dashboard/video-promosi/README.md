# Konsep, naskah dan storyboard video promosi

Konsep yang disetujui: **Satu Perjalanan Pelatihan, dari Persiapan hingga Evaluasi**. Video ditujukan kepada pimpinan, pegawai pengelola dan stakeholder termasuk dosen/teman pengguna. Tujuannya agar penonton memahami konsep dashboard, merasakan pengalaman penggunaan, dan melihat manfaat jangka panjangnya.

## Draf untuk ditinjau

**[Unduh Draf_Naskah_Storyboard.docx](https://github.com/DNA0604/for-training-recap/blob/docs/naskah-storyboard-video-promosi/apps-script/absensi-dashboard/video-promosi/Draf_Naskah_Storyboard.docx?raw=true)**

Versi 0.1 berisi **8 bagian, 23 rencana tampilan dan 419 kata narasi**, dengan alokasi sekitar 4 menit. Word memakai teks dan tabel yang dapat disunting; 10 halaman pada pemeriksaan tata letak lokal. Ini storyboard tertulis dengan uraian visual/interaksi, teks layar, transisi dan catatan produksi. Belum ada animatic, rekaman suara, musik terpilih atau film final.

- [Baca naskah dan storyboard di GitHub](NASKAH_STORYBOARD.md)
- [Pratinjau konsep](Pratinjau_Konsep.png)
- [Pratinjau bagian pembuka](Pratinjau_Pembuka.png)
- [Pratinjau bagian presensi](Pratinjau_Presensi.png)

## Alur kerja

1. Kebutuhan pemantauan pelatihan.
2. Pengenalan dashboard dan peran.
3. Persiapan kelas oleh Admin.
4. Presensi dan pencatatan oleh Petugas.
5. Evaluasi peserta oleh Pengajar/Panitia dan catatan kejadian.
6. Rekap, JP dan laporan pendukung.
7. Riwayat dan manfaat berkelanjutan.
8. Penutup identitas produk dan instansi.

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

Waktu adegan/tampilan berurutan dan berjumlah 240 detik; seluruh narasi terdapat dalam Word. PDF sementara hanya dipakai di luar repository untuk pemeriksaan halaman. Seluruh 19 sumber aplikasi dan tiga panduan Word sebelumnya tetap identik. Tidak ada perubahan kode, data Google, deployment atau branch main dalam penyusunan draf ini.
