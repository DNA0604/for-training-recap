import test from 'node:test';import assert from 'node:assert/strict';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const DIREKTORI=/^access:(Pengguna|Penugasan_Jenjang|Riwayat_Akses)$/;
function siap(){
  const x=sessionHarness(),{t}=x,c=t.c,bacaan={};c.console={log(){}};
  for(const [lb,b] of [['main',t.h.ss],['access',t.access.ss]]){const get=b.getSheetByName;b.getSheetByName=n=>{const s=get(n);if(!s||s.__h)return s;s.__h=true;const dr=s.getDataRange;
    s.getDataRange=()=>{const r=dr();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{const k=lb+':'+n;bacaan[k]=(bacaan[k]||0)+1;return f();};}return r;};return s;};}
  const isi=new Map();c.CacheService={getScriptCache:()=>({get:k=>{const e=isi.get(k);return e&&e.sampai>c.Date.now()?e.nilai:null;},put:(k,v,ttl)=>{isi.set(k,{nilai:v,sampai:c.Date.now()+ttl*1000});},remove:k=>isi.delete(k)})};
  const geser=ms=>{const real=Date;c.Date=new Proxy(real,{get:(tt,p)=>p==='now'?()=>real.now()+ms:Reflect.get(tt,p),construct:(tt,a)=>Reflect.construct(tt,a.length?a:[real.now()+ms])});};
  const ukur=fn=>{for(const k of Object.keys(bacaan))delete bacaan[k];let galat=null,hasil;try{hasil=fn();}catch(e){galat=e;}return {galat,hasil,bacaan:{...bacaan},direktori:Object.entries(bacaan).filter(([k])=>DIREKTORI.test(k)).reduce((a,[,v])=>a+v,0)};};
  const edit=(sheet,id,kolom,nilai)=>{const tb=t.access.store[sheet],head=tb.values[0],kunci=head.includes('id_pengguna')?'id_pengguna':'id_penugasan',baris=tb.values.findIndex((r,i)=>i>0&&r[head.indexOf(kunci)]===id);assert.ok(baris>0);tb.values[baris][head.indexOf(kolom)]=nilai;};
  const nyalakan=()=>{x.asOwner();c.aktifkanCacheOtorisasiPanitia();};
  const periksaUlang=who=>{c.konteksSesiPanitia_={token:who.token,method:'muatBerandaIndex',args:[]};try{return c.periksaUlangSesiPanitia_();}finally{c.konteksSesiPanitia_=null;}};
  return {...x,c,t,ukur,geser,edit,nyalakan,periksaUlang,bacaan};
}
const kunciTabel=['Catatan_Perilaku']; // dibaca hanya oleh validasi integritas pada alur QR/presensi manual
const strictQR=x=>x.ukur(()=>x.c.pastikanTidakAdaHapusTertunda_({izinkanLewatiBaru:true}));
// ---------------- 5A ----------------
test('5A: a full directory validation parses Riwayat_Akses once instead of twice',()=>{
  const x=siap(),r=x.ukur(()=>x.c.bacaSesiPanitiaTerkunci_(x.staff.token,false));
  assert.equal(r.galat,null);assert.equal(r.bacaan['access:Riwayat_Akses'],2,'nilai + rumus, satu kali');
});
// ---------------- 5B ----------------
test('5B: with the cache on, the write re-check skips the directory; with it off it reads the directory',()=>{
  const x=siap();x.periksaUlang(x.staff);const mati=x.ukur(()=>x.periksaUlang(x.staff));assert.equal(mati.galat,null);assert.ok(mati.direktori>0);
  x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);
  const hangat=x.ukur(()=>x.periksaUlang(x.staff));assert.equal(hangat.galat,null);assert.equal(hangat.direktori,0);
});
test('5B: deactivating the account through the app between authorization and write blocks the write',()=>{
  const x=siap();x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);
  const u=x.call(x.admin,'muatManajemenAksesPanitia').pengguna.find(p=>p.id===x.u.id);
  x.call(x.admin,'simpanPenggunaPanitia',{id:u.id,nama:u.nama,email:u.email,peran:u.peran,status:'nonaktif',versi:u.versi,id_permintaan:'tahap5_nonaktif_request_0001'});
  assert.throws(()=>x.periksaUlang(x.staff),/SESI_BERAKHIR/);
});
test('5B: a pending access transaction blocks the write re-check immediately',()=>{
  const x=siap();x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);
  x.c.auditAkses_(x.c.bukuAkses_(),{sheet:'Pengguna',id:'U-UJI',action:'uji',before:null,tx:'AKS-uji|tahap5_pending_request_0001'},'PENDING','owner@test.invalid');
  assert.throws(()=>x.periksaUlang(x.staff),/AKSES_DITAHAN/);
});
test('5B: logout revokes the stored session at the write re-check immediately',()=>{
  const x=siap();x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);x.c.keluarAplikasiPanitia(x.staff.token);
  assert.throws(()=>x.periksaUlang(x.staff),/SESI_BERAKHIR/);
});
test('5B: a manual spreadsheet edit is seen by the re-check only after the TTL (documented limit)',()=>{
  const x=siap();x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);x.edit('Pengguna',x.u.id,'status','nonaktif');
  assert.equal(x.ukur(()=>x.periksaUlang(x.staff)).galat,null,'dalam TTL belum terlihat');
  x.geser((x.c.TTL_KONTEKS_AKSES_DETIK_+1)*1000);assert.throws(()=>x.periksaUlang(x.staff),/SESI_BERAKHIR/);
});
test('5B: a directory version bump forces the full path once and then the cache is warm again',()=>{
  const x=siap();x.nyalakan();x.c.bacaSesiPanitia_(x.staff.token);
  x.c.naikkanVersiDirektoriAkses_();const penuh=x.ukur(()=>x.periksaUlang(x.staff)),lagi=x.ukur(()=>x.periksaUlang(x.staff));
  assert.equal(penuh.galat,null);assert.ok(penuh.direktori>0,'versi berubah → baca penuh');assert.equal(lagi.direktori,0,'cache terisi ulang');
});
// ---------------- 5C ----------------
test('5C: QR token issuance skips whole-data validation within 60 s when the switch is on; other writes stay strict',()=>{
  const x=siap();x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();
  const a=x.ukur(()=>x.call(x.staff,'terbitkanQRAbsensiDariGenerator','SES001','datang',5)),b=x.ukur(()=>x.call(x.staff,'terbitkanQRAbsensiDariGenerator','SES001','pulang',5));
  assert.equal(a.galat,null);assert.equal(b.galat,null);
  for(const n of kunciTabel){assert.ok(a.bacaan['main:'+n]>=1,'pemanggilan pertama memvalidasi penuh');assert.ok(!b.bacaan['main:'+n],'dalam 60 detik dilewati');}
  const program=x.ukur(()=>x.call(x.admin,'tambahProgramIndex',{nama:'Program Tahap 5',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'tahap5_program_request_0001'}));
  assert.equal(program.galat,null);assert.ok(program.bacaan['main:Catatan_Perilaku']>=1,'tambah program tetap validasi penuh');
});
test('5C: manual attendance skips whole-data validation within 60 s when the switch is on',()=>{
  const x=siap(),{t,staff,call}=x;x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();
  const v=t.h.store.Kehadiran.values,ix=v[0].indexOf('id_kehadiran');t.h.put('Kehadiran',v.filter((r,i)=>i===0||r[ix]!=='KHD001'));
  const simpan=(status,id)=>{const row=call(staff,'muatKehadiranIndex','SES001').peserta[0];return x.ukur(()=>call(staff,'simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'KST001',versi:row.versi,status,keterangan:'Pemeriksaan kelas',id_permintaan:id}));};
  const a=simpan('hadir','tahap5_manual_request_000001'),b=simpan('alpa','tahap5_manual_request_000002');
  assert.equal(a.galat,null);assert.equal(b.galat,null);
  assert.ok(a.bacaan['main:Catatan_Perilaku']>=1,'pertama: validasi penuh');assert.ok(!b.bacaan['main:Catatan_Perilaku'],'kedua dalam 60 detik: dilewati');
});
test('5C: with the switch off, QR issuance and manual attendance always validate the whole data',()=>{
  const x=siap(),{staff,call}=x;
  const a=x.ukur(()=>call(staff,'terbitkanQRAbsensiDariGenerator','SES001','datang',5)),b=x.ukur(()=>call(staff,'terbitkanQRAbsensiDariGenerator','SES001','pulang',5));
  assert.ok(a.bacaan['main:Catatan_Perilaku']>=1&&b.bacaan['main:Catatan_Perilaku']>=1);
});
test('5C: a failed validation clears the marker so QR issuance is blocked instead of skipped',()=>{
  const x=siap();x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();
  x.call(x.staff,'terbitkanQRAbsensiDariGenerator','SES001','datang',5); // memasang penanda
  x.t.h.patch('Sesi','SES001','id_sesi',{id_jenjang:'JNJ-TIDAK-ADA'});
  assert.throws(()=>x.c.validasiIntegritasOperasionalJenjang_(),/Relasi Jenjang tidak sesuai/);
  assert.throws(()=>x.call(x.staff,'terbitkanQRAbsensiDariGenerator','SES001','pulang',5),/Relasi Jenjang tidak sesuai|Jenjang/);
});
