// Perbandingan offline Tahap 3: validasi integritas satu-baca dan jalur cepat presensi QR.
// Hitungan panggilan layanan tiruan; bukan waktu Google. Pakai --base=<hash commit> atau --base-dir=<folder berisi Jenjang.gs dan Hapus.gs lama>.
import fs from 'node:fs';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
import {loadingHarness,instrumentLoading} from './support/pemuatan-audit-harness.mjs';
const arg=n=>process.argv.find(s=>s.startsWith('--'+n+'='))?.slice(n.length+3);
const baseDir=arg('base-dir'),base=arg('base');
if(!baseDir&&!/^[a-f0-9]{7,40}$/.test(base||''))throw Error('Gunakan --base=<hash commit> atau --base-dir=<folder>.');
const lama=n=>baseDir?fs.readFileSync(baseDir+'/'+n,'utf8'):execFileSync('git',['show',base+':apps-script/absensi-dashboard/'+n],{encoding:'utf8'});
const sumber={'Jenjang.gs':lama('Jenjang.gs'),'Hapus.gs':lama('Hapus.gs')};
const plain=o=>JSON.parse(JSON.stringify(o));
function buat(versi,size){const h=loadingHarness(size);h.t.c.console={log(){}};if(versi==='lama')for(const [n,s] of Object.entries(sumber))vm.runInContext(s,h.t.c,{filename:n});return h;}
function ukur(h,fn){const spy=instrumentLoading(h);spy.reset();let galat=null,hasil=null;try{hasil=fn();}catch(e){galat=e.message;}
  const s=spy.snapshot(),per=Object.entries(s).filter(([k])=>/^main\/.*\/(getValues|getFormulas)$/.test(k));
  return {baca:per.reduce((a,[,v])=>a+v,0),galat,hasil:hasil===undefined?null:plain(hasil),per:Object.fromEntries(per.map(([k,v])=>[k.replace(/^main\/|\/(getValues|getFormulas)$/g,''),v]))};}
