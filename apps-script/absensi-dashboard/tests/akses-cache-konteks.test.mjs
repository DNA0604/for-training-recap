import test from 'node:test';import assert from 'node:assert/strict';
import {loadingHarness,instrumentLoading} from './support/pemuatan-audit-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const DIREKTORI=/^access\/(Pengguna|Penugasan_Jenjang|Riwayat_Akses)\//;
function siap(){
  const h=loadingHarness(22),spy=instrumentLoading(h),c=h.t.c,k={lock:0};
  const ambil=c.LockService.getScriptLock;c.LockService.getScriptLock=()=>{const l=ambil(),w=l.waitLock.bind(l);l.waitLock=(...a)=>{k.lock++;return w(...a);};return l;};
  const pemilik=()=>{c.Session={getActiveUser:()=>({getEmail:()=> 'owner@test.invalid'})};};
  const aktif=()=>{pemilik();return plain(c.aktifkanCacheOtorisasiPanitia());};
  const ukur=fn=>{spy.reset();k.lock=0;const hasil=plain(fn());const s=spy.snapshot();return {hasil,openById:s.openById||0,getOwner:s.getOwner||0,lock:k.lock,direktori:Object.entries(s).filter(([n])=>DIREKTORI.test(n)).reduce((a,[,v])=>a+v,0)};};
  const geser=ms=>{const real=Date;c.Date=new Proxy(real,{get:(t,p)=>p==='now'?()=>real.now()+ms:Reflect.get(t,p),construct:(t,a)=>Reflect.construct(t,a.length?a:[real.now()+ms])});};
  const edit=(sheet,id,kolom,nilai)=>{const t=h.t.access.store[sheet],head=t.values[0],baris=t.values.findIndex((r,i)=>i>0&&r[head.indexOf(Object.keys({id_pengguna:1,id_penugasan:1}).find(x=>head.includes(x)))]===id);assert.ok(baris>0,'baris tidak ditemukan');t.values[baris][head.indexOf(kolom)]=nilai;};
  return {h,c,spy,ukur,aktif,pemilik,geser,edit};
}
const konteks=(x,who)=>x.c.bacaSesiPanitia_(who.token);
test('cache is off by default: every call reads the directory',()=>{
  const x=siap(),a=x.ukur(()=>konteks(x,x.h.staff)),b=x.ukur(()=>konteks(x,x.h.staff));
  assert.ok(a.direktori>0&&b.direktori===a.direktori&&b.openById>0&&b.getOwner>0&&b.lock>0);
});
test('warm call returns the same context and skips directory reads, owner checks and the lock',()=>{
  const x=siap();
  for(const [nama,who] of [['admin',x.h.admin],['staff',x.h.staff],['teacher',x.h.teacher]]){
    const penuh=x.ukur(()=>konteks(x,who));x.aktif();konteks(x,who); // isi cache
    const hangat=x.ukur(()=>konteks(x,who));
    assert.deepEqual(hangat.hasil,penuh.hasil,'konteks harus identik: '+nama);
    assert.ok(penuh.direktori>0&&penuh.openById>0&&penuh.getOwner>0&&penuh.lock>0,'jalur penuh membaca direktori: '+nama);
    assert.equal(hangat.direktori,0,'tidak boleh membaca direktori: '+nama);assert.equal(hangat.lock,0);
    // Penugasan sesi Pengajar sengaja tetap diperiksa langsung (buku evaluasi); Admin/Petugas tidak membuka spreadsheet mana pun.
    if(nama!=='teacher'){assert.equal(hangat.openById,0);assert.equal(hangat.getOwner,0);}
  }
});
test('deactivating an account through the app takes effect on the next call',()=>{
  const x=siap();x.aktif();konteks(x,x.h.staff);
  const u=x.h.call(x.h.admin,'muatManajemenAksesPanitia').pengguna.find(p=>p.id===x.h.u.id);
  x.h.call(x.h.admin,'simpanPenggunaPanitia',{id:u.id,nama:u.nama,email:u.email,peran:u.peran,status:'nonaktif',versi:u.versi,id_permintaan:'nonaktifkan_cache_request_01'});
  assert.throws(()=>konteks(x,x.h.staff),/SESI_BERAKHIR/);
});
test('revoking an assignment through the app updates the Jenjang scope immediately',()=>{
  const x=siap();x.aktif();assert.equal(konteks(x,x.h.staff).jenjang.length,1);
  const p=x.h.call(x.h.admin,'muatManajemenAksesPanitia').penugasan.find(r=>r.pengguna===x.h.u.id);
  x.h.call(x.h.admin,'simpanPenugasanPanitia',{pengguna:x.h.u.id,program:p.program,jenjang:p.jenjang,status:'nonaktif',versi:p.versi,id_permintaan:'cabut_penugasan_cache_req_1'});
  assert.equal(konteks(x,x.h.staff).jenjang.length,0);
});
test('a pending access transaction blocks everyone immediately',()=>{
  const x=siap();x.aktif();konteks(x,x.h.staff);
  x.c.auditAkses_(x.c.bukuAkses_(),{sheet:'Pengguna',id:'U-UJI',action:'uji',before:null,tx:'AKS-uji|pending_cache_request_0001'},'PENDING','owner@test.invalid');
  assert.throws(()=>konteks(x,x.h.staff),/AKSES_DITAHAN/);assert.throws(()=>konteks(x,x.h.admin),/AKSES_DITAHAN/);
});
test('logout revokes the stored session immediately',()=>{
  const x=siap();x.aktif();konteks(x,x.h.staff);x.c.keluarAplikasiPanitia(x.h.staff.token);
  assert.throws(()=>konteks(x,x.h.staff),/SESI_BERAKHIR/);
});
test('manual spreadsheet edits are honored only after the TTL, also at the write re-check (stage 5B)',()=>{
  const x=siap();x.aktif();const awal=konteks(x,x.h.staff);
  x.edit('Pengguna',x.h.u.id,'status','nonaktif'); // pengeditan manual langsung di spreadsheet
  assert.deepEqual(konteks(x,x.h.staff),awal,'dalam batas TTL, cache masih dipakai (dibatasi dan terdokumentasi)');
  x.c.konteksSesiPanitia_={token:x.h.staff.token,method:'muatBerandaIndex',args:[]};
  try{
    assert.doesNotThrow(()=>x.c.periksaUlangSesiPanitia_(),'Tahap 5B: dalam batas TTL, pemeriksaan ulang memakai cache berversi (batas terdokumentasi)');
    x.geser((x.c.TTL_KONTEKS_AKSES_DETIK_+1)*1000);
    assert.throws(()=>x.c.periksaUlangSesiPanitia_(),/SESI_BERAKHIR/,'setelah TTL pemeriksaan ulang kembali langsung ke direktori');
  }finally{x.c.konteksSesiPanitia_=null;}
});

test('after the TTL a manual edit is enforced',()=>{
  const x=siap();x.aktif();konteks(x,x.h.staff);x.edit('Pengguna',x.h.u.id,'status','nonaktif');
  x.geser((x.c.TTL_KONTEKS_AKSES_DETIK_+1)*1000);assert.throws(()=>konteks(x,x.h.staff),/SESI_BERAKHIR/);
});
test('only the spreadsheet owner can switch the cache on or off; switching off restores direct checks',()=>{
  const x=siap();x.c.Session={getActiveUser:()=>({getEmail:()=> 'bukan.pemilik@test.invalid'})};
  assert.throws(()=>x.c.aktifkanCacheOtorisasiPanitia(),/pemilik/);assert.throws(()=>x.c.matikanCacheOtorisasiPanitia(),/pemilik/);
  x.aktif();konteks(x,x.h.staff);assert.equal(x.ukur(()=>konteks(x,x.h.staff)).direktori,0);
  x.pemilik();x.c.matikanCacheOtorisasiPanitia();assert.ok(x.ukur(()=>konteks(x,x.h.staff)).direktori>0);
});
