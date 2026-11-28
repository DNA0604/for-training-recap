import test from 'node:test';import assert from 'node:assert/strict';
import {loadingHarness,instrumentLoading} from './support/pemuatan-audit-harness.mjs';

test('management participant summary returns identical data with fewer source reads and no writes',()=>{
 const h=loadingHarness(100),c=h.t.c,spy=instrumentLoading(h),old=c.pembacaanRinganAkses_,beforeWrites=h.t.h.writes.length;
 c.pembacaanRinganAkses_=name=>name==='muatRingkasanPesertaIndex'?false:old(name);
 spy.reset();const before=h.call(h.admin,'muatRingkasanPesertaIndex','PRG001'),countsBefore=spy.snapshot();
 c.pembacaanRinganAkses_=old;spy.reset();const after=h.call(h.admin,'muatRingkasanPesertaIndex','PRG001'),countsAfter=spy.snapshot();
 assert.deepEqual(after,before);assert.equal(after.peserta.length,10);assert.equal(after.total,101);
 const reads=counts=>Object.entries(counts).filter(([k])=>/\/get(Values|Formulas)$/.test(k)).reduce((n,[,v])=>n+v,0);
 assert.ok(reads(countsAfter)<reads(countsBefore));assert.equal(h.t.h.writes.length,beforeWrites);assert.equal(c.bacaanPermintaanAkses_,null);
});
test('summary snapshots expire at request exit; source and directory changes remain live',()=>{
 const h=loadingHarness(),c=h.t.c;h.call(h.admin,'muatRingkasanPesertaIndex','PRG001');
 h.t.h.patch('Peserta','PST001','id_peserta',{nama_pegawai:'AAA Nama terbaru'});
 assert.equal(h.call(h.admin,'muatRingkasanPesertaIndex','PRG001').peserta[0].nama,'AAA Nama terbaru');
 assert.throws(()=>h.call(h.staff,'muatRingkasanPesertaIndex','PRG001'),/Admin|DITOLAK/);
 const user=h.t.access.records('Pengguna').find(u=>u.peran==='admin_pelatihan');h.t.access.patch('Pengguna',user.id_pengguna,'id_pengguna',{status:'nonaktif'});
 assert.throws(()=>h.call(h.admin,'muatRingkasanPesertaIndex','PRG001'),/SESI_BERAKHIR/);assert.equal(c.bacaanPermintaanAkses_,null);
});