const keluar=[];
// 1. Validasi integritas penuh (jalur ubah-data), data valid.
for(const size of [22,500]){
  const a=ukur(buat('lama',size),()=>buat('lama',size).t.c.validasiIntegritasOperasionalJenjang_()),b=0;
  const hl=buat('lama',size),hb=buat('baru',size);
  const L=ukur(hl,()=>hl.t.c.validasiIntegritasOperasionalJenjang_()),B=ukur(hb,()=>hb.t.c.validasiIntegritasOperasionalJenjang_());
  if(L.galat||B.galat)throw Error('data valid tidak boleh gagal: '+L.galat+' / '+B.galat);
  keluar.push({peserta:size,aksi:'guard_integritas',lama:L.baca,baru:B.baca,per_lama:L.per,per_baru:B.per});
}
// 2. Pesan galat identik pada data rusak.
const rusak={
  sesi_jenjang_asing:h=>h.t.h.store.Sesi.values[1][h.t.h.store.Sesi.values[0].indexOf('id_jenjang')]='JNJ-TIDAK-ADA',
  kehadiran_sesi_hilang:h=>{const t=h.t.h.store.Kehadiran;t.values[1][t.values[0].indexOf('id_sesi')]='SES-TIDAK-ADA';},
  keikutsertaan_ganda:h=>{const t=h.t.h.store.Keikutsertaan;t.values.push([...t.values[1]]);t.formulas.push(t.values[1].map(()=>''));},
  kehadiran_lintas_jenjang:h=>{const t=h.t.h.store.Kehadiran;t.values[1][t.values[0].indexOf('id_keikutsertaan')]='';},
};
for(const [nama,rusakkan] of Object.entries(rusak)){
  const hl=buat('lama',22),hb=buat('baru',22);rusakkan(hl);rusakkan(hb);
  const L=ukur(hl,()=>hl.t.c.validasiIntegritasOperasionalJenjang_()),B=ukur(hb,()=>hb.t.c.validasiIntegritasOperasionalJenjang_());
  if(!L.galat||L.galat!==B.galat)throw Error('pesan galat berbeda pada '+nama+': '+L.galat+' | '+B.galat);
  keluar.push({peserta:22,aksi:'galat_'+nama,lama:L.baca,baru:B.baca,galat:B.galat});
}
// 3. Jalur cepat presensi QR: sakelar mati vs menyala (panggilan hangat).
for(const size of [22,500]){
  const h=buat('baru',size),c=h.t.c;c.Session={getActiveUser:()=>({getEmail:()=> 'owner@test.invalid'})};
  const strict=ukur(h,()=>c.pastikanTidakAdaHapusTertunda_({izinkanLewatiBaru:true}));
  c.aktifkanValidasiCepatPresensiQR();c.pastikanTidakAdaHapusTertunda_({izinkanLewatiBaru:true}); // pemanasan: validasi penuh mengisi penanda
  const cepat=ukur(h,()=>c.pastikanTidakAdaHapusTertunda_({izinkanLewatiBaru:true})),lain=ukur(h,()=>c.pastikanTidakAdaHapusTertunda_());
  keluar.push({peserta:size,aksi:'guard_qr_mati_vs_hangat',mati:strict.baca,hangat:cepat.baca,jalur_lain_tetap_penuh:lain.baca});
}
// 4. Aksi ubah-data yang memakai validasi integritas: respons dan isi sheet identik, pembacaan lebih sedikit.
const normal=o=>JSON.parse(JSON.stringify(o).replace(/[A-Z]{2,4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,'ID-X').replace(/20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g,'TS').replace(/[a-f0-9]{64}/g,'H').replace(/"expires":\d+/g,'"expires":0'));
const baris=n=>Array.from({length:n},(_,i)=>({nomor:i+2,nip:'19800101202001'+String(1000+i),nama:'Peserta Impor '+i,unit:'Unit X'}));
const ubah={
  tambah_program:h=>h.call(h.admin,'tambahProgramIndex',{nama:'Program Ukur',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'ukur_program_request_0001'}),
  tambah_sesi:h=>h.call(h.admin,'tambahSesiIndex',{id_program:'PRG001',id_jenjang:'JEN001',nama:'Sesi Ukur',tanggal:'2026-10-20',mulai:'08:00',selesai:'10:00',status_jp:'dihitung',jeda:[],id_permintaan:'ukur_sesi_request_00001'}),
  impor_5:h=>{const pre=plain(h.call(h.admin,'pratinjauImporPesertaIndex','PRG001',baris(5),'JEN001'));return h.call(h.admin,'imporPesertaProgramIndex',{id_program:'PRG001',id_jenjang:'JEN001',id_permintaan:'impor_ukur_request_5_01',batch:0,baris:pre.baris});},
};
for(const size of [22,500])for(const [nama,fn] of Object.entries(ubah)){
  const hl=buat('lama',size),hb=buat('baru',size);
  const L=ukur(hl,()=>fn(hl)),B=ukur(hb,()=>fn(hb));
  if(L.galat||B.galat)throw Error('aksi gagal: '+nama+' '+L.galat+' / '+B.galat);
  if(JSON.stringify(normal(L.hasil))!==JSON.stringify(normal(B.hasil)))throw Error('respons berbeda: '+nama);
  if(JSON.stringify(normal(hl.t.h.store))!==JSON.stringify(normal(hb.t.h.store)))throw Error('isi sheet berbeda: '+nama);
  keluar.push({peserta:size,aksi:'ubah_'+nama,lama:L.baca,baru:B.baca});
}
console.log('LULUS: respons dan isi sheet identik pada 6 aksi ubah-data.');
console.table(keluar.filter(o=>o.aksi.startsWith('ubah_')&&o.peserta===22).map(o=>({aksi:o.aksi,pembacaan_lama:o.lama,pembacaan_baru:o.baru})));
console.log('LULUS: pesan galat identik pada '+Object.keys(rusak).length+' kasus data rusak.');
console.table(keluar.filter(o=>o.aksi==='guard_integritas').map(o=>({peserta:o.peserta,pembacaan_lama:o.lama,pembacaan_baru:o.baru})));
console.table(keluar.filter(o=>o.aksi==='guard_qr_mati_vs_hangat').map(o=>({peserta:o.peserta,mati:o.mati,hangat:o.hangat,jalur_lain:o.jalur_lain_tetap_penuh})));
const dest=arg('out');if(dest)fs.writeFileSync(dest,JSON.stringify({catatan:'Hitungan pembacaan sheet pada layanan tiruan; bukan waktu Google.',hasil:keluar},null,2));
