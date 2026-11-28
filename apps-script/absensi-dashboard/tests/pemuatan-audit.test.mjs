import test from 'node:test';import assert from 'node:assert/strict';import {loadingHarness,instrumentLoading,loadingScenarios} from './support/pemuatan-audit-harness.mjs';
function freeze(c){const at=Date.now();c.Date=new Proxy(Date,{get(t,k){return k==='now'?()=>at:Reflect.get(t,k);},construct(t,args){return Reflect.construct(t,args.length?args:[at]);}});}
for(const size of [22,100])test(`read-only scalar reuse preserves all seven Admin results for ${size} mixed-attendance participants`,()=>{
 const h=loadingHarness(size),c=h.t.c,spy=instrumentLoading(h),optimized=c.nilaiHitungBacaan_;freeze(c);
 for(const [name,rpc,...args] of loadingScenarios){spy.reset();const result=h.call(h.admin,rpc,...args),after=spy.snapshot();c.nilaiHitungBacaan_=(key,read)=>read();spy.reset();const expected=h.call(h.admin,rpc,...args),before=spy.snapshot();c.nilaiHitungBacaan_=optimized;assert.deepEqual(result,expected,name);if(name==='recap'||name==='home')assert.ok(after.formatDate<before.formatDate/2,JSON.stringify({name,before,after}));for(const [k,n] of Object.entries(before))if(k.includes('/get'))assert.ok((after[k]||0)<=n,'source reads increased '+k);assert.equal(c.bacaanPermintaanAkses_,null);}
 assert.equal(h.row().nilai,84);
});
test('date parsing and formatting are keyed by exact epoch/time zone/format, return independent Dates, and do not cache failures',()=>{
 const h=loadingHarness(),c=h.t.c,spy=instrumentLoading(h);spy.reset();c.denganBacaanPermintaan_(true,()=>{
  const a=c.parseWaktuAbsensiManual_('2026-10-20 08:00','Asia/Jakarta'),time=a.getTime();a.setFullYear(1999);assert.equal(c.parseWaktuAbsensiManual_('2026-10-20 08:00:00','Asia/Jakarta').getTime(),time);assert.equal(spy.snapshot().parseDate,1);assert.notEqual(c.parseWaktuAbsensiManual_('2026-10-20 08:00','UTC').getTime(),time);
  assert.notEqual(c.formatTanggalBacaan_(new Date(time),'UTC','HH:mm:ss'),c.formatTanggalBacaan_(new Date(time),'Asia/Jakarta','HH:mm:ss'));assert.notEqual(c.formatTanggalBacaan_(new Date(time+1000),'UTC','HH:mm:ss'),c.formatTanggalBacaan_(new Date(time),'UTC','HH:mm:ss'));
  for(let i=0;i<2;i++)assert.throws(()=>c.parseWaktuAbsensiManual_('2026-02-31 08:00','Asia/Jakarta'),/tidak valid/);assert.equal(spy.snapshot().parseDate,4);
 });assert.equal(c.bacaanPermintaanAkses_,null);
});
test('scalar request cache is bounded, preserves zero, ignores mutable objects and is absent for writes',()=>{
 const h=loadingHarness(),c=h.t.c;let reads=0;c.denganBacaanPermintaan_(true,()=>{
  assert.equal(c.nilaiHitungBacaan_('zero',()=>{reads++;return 0;}),0);assert.equal(c.nilaiHitungBacaan_('zero',()=>999),0);assert.equal(reads,1);const a={x:1};c.nilaiHitungBacaan_('object',()=>a);assert.equal(c.nilaiHitungBacaan_('object',()=>2),2);
  for(let i=0;i<2100;i++)c.nilaiHitungBacaan_('key'+i,()=>i);assert.equal(c.bacaanPermintaanAkses_.hitungan.size,2000);
 });for(let i=0;i<2;i++)c.nilaiHitungBacaan_('write',()=>++reads);assert.equal(reads,3);assert.equal(c.bacaanPermintaanAkses_,null);
});
test('lock-time authorization drops scalar results along with sheet snapshots; changed schedules and scopes are live next request',()=>{
 const h=loadingHarness(),c=h.t.c;const before=h.call(h.staff,'muatKehadiranIndex','SES001');h.t.h.patch('Sesi','SES001','id_sesi',{jam_mulai:'07:45'});const after=h.call(h.staff,'muatKehadiranIndex','SES001');assert.equal(after.peserta.find(p=>p.id_keikutsertaan==='KST001').terlambat_menit,before.peserta.find(p=>p.id_keikutsertaan==='KST001').terlambat_menit+15);
 c.denganBacaanPermintaan_(true,()=>{c.nilaiHitungBacaan_('probe',()=>1);c.konteksSesiPanitia_={...c.bacaSesiPanitia_(h.staff.token),token:h.staff.token,method:'muatKehadiranIndex',args:['SES001']};try{c.periksaUlangSesiPanitia_();assert.equal(c.nilaiHitungBacaan_('probe',()=>2),2);}finally{c.konteksSesiPanitia_=null;}});
 const a=h.t.access.records('Penugasan_Jenjang').find(a=>a.id_jenjang==='JEN001');h.t.access.patch('Penugasan_Jenjang',a.id_penugasan,'id_penugasan',{status:'nonaktif'});assert.throws(()=>h.call(h.staff,'muatKehadiranIndex','SES001'),/AKSES_DITOLAK/);assert.equal(c.bacaanPermintaanAkses_,null);
});
test('recap pairing retains duplicate detection and does not discard wrongly linked leave notes',()=>{
 const h=loadingHarness();h.append('Kehadiran',{...h.t.h.records('Kehadiran').find(r=>r.id_kehadiran==='KHD001'),id_kehadiran:'H-DUPLICATE'});assert.throws(()=>h.result(),/duplikat/);
 const v=h.t.h.store.Kehadiran;v.values.pop();v.formulas.pop();h.append('Catatan_Perilaku',{id_catatan:'CROSS-LINK',id_sesi:'SES001',id_keikutsertaan:'K-LOAD-0001',id_kehadiran:'KHD001',id_indikator:'IND001',status_validasi:'disetujui',status_pengurangan_jp:'diperhitungkan'});const r=h.result().peserta.find(p=>p.id_keikutsertaan==='KST001');assert.ok(r.detail.some(s=>s.includes('relasi catatan izin tidak sesuai')));
});
