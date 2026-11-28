import test from 'node:test';import assert from 'node:assert/strict';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
function siap(){
  const x=sessionHarness(),{t}=x,c=t.c,bacaan={};c.console={log(){}};
  for(const [lb,b] of [['main',t.h.ss],['access',t.access.ss]]){const get=b.getSheetByName;b.getSheetByName=n=>{const s=get(n);if(!s||s.__h)return s;s.__h=true;const dr=s.getDataRange;
    s.getDataRange=()=>{const r=dr();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{const k=lb+':'+n;bacaan[k]=(bacaan[k]||0)+1;return f();};}return r;};return s;};}
  const isi=new Map();c.CacheService={getScriptCache:()=>({get:k=>{const e=isi.get(k);return e&&e.sampai>c.Date.now()?e.nilai:null;},put:(k,v,ttl)=>{isi.set(k,{nilai:v,sampai:c.Date.now()+ttl*1000});},remove:k=>isi.delete(k)})};
  const ukur=fn=>{for(const k of Object.keys(bacaan))delete bacaan[k];let galat=null,hasil;try{hasil=fn();}catch(e){galat=e;}return {galat,hasil,bacaan:{...bacaan}};};
  const nyalakanCache=()=>{x.asOwner();c.aktifkanCacheOtorisasiPanitia();};
  return {...x,c,t,ukur,bacaan,nyalakanCache};
}
// ---------------- 7A ----------------
test('7A: the correction list reads no large table and returns an empty list when there are no requests',()=>{
  const x=siap(),r=x.ukur(()=>x.call(x.admin,'muatPengajuanKoreksiPanitia'));
  assert.equal(r.galat,null);assert.deepEqual(plain(r.hasil),{sukses:true,pengajuan:[]});
  for(const n of ['main:Peserta','main:Keikutsertaan','main:Sesi'])assert.ok(!r.bacaan[n],n+' tidak boleh dibaca tanpa pengajuan');
});
test('7A: with requests it still resolves participant and session names',()=>{
  const x=siap(),{staff,admin,call,correction,legacy}=x;legacy(staff,correction());
  const r=x.ukur(()=>call(admin,'muatPengajuanKoreksiPanitia')),p=plain(r.hasil).pengajuan;
  assert.equal(r.galat,null);assert.equal(p.length,1);
  const asli=x.t.h.records('Peserta').find(q=>q.id_peserta==='PST001'),sesi=x.t.h.records('Sesi').find(q=>q.id_sesi===p[0].id_sesi);
  assert.equal(p[0].nama_peserta,asli.nama_pegawai);assert.equal(p[0].nama_sesi,sesi.nama_sesi);
  for(const n of ['main:Peserta','main:Keikutsertaan','main:Sesi'])assert.ok(r.bacaan[n]>=1,n);
});
// ---------------- 7B ----------------
test('7B: with the cache warm, an Admin gateway call does not read the Jenjang list unless it is accessed',()=>{
  const x=siap();x.nyalakanCache();x.c.bacaSesiPanitia_(x.admin.token);
  const lazy=x.ukur(()=>x.c.bacaSesiPanitia_(x.admin.token,false,true));assert.equal(lazy.galat,null);
  assert.ok(!lazy.bacaan['main:Program']&&!lazy.bacaan['main:Jenjang'],'tidak membaca Program/Jenjang sebelum properti diakses');
  const nilai=x.ukur(()=>lazy.hasil.jenjang),penuh=plain(x.c.bacaSesiPanitia_(x.admin.token).jenjang);
  assert.ok(nilai.bacaan['main:Program']>=1,'dibaca saat diakses');assert.deepEqual(plain(lazy.hasil.jenjang),penuh,'nilai identik dengan jalur penuh');
  const ulang=x.ukur(()=>lazy.hasil.jenjang);assert.deepEqual(ulang.bacaan,{},'dihitung sekali');
});
test('7B: restricted roles and the boot response still get the full Jenjang scope eagerly',()=>{
  const x=siap();x.nyalakanCache();x.c.bacaSesiPanitia_(x.staff.token);
  const staff=x.ukur(()=>x.c.bacaSesiPanitia_(x.staff.token,false,true));
  assert.ok(staff.bacaan['main:Program']>=1&&staff.bacaan['main:Jenjang']>=1,'Petugas membaca daftar Jenjang langsung');assert.equal(staff.hasil.jenjang.length,1);
  const boot=plain(x.c.muatSesiAplikasiPanitia(x.admin.token));assert.ok(Array.isArray(boot.jenjang),'respons boot memuat jenjang');
});
test('7B: an Admin gateway write still blocks when the account is revoked through the app',()=>{
  const x=siap(),{c,admin,call}=x;x.nyalakanCache();call(admin,'muatBerandaIndex');
  const u=call(admin,'muatManajemenAksesPanitia').pengguna.find(p=>p.id===x.u.id);
  call(admin,'simpanPenggunaPanitia',{id:u.id,nama:u.nama,email:u.email,peran:u.peran,status:'nonaktif',versi:u.versi,id_permintaan:'tahap7_nonaktif_request_0001'});
  assert.throws(()=>call(x.staff,'muatBerandaIndex'),/SESI_BERAKHIR/);
  assert.equal(c.konteksSesiPanitia_,null);
});
