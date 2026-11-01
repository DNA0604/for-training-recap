import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {sessionHarness} from './support/sesi-harness.mjs';
import {pengajarHarness} from './support/pengajar-harness.mjs';

function fixture(){
 const h=sessionHarness();
 h.append('Indikator_Perilaku',{id_indikator:'IND-POS',kode_indikator:'AKTIF_BERTANYA',jenis_indikator:'positif',status_indikator:'aktif',definisi_indikator:'Bertanya',poin_per_kejadian:1});
 h.append('Indikator_Perilaku',{id_indikator:'IND-NEG',kode_indikator:'OFF_CAM',jenis_indikator:'negatif',status_indikator:'aktif',definisi_indikator:'Off cam',poin_per_kejadian:-1});
 let id=0;
 const note=(patch={})=>h.append('Catatan_Perilaku',{id_catatan:'CSV-NOTE-'+(++id),id_keikutsertaan:'KST001',id_sesi:'SES001',id_indikator:'IND-POS',status_validasi:'disetujui',waktu_kejadian:new Date('2026-10-20T01:20:00Z'),durasi_kejadian_menit:20,...patch});
 const recap=(who=h.staff)=>h.call(who,'muatRekapJPProgramIndex','PRG001');
 const stats=()=>recap().peserta[0].statistik_csv;
 const rule=()=>{h.columns('Aturan_Penilaian',['nilai_dasar_perilaku','nomor_versi']);const cfg=h.t.c.aturanPerilakuDefault_();h.append('Aturan_Penilaian',{id_aturan_penilaian:'CSV-RULE',nilai_dasar_perilaku:cfg.nilai_dasar,bobot_perilaku:cfg.bobot,konfigurasi_indikator:JSON.stringify(cfg.indikator),konfigurasi_perhitungan:JSON.stringify(cfg.perhitungan),nomor_versi:1});h.t.h.patch('Program','PRG001','id_program',{id_aturan_penilaian_aktif:'CSV-RULE'});};
 return {...h,note,recap,stats,rule};
}
function csv(recap,score,rule){
 const html=fs.readFileSync(new URL('../Index.html',import.meta.url),'utf8'),source=html.slice(html.indexOf('      function csvRecapCell('),html.indexOf('      function unduhRekap('));
 const c={recapRows:recap.peserta,recapProgram:'PRG001',recapScores:new Map(score.map(p=>[p.id_keikutsertaan,p])),recapRule:rule,recapAt:'2026-11-01T01:00:00.000Z'};vm.createContext(c);vm.runInContext(source,c);return c.buatCSVRekap();
}
function records(text){return text.replace(/^\uFEFF/,'').split('\r\n').map(line=>[...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(m=>m[1].replace(/""/g,'"')));}

test('counts work without scoring rules; approved leave is distinct per session and excluded from negative notes',()=>{
 const h=fixture();h.note();h.note({id_indikator:'IND-NEG'});h.note({id_indikator:'IND001'});h.note({id_indikator:'IND001'});h.note({status_validasi:'belum_divalidasi'});h.note({status_validasi:'ditolak',id_indikator:'IND-NEG'});
 assert.deepEqual(h.stats(),{jumlah_kehadiran:1,jumlah_keterlambatan:0,jumlah_izin:1,jumlah_catatan_positif:1,jumlah_catatan_negatif:1});
 const [head,row]=records(csv(h.recap(),[],null));assert.equal(head.length,23);assert.equal(row.length,23);assert.equal(row[head.indexOf('total_poin_catatan_perilaku')],'');assert.equal(row[head.indexOf('jumlah_izin')],'1');assert.equal(row[head.indexOf('status_perilaku')],'aturan_belum_ditetapkan');
});
test('arrival count includes sessions without JP and partial arrivals; correction overrides original time at the ten-minute boundary',()=>{
 const h=fixture(),base=h.t.h.records('Sesi')[0];h.append('Sesi',{...base,id_sesi:'SES-CSV',status_jp:'tidak_dihitung'});
 h.append('Kehadiran',{id_kehadiran:'KHD-CSV',id_keikutsertaan:'KST001',id_sesi:'SES-CSV',waktu_datang:new Date('2026-10-20T01:10:01Z')});
 h.t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:new Date('2026-10-20T01:30:00Z'),waktu_datang_terverifikasi:new Date('2026-10-20T01:10:00Z')});
 assert.equal(h.stats().jumlah_kehadiran,2);assert.equal(h.stats().jumlah_keterlambatan,1);
});
test('approved full-session leave without arrival does not create attendance and still appears in counts',()=>{
 const h=fixture();h.t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:''});h.note({id_indikator:'IND001'});
 assert.equal(h.stats().jumlah_kehadiran,0);assert.equal(h.stats().jumlah_izin,1);assert.equal(h.recap().peserta[0].jp_diperoleh,0);
});
test('counts retain exact program/Jenjang scope and do not include program-wide notes',()=>{
 const h=fixture();h.note({id_keikutsertaan:'KST003',id_sesi:'SES003'});h.note({id_keikutsertaan:'KST002',id_sesi:'SES002'});h.note({id_sesi:'',cakupan_kejadian:'program'});
 assert.equal(h.stats().jumlah_catatan_positif,0);assert.equal(h.recap(h.admin).peserta.find(p=>p.id_keikutsertaan==='KST003').statistik_csv.jumlah_catatan_positif,1);
 assert.throws(()=>h.call(h.other,'muatRekapJPProgramIndex','PRG001'),/AKSES_DITOLAK/);
});
test('teacher CSV statistics exclude another teaching session in the same Jenjang',()=>{
 const h=pengajarHarness();h.append('Catatan_Perilaku',{id_catatan:'OTHER-TEACHER-NOTE',id_keikutsertaan:'KST001',id_sesi:'SES004',id_indikator:'IND001',status_validasi:'disetujui'});
 const read=who=>h.call(who,'muatRekapJPProgramIndex','PRG001').peserta.find(p=>p.id_keikutsertaan==='KST001').statistik_csv;
 assert.equal(read(h.teacher).jumlah_izin,0);assert.equal(read(h.admin).jumlah_izin,1);
});
test('invalid arrival exports blank counts rather than false zero; duplicate attendance/note IDs fail explicitly',()=>{
 const h=fixture();h.t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'invalid'});assert.equal(h.stats().jumlah_kehadiran,null);
 const [head,row]=records(csv(h.recap(),[],null));assert.equal(row[head.indexOf('jumlah_kehadiran')],'');
 h.append('Kehadiran',{...h.t.h.records('Kehadiran')[0],id_kehadiran:'DUPLICATE'});assert.throws(h.stats,/duplikat/);
 const j=fixture();j.note({id_catatan:'REPEAT'});j.note({id_catatan:'REPEAT'});assert.throws(j.stats,/duplikat/);
});
test('point total uses actual rule points before cap, not base, note count, pending notes or teacher grades',()=>{
 const h=fixture();h.rule();for(let i=0;i<14;i++)h.note();h.note({id_indikator:'IND-NEG'});h.note({status_validasi:'belum_divalidasi'});
 const score=h.call(h.staff,'muatNilaiPerilakuProgramIndex','PRG001'),[head,row]=records(csv(h.recap(),score.peserta,score.aturan));
 assert.equal(score.peserta[0].nilai,99);assert.equal(row[head.indexOf('total_poin_catatan_perilaku')],'13');assert.equal(row[head.indexOf('status_perilaku')],'sementara');assert.equal(row[head.indexOf('nilai_keseluruhan')],'');
});
test('negative totals stay numeric; user-provided formula-like text, commas, quotes and newlines remain safely encoded',()=>{
 const h=fixture();h.rule();h.note({id_indikator:'IND-NEG'});const score=h.call(h.staff,'muatNilaiPerilakuProgramIndex','PRG001');const r=h.recap();r.peserta[0].nama='=FORMULA';r.peserta[0].unit='Unit, "A"\nBaru';
 const output=csv(r,score.peserta,score.aturan);assert.ok(output.startsWith('\uFEFF'));assert.ok(output.includes('"-1"'));assert.ok(!output.includes('"\'-1"'));assert.ok(output.includes('"\'=FORMULA"'));assert.ok(output.includes('"Unit, ""A""\nBaru"'));
});
test('a later request sees updated approval state without changing source data or existing JP fields',()=>{
 const h=fixture();h.note({id_catatan:'CHANGE',status_validasi:'belum_divalidasi'});assert.equal(h.stats().jumlah_catatan_positif,0);h.t.h.patch('Catatan_Perilaku','CHANGE','id_catatan',{status_validasi:'disetujui'});
 const before=JSON.stringify(h.t.h.store),r=h.recap();assert.equal(r.peserta[0].statistik_csv.jumlah_catatan_positif,1);assert.equal(r.peserta[0].jp_diperoleh,2);assert.equal(JSON.stringify(h.t.h.store),before);
});
