// Perbandingan offline Tahap 2: cache konteks direktori MATI vs AKTIF (panggilan hangat). Respons harus identik.
// Hitungan panggilan layanan tiruan; bukan waktu Google.
import fs from 'node:fs';
import {loadingHarness,instrumentLoading} from './support/pemuatan-audit-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const normal=o=>JSON.parse(JSON.stringify(o).replace(/[A-Z]{2,4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,'ID-X').replace(/20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g,'TS').replace(/[a-f0-9]{64}/g,'H').replace(/"expires":\d+/g,'"expires":0'));// expires = waktu sesi uji, berbeda antar-proses
const DIR=/^access\/(Pengguna|Penugasan_Jenjang|Riwayat_Akses)\//;
const skenario={
  boot_sesi:(h,who)=>h.t.c.muatSesiAplikasiPanitia(who.token),
  data_awal:(h,who)=>h.call(who,'muatAwalIndex'),
  masuk_sesi:(h,who)=>h.call(who,'muatKehadiranIndex','SES001'),
  daftar_peserta:(h,who)=>h.call(who,'muatPesertaProgramIndex','PRG001','',0,'JEN001'),
  tambah_program:(h,who)=>h.call(who,'tambahProgramIndex',{nama:'Program Ukur',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'ukur_program_request_0001'}),
};
function jalankan(size,nama,fn,cache){
  const h=loadingHarness(size),spy=instrumentLoading(h),c=h.t.c;let lock=0;c.console={log(){}};
  const ambil=c.LockService.getScriptLock;c.LockService.getScriptLock=()=>{const l=ambil(),w=l.waitLock.bind(l);l.waitLock=(...a)=>{lock++;return w(...a);};return l;};
  if(cache){c.Session={getActiveUser:()=>({getEmail:()=> 'owner@test.invalid'})};c.aktifkanCacheOtorisasiPanitia();}
  const who=h.admin,tulis=nama==='tambah_program';
  if(cache){if(tulis)c.muatSesiAplikasiPanitia(who.token);else fn(h,who);} // pemanasan: panggilan baca sebelumnya mengisi cache (tidak dihitung)
  spy.reset();lock=0;const hasil=normal(fn(h,who)),s=spy.snapshot();
  const baca=Object.entries(s).filter(([k])=>/\/(getValues|getFormulas)$/.test(k)).reduce((a,[,v])=>a+v,0);
  return {hasil,baca,dir:Object.entries(s).filter(([k])=>DIR.test(k)).reduce((a,[,v])=>a+v,0),openById:s.openById||0,getOwner:s.getOwner||0,lock};
}
const out=[];
for(const size of [22,500])for(const [nama,fn] of Object.entries(skenario)){
  const mati=jalankan(size,nama,fn,false),aktif=jalankan(size,nama,fn,true);
  {const x=JSON.stringify(mati.hasil),y=JSON.stringify(aktif.hasil);if(x!==y){let i=0;while(i<x.length&&x[i]===y[i])i++;throw Error('respons berbeda: '+nama+' '+size+' @'+i+' mati:'+x.slice(Math.max(0,i-60),i+80)+' | aktif:'+y.slice(Math.max(0,i-60),i+80));}}
  out.push({peserta:size,aksi:nama,mati,aktif});
}
console.log('LULUS: '+out.length+' perbandingan, respons identik (cache mati vs aktif, panggilan hangat).');
console.table(out.filter(o=>o.peserta===22).map(o=>({aksi:o.aksi,baca_mati:o.mati.baca,baca_aktif:o.aktif.baca,direktori_mati:o.mati.dir,direktori_aktif:o.aktif.dir,openById_mati:o.mati.openById,openById_aktif:o.aktif.openById,getOwner_mati:o.mati.getOwner,getOwner_aktif:o.aktif.getOwner,lock_mati:o.mati.lock,lock_aktif:o.aktif.lock})));
const dest=process.argv.find(a=>a.startsWith('--out='))?.slice(6);if(dest)fs.writeFileSync(dest,JSON.stringify({catatan:'Hitungan panggilan layanan tiruan; bukan waktu Google. Panggilan hangat = cache sudah terisi.',hasil:out.map(({peserta,aksi,mati,aktif})=>({peserta,aksi,mati:{...mati,hasil:undefined},aktif:{...aktif,hasil:undefined}}))},null,2));
