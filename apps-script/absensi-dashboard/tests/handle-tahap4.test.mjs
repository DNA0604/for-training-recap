import test from 'node:test';import assert from 'node:assert/strict';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
function siap(){
  const x=sessionHarness(),{t}=x,c=t.c,logs=[],cari={sheet:{},openById:0,getOwner:0};
  c.console={log:(...a)=>logs.push(a.join(' '))};
  for(const [lb,b] of [['main',t.h.ss],['access',t.access.ss]]){const get=b.getSheetByName;b.getSheetByName=n=>{cari.sheet[lb+':'+n]=(cari.sheet[lb+':'+n]||0)+1;return get(n);};
    const go=b.getOwner;if(go)b.getOwner=(...a)=>{cari.getOwner++;return go.apply(b,a);};}
  const oi=c.SpreadsheetApp.openById;if(oi)c.SpreadsheetApp.openById=(...a)=>{cari.openById++;return oi(...a);};
  const isi=new Map();c.CacheService={getScriptCache:()=>({get:k=>{const e=isi.get(k);return e&&e.sampai>c.Date.now()?e.nilai:null;},put:(k,v,ttl)=>{isi.set(k,{nilai:v,sampai:c.Date.now()+ttl*1000});},remove:k=>isi.delete(k)})};
  const geser=ms=>{const real=Date;c.Date=new Proxy(real,{get:(tt,p)=>p==='now'?()=>real.now()+ms:Reflect.get(tt,p),construct:(tt,a)=>Reflect.construct(tt,a.length?a:[real.now()+ms])});};
  const waktu=()=>logs.filter(l=>l.startsWith('WAKTU ')).map(l=>JSON.parse(l.slice(6)));
  return {...x,c,cari,logs,geser,waktu};
}
test('within one gateway call each sheet and each spreadsheet is opened only once',()=>{
  const x=siap();x.call(x.staff,'muatKehadiranIndex','SES001');
  for(const [nama,n] of Object.entries(x.cari.sheet))assert.equal(n,1,nama+' dicari lebih dari sekali');
  assert.ok(x.cari.openById<=1);assert.ok(x.cari.getOwner<=2);
});
test('handles are scoped to a single call, also after a failing call; data is never reused between calls',()=>{
  const x=siap(),{c,t,staff,call}=x,sebelum=plain(call(staff,'muatKehadiranIndex','SES001'));
  assert.equal(c.memoHandle_,null);assert.equal(c.tahapWaktu_,null);
  assert.throws(()=>call(staff,'tambahProgramIndex',{nama:'X',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'handle_galat_request_00001'}),/AKSES_DITOLAK|SESI_BERAKHIR/);
  assert.equal(c.memoHandle_,null);assert.equal(c.tahapWaktu_,null);
  t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:''});
  const sesudah=plain(call(staff,'muatKehadiranIndex','SES001'));
  assert.notDeepEqual(sesudah.peserta[0].datang,sebelum.peserta[0].datang,'perubahan sheet harus langsung terlihat pada panggilan berikutnya');
});
test('the authorization cache TTL can be set by the owner through a Script Property, with safe fallback',()=>{
  const x=siap(),{c,staff}=x,props=c.PropertiesService.getScriptProperties();
  c.Session={getActiveUser:()=>({getEmail:()=> 'owner@test.invalid'})};c.aktifkanCacheOtorisasiPanitia();
  const hit=()=>{const k=x.cari;return (()=>{const a=c.CacheService.getScriptCache().get.length;return a;})();};
  const dir=()=>{let n=0;const before={...x.cari.sheet};c.bacaSesiPanitia_(staff.token);for(const k of Object.keys(x.cari.sheet))if(/^access:(Pengguna|Penugasan_Jenjang|Riwayat_Akses)$/.test(k))n+=(x.cari.sheet[k]-(before[k]||0));return n;};
  props.setProperty('AKSES_CACHE_TTL_DETIK','120');dir();                       // mengisi cache
  x.geser(31000);assert.equal(dir(),0,'dalam 120 detik masih hit');
  x.geser(125000);assert.ok(dir()>0,'setelah 120 detik miss');
  for(const buruk of ['3','9999','abc','']){props.setProperty('AKSES_CACHE_TTL_DETIK',buruk);x.geser(0);dir();x.geser(31000);assert.ok(dir()>0,'nilai tidak valid memakai bawaan 30 detik: '+buruk);}
});
test('timing log shows per-stage milliseconds without token, on a cache miss and on a warm call',()=>{
  const x=siap(),{c,staff,call}=x;call(staff,'muatBerandaIndex');
  let w=x.waktu().pop();assert.ok(w.tahap.auth_penuh>=0&&'direktori' in w.tahap&&'buku_akses' in w.tahap&&'tunggu_lock' in w.tahap);assert.ok(Number.isFinite(w.jalankan_ms));
  c.Session={getActiveUser:()=>({getEmail:()=> 'owner@test.invalid'})};c.aktifkanCacheOtorisasiPanitia();call(staff,'muatBerandaIndex');call(staff,'muatBerandaIndex');
  w=x.waktu().pop();assert.ok('jalur_cepat' in w.tahap);assert.ok(!('direktori' in w.tahap));
  assert.ok(!x.logs.join('\n').includes(staff.token));
});
