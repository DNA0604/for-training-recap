import test from 'node:test';
import assert from 'node:assert/strict';
import {rekapHarness,plain} from './support/rekap-evaluasi-harness.mjs';

function fixture({absent=true}={}){
  const h=rekapHarness();
  if(absent){const v=h.t.h.store.Kehadiran.values,at=v[0].indexOf('id_kehadiran');h.t.h.put('Kehadiran',v.filter((r,i)=>i===0||r[at]!=='KHD001'));}
  const data=(patch={})=>({id_sesi:'SES001',id_keikutsertaan:'KST001',mulai:'2026-10-20T08:00',selesai:'2026-10-20T09:30',alasan:'Izin tidak mengikuti sesi penuh',dasar:'Pemberitahuan peserta',...patch});
  const save=(patch={},who=h.staff)=>h.call(who,'simpanIzinIndex',data(patch));
  return {...h,data,save};
}

test('staff can record full-session leave without attendance and without granting presence, JP or approved behavior points',()=>{
  const h=fixture(),before=plain(h.t.h.store.Kehadiran);
  assert.equal(h.save({petugas:'FORGED',status_validasi:'disetujui',poin_disahkan:100}).sukses,true);
  assert.deepEqual(plain(h.t.h.store.Kehadiran),before);
  const note=h.t.h.records('Catatan_Perilaku')[0];
  assert.equal(note.id_kehadiran,'');assert.equal(note.id_sesi,'SES001');assert.equal(note.id_keikutsertaan,'KST001');
  assert.equal(note.status_validasi,'belum_divalidasi');assert.equal(note.poin_disahkan,'');
  assert.ok(note.sumber_catatan.includes('petugas@gmail.com'));assert.ok(!note.sumber_catatan.includes('FORGED'));
  assert.equal(h.call(h.staff,'muatDaftarIzinIndex','SES001').catatan.length,1);
  const attendance=h.call(h.staff,'muatKehadiranIndex','SES001');
  assert.equal(attendance.ringkasan.izin,1);assert.equal(attendance.peserta[0].id_kehadiran,'');assert.equal(attendance.peserta[0].jp,null);
  const recap=h.call(h.staff,'muatRekapJPProgramIndex','PRG001');
  assert.ok(!JSON.stringify(recap).includes('NaN'));
});

test('Admin may record leave for an unscanned participant while Pengajar cannot save or upload leave',()=>{
  const h=fixture();assert.equal(h.save({},h.admin).sukses,true);
  for(const method of ['simpanIzinIndex','unggahBuktiIndex'])assert.throws(()=>h.call(h.teacher,method,{...h.data(),jenis:'izin'}),/AKSES_DITOLAK/);
});

test('existing attendance with no scan remains blank and only its JP recalculation fields change',()=>{
  const h=fixture({absent:false});h.t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:'',waktu_datang_terverifikasi:'',waktu_pulang_terverifikasi:''});
  const person=h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0];
  h.save({id_kehadiran:person.id_kehadiran,versi:person.versi});
  const row=h.t.h.records('Kehadiran').find(r=>r.id_kehadiran==='KHD001');
  assert.equal(row.waktu_datang,'');assert.equal(row.waktu_pulang,'');assert.equal(row.status_perhitungan_ulang,'menunggu_perhitungan');assert.equal(row.jp_diakui_presisi,'');
});

test('legacy attendance-ID clients retain version protection and partial-leave JP invalidation',()=>{
  const h=fixture({absent:false}),view=h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0];
  const result=h.call(h.staff,'simpanIzinIndex',{id_kehadiran:view.id_kehadiran,versi:view.versi,mulai:'2026-10-20T08:10',selesai:'2026-10-20T08:20',alasan:'Izin sebentar'});
  assert.equal(result.sukses,true);assert.equal(h.t.h.records('Catatan_Perilaku')[0].id_kehadiran,'KHD001');
  assert.throws(()=>h.call(h.staff,'simpanIzinIndex',{id_kehadiran:view.id_kehadiran,versi:view.versi,mulai:'2026-10-20T08:20',selesai:'2026-10-20T08:30',alasan:'Usang'}),/Data sudah berubah/);
});

test('cross-program/Jenjang, inactive registrations and mixed attendance IDs cannot create notes',()=>{
  for(const patch of [{id_sesi:'SES003',id_keikutsertaan:'KST003'},{id_sesi:'SES002',id_keikutsertaan:'KST002'},{id_keikutsertaan:'KST003'},{id_kehadiran:'KHD003'}]){
    const h=fixture(),before=plain(h.t.h.store);assert.throws(()=>h.save(patch),/AKSES_DITOLAK|Relasi|Target/);assert.deepEqual(plain(h.t.h.store),before);
    assert.throws(()=>h.call(h.staff,'unggahBuktiIndex',{...h.data(patch),jenis:'izin'}),/AKSES_DITOLAK|Relasi|Target/);
  }
  const h=fixture();h.t.h.patch('Keikutsertaan','KST001','id_keikutsertaan',{status_keikutsertaan:'batal'});
  assert.throws(()=>h.save(),/tidak terdaftar aktif/);
});

