import test from 'node:test';import assert from 'node:assert/strict';
import {loadingHarness,instrumentLoading} from './support/pemuatan-audit-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
const baris=n=>Array.from({length:n},(_,i)=>({nomor:i+2,nip:'19800101202001'+String(1000+i),nama:'Peserta Impor '+i,unit:'Unit X'}));
const bacaan=s=>Object.entries(s).filter(([k])=>/\/(getValues|getFormulas)$/.test(k)).reduce((n,[,v])=>n+v,0);
function impor(n,id='impor_tahap1_request_01'){
  const h=loadingHarness(22),spy=instrumentLoading(h),pre=plain(h.call(h.admin,'pratinjauImporPesertaIndex','PRG001',baris(n),'JEN001'));
  const d={id_program:'PRG001',id_jenjang:'JEN001',id_permintaan:id,batch:0,baris:pre.baris};
  return {h,spy,d,jalankan:()=>{spy.reset();const hasil=plain(h.call(h.admin,'imporPesertaProgramIndex',d));return {hasil,baca:bacaan(spy.snapshot())};}};
}
const status=(h,tx)=>h.t.h.records('Riwayat_Validasi').filter(r=>r.id_transaksi_perubahan===tx).map(r=>r.status_transaksi);
test('import saves rows and the number of sheet reads does not grow with the batch size',()=>{
  const kecil=impor(1),besar=impor(20),pesertaAwal=besar.h.t.h.records('Peserta').length,anggotaAwal=besar.h.t.h.records('Keikutsertaan').length;
  const a=kecil.jalankan(),b=besar.jalankan();
  assert.equal(b.hasil.baru,20);assert.equal(besar.h.t.h.records('Peserta').length,pesertaAwal+20);assert.equal(besar.h.t.h.records('Keikutsertaan').length,anggotaAwal+20);
  assert.equal(b.baca,a.baca,'pembacaan sheet harus tetap sama untuk 1 dan 20 baris');
  assert.deepEqual(status(besar.h,'IMPOR-PESERTA|impor_tahap1_request_01|0'),['PENDING','SELESAI']);
});
test('completed import batch is idempotent and writes nothing on retry',()=>{
  const x=impor(5),first=x.jalankan(),rows=x.h.t.h.records('Peserta').length;
  const again=x.jalankan();assert.deepEqual(again.hasil,first.hasil);assert.equal(x.h.t.h.records('Peserta').length,rows);
});
test('failed verification leaves a recovery marker; retry never duplicates participants',()=>{
  const x=impor(5),c=x.h.t.c,p0=x.h.t.h.records('Peserta').length,k0=x.h.t.h.records('Keikutsertaan').length,asli=c.verifikasiBanyakWriteKelola_;
  c.verifikasiBanyakWriteKelola_=()=>{throw new Error('verifikasi dipaksa gagal');};
  assert.throws(()=>x.jalankan(),/Batch belum selesai.*verifikasi dipaksa gagal/);
  assert.deepEqual(status(x.h,'IMPOR-PESERTA|impor_tahap1_request_01|0'),['PENDING','PERLU_PEMULIHAN']);
  assert.equal(x.h.t.h.records('Peserta').length,p0+5);assert.equal(x.h.t.h.records('Keikutsertaan').length,k0+5);
  c.verifikasiBanyakWriteKelola_=asli;
  const retry=x.jalankan();assert.equal(retry.hasil.baru,5);
  assert.equal(x.h.t.h.records('Peserta').length,p0+5);assert.equal(x.h.t.h.records('Keikutsertaan').length,k0+5);
  assert.deepEqual(status(x.h,'IMPOR-PESERTA|impor_tahap1_request_01|0'),['PENDING','PERLU_PEMULIHAN','SELESAI']);
});
test('retry completes only the missing rows after a partial write',()=>{
  const x=impor(5),c=x.h.t.c,p0=x.h.t.h.records('Peserta').length,k0=x.h.t.h.records('Keikutsertaan').length,asli=c.verifikasiBanyakWriteKelola_;
  c.verifikasiBanyakWriteKelola_=()=>{throw new Error('putus di tengah');};
  assert.throws(()=>x.jalankan(),/Batch belum selesai/);c.verifikasiBanyakWriteKelola_=asli;
  const tabel=x.h.t.h.store.Keikutsertaan;tabel.values.splice(-5);tabel.formulas.splice(-5); // keikutsertaan belum tertulis
  assert.equal(x.h.t.h.records('Keikutsertaan').length,k0);
  const retry=x.jalankan();assert.equal(retry.hasil.baru,5);
  assert.equal(x.h.t.h.records('Peserta').length,p0+5,'peserta tidak boleh ganda');assert.equal(x.h.t.h.records('Keikutsertaan').length,k0+5);
});
test('session with several breaks stores every row and keeps the audit sequence',()=>{
  const h=loadingHarness(22),d={id_program:'PRG001',id_jenjang:'JEN001',nama:'Sesi Tahap 1',tanggal:'2026-10-20',mulai:'08:00',selesai:'12:00',status_jp:'dihitung',jeda:[{mulai:'09:00',selesai:'09:10',keterangan:'a'},{mulai:'10:00',selesai:'10:10',keterangan:'b'},{mulai:'11:00',selesai:'11:10',keterangan:'c'}],id_permintaan:'sesi_tahap1_request_0001'};
  const sesi0=h.t.h.records('Sesi').length,jeda0=h.t.h.records('Jeda_Sesi').length,r=plain(h.call(h.admin,'tambahSesiIndex',d));
  assert.equal(r.sukses,true);assert.equal(h.t.h.records('Sesi').length,sesi0+1);assert.equal(h.t.h.records('Jeda_Sesi').length,jeda0+3);
  assert.deepEqual(status(h,'BUAT-Sesi|sesi_tahap1_request_0001'),['PENDING','SELESAI']);
  assert.deepEqual(plain(h.call(h.admin,'tambahSesiIndex',d)),r);assert.equal(h.t.h.records('Jeda_Sesi').length,jeda0+3);
});
test('program creation writes Program and its first Jenjang once',()=>{
  const h=loadingHarness(22),d={nama:'Program Tahap 1',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'program_tahap1_request_01'};
  const p0=h.t.h.records('Program').length,j0=h.t.h.records('Jenjang').length,r=plain(h.call(h.admin,'tambahProgramIndex',d));
  assert.equal(h.t.h.records('Program').length,p0+1);assert.equal(h.t.h.records('Jenjang').length,j0+1);
  assert.deepEqual(plain(h.call(h.admin,'tambahProgramIndex',d)),r);assert.equal(h.t.h.records('Program').length,p0+1);
  assert.deepEqual(status(h,'BUAT-Program|program_tahap1_request_01'),['PENDING','SELESAI']);
});
