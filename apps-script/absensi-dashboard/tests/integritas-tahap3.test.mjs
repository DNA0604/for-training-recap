import test from 'node:test';import assert from 'node:assert/strict';
import {TANPA_FORCE} from './support/lock-rpc.mjs';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const TABEL=['Jenjang','Sesi','Keikutsertaan','Kehadiran','Catatan_Perilaku','Log_Absensi'];
function siap(){
  const x=sessionHarness(),c=x.t.c,bacaan={},book=x.t.h.ss,ambil=book.getSheetByName;c.console={log(){}};
  book.getSheetByName=n=>{const s=ambil(n);if(!s||s.__dihitung)return s;const dr=s.getDataRange;s.getDataRange=()=>{const r=dr(),gv=r.getValues,gf=r.getFormulas;r.getValues=()=>{bacaan[n]=(bacaan[n]||0)+1;return gv();};r.getFormulas=()=>{bacaan[n]=(bacaan[n]||0)+1;return gf();};return r;};s.__dihitung=true;return s;};
  // CacheService dengan TTL yang mengikuti Date milik konteks uji.
  const isi=new Map();c.CacheService={getScriptCache:()=>({get:k=>{const e=isi.get(k);return e&&e.sampai>c.Date.now()?e.nilai:null;},put:(k,v,ttl)=>{isi.set(k,{nilai:v,sampai:c.Date.now()+ttl*1000});},remove:k=>isi.delete(k)})};
  const geser=ms=>{const real=Date;c.Date=new Proxy(real,{get:(t,p)=>p==='now'?()=>real.now()+ms:Reflect.get(t,p),construct:(t,a)=>Reflect.construct(t,a.length?a:[real.now()+ms])});};
  const ukur=fn=>{for(const k of Object.keys(bacaan))delete bacaan[k];let galat=null;try{fn();}catch(e){galat=e;}return {galat,bacaan:{...bacaan},data:TABEL.reduce((a,n)=>a+(bacaan[n]||0),0)};};
  return {...x,c,ukur,geser,bacaan};
}
const qr=c=>c.pastikanTidakAdaHapusTertunda_({izinkanLewatiBaru:true});
test('integrity guard reads each of the six tables exactly once',()=>{
  const x=siap(),r=x.ukur(()=>x.c.validasiIntegritasOperasionalJenjang_());assert.equal(r.galat,null);
  for(const n of TABEL)assert.equal(r.bacaan[n],1,n+' harus dibaca tepat satu kali');
});
test('broken relations raise the same errors as before',()=>{
  const a=siap();a.t.h.patch('Sesi','SES001','id_sesi',{id_jenjang:'JNJ-TIDAK-ADA'});
  assert.throws(()=>a.c.validasiIntegritasOperasionalJenjang_(),/Relasi Jenjang tidak sesuai pada Sesi SES001/);
  const b=siap();b.t.h.patch('Kehadiran','KHD001','id_kehadiran',{id_sesi:'SES-TIDAK-ADA'});
  assert.throws(()=>b.c.validasiIntegritasOperasionalJenjang_(),/Relasi sesi \/ peserta lintas Jenjang pada Kehadiran/);
});
test('QR fast path is off by default: every QR guard validates the whole data',TANPA_FORCE,()=>{
  const x=siap(),a=x.ukur(()=>qr(x.c)),b=x.ukur(()=>qr(x.c));
  assert.equal(a.galat,null);assert.equal(a.data,6);assert.equal(b.data,6);
});
test('with the switch on, a recent full validation lets only the QR path skip it; other paths stay strict',()=>{
  const x=siap();x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();
  const penuh=x.ukur(()=>qr(x.c)),hangat=x.ukur(()=>qr(x.c)),lain=x.ukur(()=>x.c.pastikanTidakAdaHapusTertunda_()),langsung=x.ukur(()=>x.c.validasiIntegritasOperasionalJenjang_());
  assert.equal(penuh.data,6);assert.equal(hangat.data,0,'QR dalam TTL tidak membaca enam tabel validasi');
  assert.equal(lain.data,6,'jalur ubah-data lain selalu penuh');assert.equal(langsung.data,6);
});
test('the marker expires after the TTL and a failed validation removes it immediately',()=>{
  const x=siap();x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();qr(x.c);assert.equal(x.ukur(()=>qr(x.c)).data,0);
  x.geser((x.c.TTL_INTEGRITAS_QR_DETIK_+1)*1000);assert.equal(x.ukur(()=>qr(x.c)).data,6,'setelah TTL kembali penuh');
  x.geser(0);qr(x.c);assert.equal(x.ukur(()=>qr(x.c)).data,0);
  x.t.h.patch('Sesi','SES001','id_sesi',{id_jenjang:'JNJ-TIDAK-ADA'});
  assert.equal(x.ukur(()=>qr(x.c)).data,0,'batas terdokumentasi: edit manual dalam TTL belum terdeteksi jalur QR');
  assert.throws(()=>x.c.validasiIntegritasOperasionalJenjang_(),/Relasi Jenjang tidak sesuai/);
  assert.throws(()=>qr(x.c),/Relasi Jenjang tidak sesuai/,'setelah kegagalan penanda hilang sehingga QR ikut diblokir');
});
test('only the owner can switch the QR fast path; switching off restores full validation',()=>{
  const x=siap();x.c.Session={getActiveUser:()=>({getEmail:()=> 'bukan.pemilik@test.invalid'})};
  assert.throws(()=>x.c.aktifkanValidasiCepatPresensiQR(),/pemilik/);assert.throws(()=>x.c.matikanValidasiCepatPresensiQR(),/pemilik/);
  x.asOwner();x.c.aktifkanValidasiCepatPresensiQR();qr(x.c);assert.equal(x.ukur(()=>qr(x.c)).data,0);
  x.c.matikanValidasiCepatPresensiQR();assert.equal(x.ukur(()=>qr(x.c)).data,6);
});
test('public QR attendance still records one log row and replays idempotently with the fast path on',()=>{
  const x=siap(),{t,staff,call,c}=x;x.asOwner();c.aktifkanValidasiCepatPresensiQR();
  t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:''});
  const url=Object.values(call(staff,'terbitkanQRAbsensiDariGenerator','SES001','datang',5)).find(v=>typeof v==='string'&&v.includes('?absen='));
  const data={token:new URL(url).searchParams.get('absen'),id_peserta:'PST001',id_permintaan:'qr_cepat_request_000001'},a=plain(c.simpanAbsensiPeserta(data)),b=plain(c.simpanAbsensiPeserta(data));
  assert.equal(a.sukses,true);assert.deepEqual(b,a);assert.equal(t.h.records('Log_Absensi').length,1);
});
