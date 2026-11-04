import test from 'node:test';
import assert from 'node:assert/strict';
import {rekapHarness, plain} from './support/rekap-evaluasi-harness.mjs';

function setup({kode='MAKAN_SAAT_SESI',jenis='negatif',poin=-1,status='aktif',config='{aturan lama bukan JSON}'}={}) {
  const h=rekapHarness();
  h.columns('Indikator_Perilaku',['poin_per_kejadian','updated_at']);
  h.append('Indikator_Perilaku',{
    id_indikator:'IND099',kode_indikator:kode,definisi_indikator:'Peserta makan pada saat sesi berlangsung',
    jenis_indikator:jenis,poin_per_kejadian:poin,status_indikator:status,
  });
  h.append('Aturan_Penilaian',{
    id_aturan_penilaian:'RULE-LEGACY',kode_aturan:'LAMA',status_aturan:'nonaktif',
    konfigurasi_indikator:config,konfigurasi_perhitungan:'{}',
  });
  const edit=(patch={},id='IND099',request='edit_indicator_status_request_001')=>{
    const view=h.call(h.admin,'muatEditDataIndex','Indikator_Perilaku',id);
    return {jenis:'Indikator_Perilaku',id,versi:view.versi,values:{...view.values,...patch},
      alasan:'Tidak diperlukan kembali',id_permintaan:request,jeda:[]};
  };
  const save=d=>h.call(h.admin,'simpanEditDataIndex',d);
  const record=()=>h.t.h.records('Indikator_Perilaku').find(r=>r.id_indikator==='IND099');
  return {...h,edit,save,record};
}

test('status-only deactivation survives malformed/blank legacy rules and preserves notes, rules, attendance and external files',()=>{
  for(const config of ['', '{aturan lama bukan JSON}', 'null']) {
    const h=setup({config});h.note({id_indikator:'IND099'});
    const names=['Aturan_Penilaian','Catatan_Perilaku','Kehadiran','Program','Sesi'];
    const before=plain([names.map(n=>h.t.h.store[n]),h.t.access.store,h.evalBook.store]);
    const result=h.save(h.edit({status_indikator:'nonaktif'}));
    assert.equal(result.sukses,true);assert.equal(h.record().status_indikator,'nonaktif');
    assert.deepEqual(plain([names.map(n=>h.t.h.store[n]),h.t.access.store,h.evalBook.store]),before);
    assert.equal(h.t.h.records('Riwayat_Validasi').filter(r=>r.id_transaksi_perubahan==='EDIT|edit_indicator_status_request_001').at(-1).status_transaksi,'SELESAI');
  }
});

test('a disabled indicator can be reactivated without parsing an unrelated legacy rule',()=>{
  const h=setup({status:'nonaktif'});
  h.save(h.edit({status_indikator:'aktif'}));
  assert.equal(h.record().status_indikator,'aktif');
});

test('default-point edits do not reinterpret old rule versions or rewrite existing notes',()=>{
  const h=setup();h.note({id_indikator:'IND099',poin_disahkan:-1});
  const before=plain([h.t.h.store.Aturan_Penilaian,h.t.h.store.Catatan_Perilaku]);
  h.save(h.edit({poin_per_kejadian:'-2'}));
  assert.equal(h.record().poin_per_kejadian,-2);
  assert.deepEqual(plain([h.t.h.store.Aturan_Penilaian,h.t.h.store.Catatan_Perilaku]),before);
});

test('used default indicators except IZIN_SESI can be disabled without altering their meaning',()=>{
  const h=setup({kode:'INISIATIF',jenis:'positif',poin:2});h.note({id_indikator:'IND099'});
  h.save(h.edit({status_indikator:'nonaktif'}));
  assert.equal(h.record().status_indikator,'nonaktif');
  assert.equal(h.record().jenis_indikator,'positif');
});

test('meaning changes still reject unreadable rules and indicators referenced by notes or valid old rules before any write',()=>{
  for(const mode of ['invalid-rule','rule-reference','note-reference']) {
    const h=setup({config:mode==='invalid-rule'?'{broken}':mode==='rule-reference'?'{"MAKAN_SAAT_SESI":-1}':'{}'});
    if(mode==='note-reference')h.note({id_indikator:'IND099'});
    const d=h.edit({definisi_indikator:'Makna berbeda'}),before=plain(h.t.h.store);
    assert.throws(()=>h.save(d),mode==='invalid-rule'?/Konfigurasi aturan penilaian tidak valid/:/sudah digunakan/);
    assert.deepEqual(plain(h.t.h.store),before);
  }
});

test('IZIN_SESI, duplicate active codes, stale snapshots and role checks still reject edits',()=>{
  const h=setup();const izin=h.edit({status_indikator:'nonaktif',poin_per_kejadian:'-2'},'IND001');
  assert.throws(()=>h.save(izin),/IZIN_SESI harus tetap aktif/);
  const d=h.edit({status_indikator:'nonaktif'});
  for(const who of [h.teacher,h.staff])assert.throws(()=>h.call(who,'simpanEditDataIndex',d),/AKSES_DITOLAK/);
  h.t.h.patch('Indikator_Perilaku','IND099','id_indikator',{definisi_indikator:'Diubah admin lain'});
  assert.throws(()=>h.save(d),/Data berubah/);
  const h2=setup({status:'nonaktif'});h2.append('Indikator_Perilaku',{...h2.record(),id_indikator:'IND100',status_indikator:'aktif'});
  assert.throws(()=>h2.save(h2.edit({status_indikator:'aktif'})),/Sudah ada versi aktif/);
});

test('repeating a successful status edit is idempotent and keeps a single completed audit transaction',()=>{
  const h=setup(),d=h.edit({status_indikator:'nonaktif'});h.save(d);
  const before=plain(h.t.h.store);assert.equal(h.save(d).sukses,true);
  assert.deepEqual(plain(h.t.h.store),before);
});

test('the status fix does not loosen deletion proof for invalid historical configurations',()=>{
  const h=setup();h.save(h.edit({status_indikator:'nonaktif'}));
  const before=plain(h.t.h.store);
  assert.throws(()=>h.call(h.admin,'pratinjauHapusDataIndex','Indikator_Perilaku','IND099'),/JSON referensi.*Aturan_Penilaian/);
  assert.deepEqual(plain(h.t.h.store),before);
});
