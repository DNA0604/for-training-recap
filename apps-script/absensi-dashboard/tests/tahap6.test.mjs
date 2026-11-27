import test from 'node:test';import assert from 'node:assert/strict';
import {TANPA_FORCE} from './support/lock-rpc.mjs';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const normal=o=>JSON.parse(JSON.stringify(o).replace(/[A-Z]{2,4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,'ID-X').replace(/20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g,'TS').replace(/[a-f0-9]{64}/g,'H').replace(/"expires":\d+/g,'"expires":0'));
function siap(){
  const x=sessionHarness(),{t}=x,c=t.c,bacaan={},logs=[],hitung={owner:0};c.console={log:(...a)=>logs.push(a.join(' '))};
  for(const [lb,b] of [['main',t.h.ss],['access',t.access.ss]]){const get=b.getSheetByName;b.getSheetByName=n=>{const s=get(n);if(!s||s.__h)return s;s.__h=true;const dr=s.getDataRange;
    s.getDataRange=()=>{const r=dr();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{const k=lb+':'+n;bacaan[k]=(bacaan[k]||0)+1;return f();};}return r;};return s;};
    const go=b.getOwner;if(go)b.getOwner=(...a)=>{hitung.owner++;return go.apply(b,a);};}
  const isi=new Map();c.CacheService={getScriptCache:()=>({get:k=>{const e=isi.get(k);return e&&e.sampai>c.Date.now()?e.nilai:null;},put:(k,v,ttl)=>{isi.set(k,{nilai:v,sampai:c.Date.now()+ttl*1000});},remove:k=>isi.delete(k)})};
  const geser=ms=>{const real=Date;c.Date=new Proxy(real,{get:(tt,p)=>p==='now'?()=>real.now()+ms:Reflect.get(tt,p),construct:(tt,a)=>Reflect.construct(tt,a.length?a:[real.now()+ms])});};
  const ukur=fn=>{for(const k of Object.keys(bacaan))delete bacaan[k];hitung.owner=0;let galat=null,hasil;try{hasil=fn();}catch(e){galat=e;}return {galat,hasil,bacaan:{...bacaan},owner:hitung.owner};};
  const waktu=()=>logs.filter(l=>l.startsWith('WAKTU ')).map(l=>JSON.parse(l.slice(6)));
  const nyalakanCache=()=>{x.asOwner();c.aktifkanCacheOtorisasiPanitia();};
  const nyalakanCepat=()=>{x.asOwner();c.aktifkanValidasiCepatPresensiQR();};
  const manual=(status,id)=>{const row=x.call(x.staff,'muatKehadiranIndex','SES001').peserta[0];return ukur(()=>x.call(x.staff,'simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'KST001',versi:row.versi,status,keterangan:'Pemeriksaan kelas',id_permintaan:id}));};
  const kosongkan=()=>{const v=t.h.store.Kehadiran.values,ix=v[0].indexOf('id_kehadiran');t.h.put('Kehadiran',v.filter((r,i)=>i===0||r[ix]!=='KHD001'));};
  return {...x,c,t,ukur,bacaan,geser,logs,waktu,nyalakanCache,nyalakanCepat,manual,kosongkan};
}
const TABEL_BACA=['main:Jenjang','main:Sesi','main:Keikutsertaan'];
// ---------------- 6A ----------------
test('6A: a warm call logs the fast-path sub-stages',()=>{
  const x=siap();x.nyalakanCache();x.call(x.staff,'muatBerandaIndex');x.call(x.staff,'muatBerandaIndex');
  const tahap=x.waktu().pop().tahap;for(const k of ['jalur_cepat','cepat_properti','cepat_cache','cepat_jenjang'])assert.ok(k in tahap,k);
  assert.ok(!('direktori' in tahap));
});
test('6A: opening the access workbook logs buka_buku and cek_pemilik',()=>{
  const x=siap();x.call(x.admin,'muatManajemenAksesPanitia');
  const tahap=x.waktu().pop().tahap;assert.ok('buka_buku' in tahap&&'cek_pemilik' in tahap);
});
// ---------------- 6C ----------------
test('6C: the owner check of the access workbook is cached for the TTL only when the authorization cache is on',TANPA_FORCE,()=>{
  const x=siap(),buka=()=>x.ukur(()=>x.c.bukuAkses_());
  assert.ok(buka().owner>0);assert.ok(buka().owner>0,'cache mati: selalu diperiksa');
  x.nyalakanCache();const a=buka(),b=buka();assert.ok(a.owner>0,'pertama: diperiksa');assert.equal(b.owner,0,'kedua dalam TTL: dari cache');
  x.geser((x.c.TTL_PEMILIK_BUKU_DETIK_+1)*1000);assert.ok(buka().owner>0,'setelah TTL diperiksa lagi');
});
test('6C: a changed workbook owner is seen after the TTL, and always in setup (pending) mode',()=>{
  const x=siap();x.nyalakanCache();x.c.bukuAkses_();
  x.t.access.ss.getOwner=()=>({getEmail:()=> 'pemilik.lain@test.invalid'});
  assert.doesNotThrow(()=>x.c.bukuAkses_(),'dalam TTL belum terlihat (terdokumentasi)');
  assert.throws(()=>x.c.bukuAkses_(true),/Kepemilikan spreadsheet akses/,'mode persiapan selalu langsung');
  x.geser((x.c.TTL_PEMILIK_BUKU_DETIK_+1)*1000);assert.throws(()=>x.c.bukuAkses_(),/Kepemilikan spreadsheet akses/);
});
test('6C: the owner-check TTL can be set through AKSES_PEMILIK_TTL_DETIK with a safe fallback',()=>{
  const x=siap(),props=x.c.PropertiesService.getScriptProperties();x.nyalakanCache();
  props.setProperty('AKSES_PEMILIK_TTL_DETIK','60');x.c.bukuAkses_();
  x.geser(30000);assert.equal(x.ukur(()=>x.c.bukuAkses_()).owner,0);
  x.geser(65000);assert.ok(x.ukur(()=>x.c.bukuAkses_()).owner>0);
  for(const buruk of ['5','99999','abc','']){props.setProperty('AKSES_PEMILIK_TTL_DETIK',buruk);x.geser(0);x.c.bukuAkses_(true);x.c.cacheLoginAkses_().remove('PEMILIK-BUKU-AKSES|'+x.c.konfigurasiAkses_().id+'|'+x.c.databaseAkses_().getId());x.c.bukuAkses_();
    x.geser(300000);assert.equal(x.ukur(()=>x.c.bukuAkses_()).owner,0,'nilai tidak valid memakai bawaan 600 detik: '+buruk);}
});
// ---------------- 6B ----------------
test('6B: manual attendance reuses pre-write reads, gives identical results, and stops reuse before the first write',TANPA_FORCE,()=>{
  const hasil={};
  for(const mode of ['mati','menyala']){
    const x=siap();x.kosongkan();if(mode==='menyala')x.nyalakanCepat();
    let memoSaatTulis;const fl=x.c.SpreadsheetApp.flush;x.c.SpreadsheetApp.flush=(...a)=>{if(memoSaatTulis===undefined)memoSaatTulis=x.c.bacaanPermintaanAkses_;return fl&&fl(...a);};
    const r=x.manual('hadir','tahap6_manual_request_00001');assert.equal(r.galat,null);
    assert.equal(memoSaatTulis,null,'pemakaian ulang harus sudah berhenti pada penulisan pertama ('+mode+')');
    assert.equal(x.c.bacaanPermintaanAkses_,null);
    hasil[mode]={respons:normal(plain(r.hasil)),store:normal([x.t.h.store,x.t.access.store]),bacaan:r.bacaan};
  }
  assert.deepEqual(hasil.menyala.respons,hasil.mati.respons);assert.deepEqual(hasil.menyala.store,hasil.mati.store);
  for(const k of TABEL_BACA)assert.ok((hasil.menyala.bacaan[k]||0)<(hasil.mati.bacaan[k]||0),k+' harus lebih sedikit dibaca ('+(hasil.menyala.bacaan[k]||0)+' < '+(hasil.mati.bacaan[k]||0)+')');
  assert.ok((hasil.menyala.bacaan['main:Riwayat_Validasi']||0)>=3,'tanda terima dan verifikasi tulis tetap membaca langsung');
});
test('6B: with the switch off the pre-write phase never enables reuse',TANPA_FORCE,()=>{
  const x=siap();assert.equal(x.c.mulaiBacaanSebelumTulis_(),null);assert.equal(x.c.bacaanPermintaanAkses_,null);
  x.nyalakanCepat();const tk=x.c.mulaiBacaanSebelumTulis_();assert.ok(tk&&x.c.bacaanPermintaanAkses_);x.c.akhiriBacaanSebelumTulis_(tk);assert.equal(x.c.bacaanPermintaanAkses_,null);
});
test('6B: a failed or repeated manual attendance request restores the read mode and stays idempotent',()=>{
  const x=siap();x.kosongkan();x.nyalakanCepat();
  const pertama=x.manual('hadir','tahap6_manual_request_00002');assert.equal(pertama.galat,null);
  const ulang=x.ukur(()=>x.call(x.staff,'simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'KST001',versi:'versi-lama',status:'hadir',keterangan:'Pemeriksaan kelas',id_permintaan:'tahap6_manual_request_00002'}));
  assert.equal(x.c.bacaanPermintaanAkses_,null);assert.ok(ulang.galat||ulang.hasil);
  assert.throws(()=>x.call(x.staff,'simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'TIDAK-ADA',versi:'',status:'hadir',keterangan:'',id_permintaan:'tahap6_manual_request_00003'}));
  assert.equal(x.c.bacaanPermintaanAkses_,null);
});
// ------------- pencabutan saat menunggu lock (cache menyala) -------------
test('stage 5B/6: revocation made through the app while the write waits for its own lock blocks the write (cache on)',()=>{
  for(const jenis of ['scope','account','logout']){
    const x=siap(),{t,staff,call,correction}=x;x.nyalakanCache();call(staff,'muatBerandaIndex');
    const d=correction(),sebelum=plain(t.h.store),asli=t.c.LockService.getScriptLock;let n=0;
    t.c.LockService.getScriptLock=()=>{const lock=asli(),tunggu=lock.waitLock;lock.waitLock=(...a)=>{n++;if(n===1){
      if(jenis==='logout')t.h.props.set(t.c.kunciSesiTersimpan_(staff.token),JSON.stringify({revoked:true,expires:Date.now()+4*3600000}));
      else if(jenis==='account'){t.access.patch('Pengguna',t.c.bacaSesiPanitia_(staff.token).id,'id_pengguna',{status:'nonaktif'});t.c.naikkanVersiDirektoriAkses_();}
      else{const r=t.access.records('Penugasan_Jenjang').find(r=>r.id_jenjang==='JEN001');t.access.patch('Penugasan_Jenjang',r.id_penugasan,'id_penugasan',{status:'nonaktif'});t.c.naikkanVersiDirektoriAkses_();}}
      return tunggu(...a);};return lock;};
    assert.throws(()=>call(staff,'simpanIzinIndex',{id_kehadiran:d.id_kehadiran,versi:d.versi,mulai:'2026-10-20T08:10',selesai:'2026-10-20T08:20',alasan:'Izin'}),/AKSES_DITOLAK|SESI_BERAKHIR/,jenis);
    assert.deepEqual(plain(t.h.store),sebelum,'tidak ada penulisan: '+jenis);
  }
});
