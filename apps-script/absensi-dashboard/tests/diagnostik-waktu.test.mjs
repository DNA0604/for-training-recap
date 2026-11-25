import test from 'node:test';import assert from 'node:assert/strict';
import {sessionHarness} from './support/sesi-harness.mjs';
const plain=o=>JSON.parse(JSON.stringify(o));
function siap(){const x=sessionHarness(),baris=[];x.t.c.console={log:(...a)=>baris.push(a.join(' '))};return {...x,baris,waktu:()=>baris.filter(l=>l.startsWith('WAKTU ')).map(l=>JSON.parse(l.slice(6)))};}
test('each gateway call logs one timing line with the RPC name and no token, arguments or personal data',()=>{
  const x=siap(),{staff,call,baris}=x;call(staff,'muatBerandaIndex');
  const w=x.waktu();assert.equal(w.length,1);assert.equal(w[0].rpc,'muatBerandaIndex');assert.equal(w[0].status,'ok');
  assert.ok(Number.isFinite(w[0].total_ms)&&Number.isFinite(w[0].auth_ms)&&w[0].total_ms>=w[0].auth_ms&&w[0].auth_ms>=0);
  const teks=baris.join('\n');assert.ok(!teks.includes(staff.token));assert.ok(!/PST00|Peserta A|19900101/.test(teks));
});
test('a failing call is logged with status galat and the same error is thrown',()=>{
  const x=siap(),{staff,call}=x;
  assert.throws(()=>call(staff,'tambahProgramIndex',{nama:'X',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'log_galat_request_000001'}),/AKSES_DITOLAK|SESI_BERAKHIR/);
  const w=x.waktu();assert.equal(w.length,1);assert.equal(w[0].rpc,'tambahProgramIndex');assert.equal(w[0].status,'galat');
});
test('a grouped dashboard read logs the group and the time of each member',()=>{
  const x=siap(),{admin}=x,r=plain(x.t.c.panggilBacaanDashboardPanitia({token:admin.token,permintaan:[{nama:'muatRekapJPProgramIndex',args:['PRG001']},{nama:'muatNilaiPerilakuProgramIndex',args:['PRG001']}]}));
  assert.equal(r.sukses,true);const w=x.waktu();assert.equal(w.length,1);assert.equal(w[0].rpc,'kelompok');
  assert.deepEqual(w[0].rincian.map(i=>i.rpc),['muatRekapJPProgramIndex','muatNilaiPerilakuProgramIndex']);assert.ok(w[0].rincian.every(i=>Number.isFinite(i.ms)));
});
test('a broken console never breaks an RPC',()=>{
  const x=siap(),{staff,call}=x;x.t.c.console={log(){throw new Error('log rusak');}};
  assert.equal(call(staff,'muatBerandaIndex').sukses!==false,true);
});
