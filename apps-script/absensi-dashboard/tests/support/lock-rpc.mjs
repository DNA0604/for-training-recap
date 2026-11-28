// Urutan pengambilan lock pada panggilan RPC tulis: tanpa cache otorisasi, pemeriksaan akun awal mengambil lock lebih dulu (lock ke-1)
// sehingga lock milik fungsi adalah yang ke-2. Dengan cache otorisasi menyala (FORCE_JALUR_CEPAT=1) pemeriksaan awal tidak memakai lock,
// sehingga lock milik fungsi adalah yang ke-1. Tes pencabutan-saat-menunggu-lock memakai konstanta ini agar bermakna pada kedua mode.
export const LOCK_RPC=process.env.FORCE_JALUR_CEPAT==='1'?1:2;
// Tes yang menegaskan keadaan bawaan (cache/sakelar mati) dilewati pada mode FORCE_JALUR_CEPAT=1 karena mode itu menyalakannya sejak awal.
export const TANPA_FORCE={skip:process.env.FORCE_JALUR_CEPAT==='1'?'mode jalur cepat dipaksa menyala':false};