test('invalid/out-of-session leave ranges fail before any operational write',()=>{
  for(const patch of [{mulai:'2026-10-20T07:59'},{selesai:'2026-10-20T09:31'},{selesai:'2026-10-20T08:00'},{mulai:'2026-10-21T08:00',selesai:'2026-10-21T09:30'},{mulai:'invalid'}]){
    const h=fixture(),before=plain(h.t.h.store);assert.throws(()=>h.save(patch));assert.deepEqual(plain(h.t.h.store),before);
  }
});

test('pair-bound evidence remains stable if attendance is added after upload, and rejects a different target',()=>{
  const h=fixture(),d=h.data();
  const target=h.t.c.targetBukti_({...d,jenis:'izin'});assert.equal(target,'IZIN|SES001|KST001');
  h.append('Kehadiran',{id_kehadiran:'KHD-NEW',id_sesi:'SES001',id_keikutsertaan:'KST001'});
  assert.equal(h.t.c.targetBukti_({...d,jenis:'izin'}),target);
  assert.throws(()=>h.t.c.targetBukti_({...d,jenis:'izin',id_kehadiran:'KHD003'}),/Relasi/);
  let checked;h.t.c.buktiDenganLampiran_=(text,id,scope)=>{checked=scope;return text;};
  h.save({id_bukti:'synthetic-proof'});assert.equal(checked,target);
});

test('the same leave cannot be duplicated after a later attendance record appears',()=>{
  const h=fixture();h.save();h.append('Kehadiran',{id_kehadiran:'KHD-NEW',id_sesi:'SES001',id_keikutsertaan:'KST001'});
  const before=plain(h.t.h.store);assert.throws(()=>h.save(),/sama sudah dicatat/);assert.deepEqual(plain(h.t.h.store),before);
});

test('a note-only leave is included in the session verification packet and can be approved without creating attendance',()=>{
  const h=fixture();h.save();const before=plain(h.t.h.store.Kehadiran),view=h.call(h.staff,'muatVerifikasiSesiPanitia','SES001');
  assert.equal(view.ringkasan.izin,1);
  const p=h.call(h.staff,'ajukanVerifikasiSesiPanitia',{id_sesi:'SES001',versi:view.versi,catatan:'Izin satu sesi penuh diperiksa'});
  h.call(h.admin,'putuskanVerifikasiSesiPanitia',{id:p.id,keputusan:'setujui',alasan:'Bukti sesuai'});
  assert.equal(h.t.h.records('Catatan_Perilaku')[0].status_validasi,'disetujui');
  assert.deepEqual(plain(h.t.h.store.Kehadiran),before);
  h.run();const rows=h.evalBook.records('Catatan_Sikap_Perilaku');assert.ok(rows.some(r=>Object.values(r).includes('IZIN_SESI')));
});

test('attendance added after earlier partial/full leave subtracts the interval by session/membership',()=>{
  for(const [patch,minutes] of [[{mulai:'2026-10-20T08:10',selesai:'2026-10-20T08:20'},80],[{},0]]){
    const h=fixture();h.save(patch);
    h.append('Kehadiran',{id_kehadiran:'KHD-NEW',id_sesi:'SES001',id_keikutsertaan:'KST001',waktu_datang:h.t.h.date('2026-10-20T08:00:00'),waktu_pulang:h.t.h.date('2026-10-20T09:30:00')});
    h.call(h.admin,'hitungJPSesiIndex','SES001');
    const row=h.t.h.records('Kehadiran').find(r=>r.id_kehadiran==='KHD-NEW');
    assert.equal(row.durasi_diakui_menit,minutes);assert.equal(row.jp_diakui_presisi,minutes/45);
  }
});

test('assignment revocation while waiting for the leave write lock prevents an unscanned-participant note',()=>{
  const h=fixture(),before=plain(h.t.h.store),original=h.t.c.LockService.getScriptLock;let count=0;
  h.t.c.LockService.getScriptLock=()=>{const lock=original(),wait=lock.waitLock;lock.waitLock=(...args)=>{if(++count===2){const r=h.t.access.records('Penugasan_Jenjang').find(r=>r.id_jenjang==='JEN001');h.t.access.patch('Penugasan_Jenjang',r.id_penugasan,'id_penugasan',{status:'nonaktif'});}return wait(...args);};return lock;};
  assert.throws(()=>h.save(),/AKSES_DITOLAK|SESI_BERAKHIR/);assert.deepEqual(plain(h.t.h.store),before);
});

test('an interrupted note-only leave keeps an actionable audit and blocks a fresh leave on the same target',()=>{
  const h=fixture();let failed=false;
  h.t.h.fault(e=>{if(!failed&&e.name==='Catatan_Perilaku'&&e.op==='before'){failed=true;throw Error('Simulasi gagal tulis');}});
  assert.throws(()=>h.save(),/perlu diperiksa/);h.t.h.fault(()=>{});
  const before=plain(h.t.h.store);assert.throws(()=>h.save({mulai:'2026-10-20T08:10'}),/transaksi tertunda/);
  assert.deepEqual(plain(h.t.h.store),before);assert.equal(h.t.h.records('Catatan_Perilaku').length,0);
});
