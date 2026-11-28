import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionHarness,plain} from './support/sesi-harness.mjs';
import {pengajarHarness} from './support/pengajar-harness.mjs';

const recap=[{nama:'muatRekapJPProgramIndex',args:['PRG001']},{nama:'muatNilaiPerilakuProgramIndex',args:['PRG001']}];
const history=[{nama:'muatPengajuanKoreksiPanitia',args:[]},{nama:'muatDaftarVerifikasiSesiPanitia',args:[]}];
const batch=(h,user,calls)=>plain(h.t.c.panggilBacaanDashboardPanitia({token:user.token,permintaan:calls}));
function countReads(h){let count=0;for(const book of [h.t.h.ss,h.t.access.ss]){const lookup=book.getSheetByName;book.getSheetByName=name=>{const sheet=lookup(name);if(!sheet)return sheet;const range=sheet.getDataRange;sheet.getDataRange=()=>{const r=range();for(const name of ['getValues','getFormulas']){const read=r[name];r[name]=()=>{count++;return read();};}return r;};return sheet;};}return {get:()=>count,clear:()=>{count=0;}};}

test('grouped recap/history matches individual results for Admin and scoped staff with fewer source reads',()=>{
 const h=sessionHarness(),counts=countReads(h);
 for(const user of [h.admin,h.staff])for(const calls of [recap,history]){
  counts.clear();const expected=calls.map(p=>({sukses:true,data:h.call(user,p.nama,...p.args)})),before=counts.get();
  counts.clear();const actual=batch(h,user,calls);assert.deepEqual(actual,{sukses:true,hasil:expected});assert.ok(counts.get()<before);
  assert.equal(h.t.c.bacaanPermintaanAkses_,null);assert.equal(h.t.c.konteksSesiPanitia_,null);
 }
});
test('each grouped member is authorized; an allowed result never grants a different program or Jenjang',()=>{
 const h=sessionHarness(),r=batch(h,h.staff,[...recap,{nama:'muatRekapJPProgramIndex',args:['PRG002']}]);
 assert.equal(r.hasil[2].sukses,false);assert.match(r.hasil[2].pesan,/AKSES_DITOLAK/);
 assert.equal(r.hasil[0].sukses,true);assert.ok(!JSON.stringify(r).includes('SECRET-'));assert.equal(r.hasil[0].data.peserta.length,1);
});
test('Pengajar keeps its existing session-only recap scope and cannot retrieve staff verification/history',()=>{
 const h=pengajarHarness(),r=batch(h,h.teacher,[...recap,...history]);
 assert.equal(r.hasil[0].sukses,true);assert.equal(r.hasil[1].sukses,true);assert.equal(r.hasil[0].data.peserta.length,1);
 for(const item of r.hasil.slice(2)){assert.equal(item.sukses,false);assert.match(item.pesan,/Pengajar/);}
 assert.deepEqual(r.hasil[0].data,h.call(h.teacher,recap[0].nama,...recap[0].args));
});
test('a failed source returns an individual error, never fabricated empty statistics, and leaves the next request fresh',()=>{
 const h=sessionHarness(),original=h.t.c.muatRekapJPProgramIndex;
 h.t.c.muatRekapJPProgramIndex=()=>{throw Error('Sheet JP unavailable');};
 const r=batch(h,h.staff,recap);assert.deepEqual(r.hasil[0],{sukses:false,pesan:'Sheet JP unavailable'});assert.equal(r.hasil[1].sukses,true);
 h.t.c.muatRekapJPProgramIndex=original;assert.equal(batch(h,h.staff,recap).hasil[0].sukses,true);
 assert.equal(h.t.c.bacaanPermintaanAkses_,null);assert.equal(h.t.c.konteksSesiPanitia_,null);
});
test('next grouped request sees changed source, revoked assignments and disabled accounts',()=>{
 const h=sessionHarness();batch(h,h.staff,recap);h.t.h.patch('Peserta','PST001','id_peserta',{nama_pegawai:'Nama diperbarui'});
 assert.equal(batch(h,h.staff,recap).hasil[0].data.peserta[0].nama,'Nama diperbarui');
 const assignment=h.t.access.records('Penugasan_Jenjang').find(r=>r.id_jenjang==='JEN001');h.t.access.patch('Penugasan_Jenjang',assignment.id_penugasan,'id_penugasan',{status:'nonaktif'});
 assert.match(batch(h,h.staff,recap).hasil[0].pesan,/AKSES_DITOLAK/);
 h.t.access.patch('Pengguna',h.u.id,'id_pengguna',{status:'nonaktif'});assert.throws(()=>batch(h,h.staff,recap),/SESI_BERAKHIR/);
 assert.equal(h.t.c.bacaanPermintaanAkses_,null);assert.equal(h.t.c.konteksSesiPanitia_,null);
});
test('unknown, expired and logged-out sessions cannot use grouped reads',()=>{
 const h=sessionHarness();assert.throws(()=>batch(h,{token:'a'.repeat(64)},recap),/SESI_BERAKHIR/);
 h.t.c.keluarAplikasiPanitia(h.staff.token);assert.throws(()=>batch(h,h.staff,recap),/SESI_BERAKHIR/);
 const key=h.t.c.kunciSesiTersimpan_(h.admin.token),props=h.t.c.PropertiesService.getScriptProperties(),r=JSON.parse(props.getProperty(key));r.expires=Date.now()-1;props.setProperty(key,JSON.stringify(r));assert.throws(()=>batch(h,h.admin,recap),/SESI_BERAKHIR/);
});
test('malformed groups and all write/export/evaluation endpoints are rejected before any execution',()=>{
 const h=sessionHarness();let called=false;h.t.c.simpanIzinIndex=()=>{called=true;};
 for(const calls of [[],Array(7).fill(history[0]),[{nama:'simpanIzinIndex',args:[]}],[...history,{nama:'simpanIzinIndex',args:[]}],[{nama:'buatPDFLaporanProgram',args:['PRG001']}],[{nama:'muatEvaluasiPengajarSesi',args:['SES001']}],[{nama:'toString',args:[]}],[{nama:'muatRekapJPProgramIndex',args:[]}],[{nama:'muatRekapJPProgramIndex',args:[{}]}],[{nama:'muatRekapJPProgramIndex',args:['x'.repeat(201)]}],[{nama:'muatPengajuanKoreksiPanitia',args:['PRG001']}],[null]])assert.throws(()=>batch(h,h.admin,calls),/tidak valid/);
 assert.equal(called,false);assert.equal(h.t.c.konteksSesiPanitia_,null);assert.equal(h.t.c.bacaanPermintaanAkses_,null);
});
test('pending access transaction stops the whole group; nested gateways cannot replace the active identity',()=>{
 const h=sessionHarness(),original=h.t.c.muatRekapJPProgramIndex;
 h.t.c.muatRekapJPProgramIndex=()=>{throw Error('AKSES_DITAHAN: Pulihkan transaksi');};assert.throws(()=>batch(h,h.staff,recap),/AKSES_DITAHAN/);
 assert.equal(h.t.c.konteksSesiPanitia_,null);assert.equal(h.t.c.bacaanPermintaanAkses_,null);
 h.t.c.muatRekapJPProgramIndex=()=>batch(h,h.admin,history);const r=batch(h,h.staff,recap);assert.match(r.hasil[0].pesan,/bertingkat/);h.t.c.muatRekapJPProgramIndex=original;assert.equal(batch(h,h.staff,recap).hasil[0].sukses,true);
});
