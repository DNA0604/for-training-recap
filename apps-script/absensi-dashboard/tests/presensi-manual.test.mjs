import test from 'node:test';import assert from 'node:assert/strict';
import {sessionHarness,plain} from './support/sesi-harness.mjs';
import {reportHarness} from './support/laporan-template-harness.mjs';
function fixture(){const h=sessionHarness(),{t}=h;const v=t.h.store.Kehadiran.values,ix=v[0].indexOf('id_kehadiran');t.h.put('Kehadiran',v.filter((r,i)=>i===0||r[ix]!=='KHD001'));let n=0;
 const payload=(status='hadir')=>{const row=h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0];return {id_sesi:'SES001',id_keikutsertaan:'KST001',versi:row.versi,status,keterangan:'Pemeriksaan kelas',id_permintaan:'manual_test_request_'+String(++n).padStart(4,'0')};};
 return {...h,payload,save:(d,who=h.staff)=>h.call(who,'simpanPresensiManualIndex',d),row:()=>t.h.records('Kehadiran').find(r=>r.id_keikutsertaan==='KST001'&&r.id_sesi==='SES001')};}
for(const [status,minutes,present,late] of [['hadir',90,true,0],['terlambat',75,true,1],['sakit',0,false,0],['izin',0,false,0],['alpa',0,false,0]])test(`manual ${status}: same JP/attendance/CSV/profile and no scan/behavior note`,()=>{
 const h=fixture(),d=h.payload(status),notes=plain(h.t.h.store.Catatan_Perilaku);h.save(d);let r=h.row();assert.equal(r.metode_input,'manual_status_v1');for(const c of ['waktu_datang','waktu_pulang','waktu_datang_terverifikasi','waktu_pulang_terverifikasi','jp_diakui_presisi'])assert.equal(r[c],'');assert.equal(r.status_validasi,'belum_divalidasi');
 const calculated=h.call(h.admin,'hitungJPSesiIndex','SES001');assert.equal(calculated.bermasalah.length,0);assert.equal(calculated.belum_lengkap,0);r=h.row();assert.equal(r.durasi_diakui_menit,minutes);assert.equal(r.jp_diakui_presisi,minutes/45);assert.equal(r.menit_terlambat,'');assert.equal(r.durasi_aktual_menit,'');
 const roster=h.call(h.staff,'muatKehadiranIndex','SES001');assert.equal(roster.peserta[0].sudah_datang,present);assert.equal(roster.peserta[0].tidak_hadir,!present);assert.equal(roster.ringkasan.terlambat,late);assert.equal(roster.peserta[0].terlambat_menit,null);
 const rekap=h.call(h.admin,'muatRekapJPProgramIndex','PRG001').peserta.find(p=>p.id_keikutsertaan==='KST001');assert.equal(rekap.jp_diperoleh,minutes/45);assert.equal(rekap.status,'lengkap');assert.equal(rekap.statistik_csv.jumlah_kehadiran,present?1:0);assert.equal(rekap.statistik_csv.jumlah_keterlambatan,late);assert.equal(rekap.statistik_csv.jumlah_izin,0,'unverified full-session leave excluded from approved CSV');assert.equal(rekap.statistik_csv.jumlah_catatan_negatif,0);
 const profile=h.call(h.staff,'muatProfilPesertaIndex',{id_keikutsertaan:'KST001'});assert.equal(profile.ringkasan.hadir_lengkap,present?1:0);assert.equal(profile.ringkasan.belum_tercatat,0);assert.equal(profile.ringkasan.terlambat,late);assert.equal(profile.ringkasan.status,'sementara');assert.deepEqual(plain(h.t.h.store.Catatan_Perilaku),notes);assert.equal(profile.riwayat[0].tindakan,'presensi_manual_status');
});
test('manual fixed deduction clamps short sessions and merges breaks/leave once; QR unchanged',()=>{
 const h=fixture(),c=h.t.c,r={metode_input:'manual_status_v1',status_kehadiran:'manual_terlambat'};
 assert.equal(c.hitungJPManual_(r,{mulai:0,selesai:10*60000,jeda:[],izin:[]}).jp_diakui_presisi,0);
 assert.equal(c.hitungJPManual_(r,{mulai:0,selesai:120*60000,jeda:[[30*60000,60*60000]],izin:[[45*60000,75*60000]]}).durasi_diakui_menit,60);
 assert.equal(c.hitungDurasiJP_({mulai:0,selesai:90*60000,datang:10*60000,pulang:90*60000,jeda:[],izin:[]}).durasi_diakui_menit,90);
 assert.equal(c.hitungDurasiJP_({mulai:0,selesai:90*60000,datang:20*60000,pulang:90*60000,jeda:[],izin:[]}).durasi_diakui_menit,70);
});
test('manual edit invalidates JP; repeated and lost responses never duplicate attendance',()=>{
 const h=fixture(),d=h.payload();h.save(d);const count=h.t.h.writes.length;h.save(d);assert.equal(h.t.h.writes.length,count);assert.equal(h.t.h.records('Kehadiran').filter(r=>r.id_sesi==='SES001').length,1);
 h.call(h.admin,'hitungJPSesiIndex','SES001');const next=h.payload('sakit');h.save(next);assert.equal(h.row().jp_diakui_presisi,'');assert.throws(()=>h.save({...next,status:'hadir'}),/permintaan berbeda/);h.call(h.admin,'hitungJPSesiIndex','SES001');assert.equal(h.row().jp_diakui_presisi,0);
});
for(const stage of ['before','after','receipt'])test(`resumes interrupted manual ${stage} from live draft without overwriting another version`,()=>{
 const h=fixture(),d=h.payload('terlambat');let failed=false;h.t.h.fault(e=>{if(failed)return;const receipt=e.name==='Riwayat_Validasi'&&e.op==='before'&&e.values[0].includes('SELESAI');if(stage==='receipt'?receipt:e.name==='Kehadiran'&&e.op===stage){failed=true;throw Error('Simulasi koneksi terputus');}});
 assert.throws(()=>h.save(d),/Simulasi/);h.t.h.fault(()=>{});assert.ok(failed);const draft=h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0].manual_pending;assert.deepEqual(draft,d);assert.throws(()=>h.save({...d,id_permintaan:'different_manual_request_00001'}),/belum selesai/);h.save(draft);assert.equal(h.row().status_kehadiran,'manual_terlambat');assert.equal(h.t.h.records('Kehadiran').filter(r=>r.id_sesi==='SES001').length,1);assert.equal(h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0].manual_pending,null);
});
test('pending draft can be resumed by Admin, while unrelated actors/requests cannot adopt it',()=>{
 const h=fixture(),d=h.payload();h.t.h.fault(e=>{if(e.name==='Kehadiran'&&e.op==='before')throw Error('interrupted');});assert.throws(()=>h.save(d));h.t.h.fault(()=>{});h.save(h.call(h.admin,'muatKehadiranIndex','SES001').peserta[0].manual_pending,h.admin);assert.equal(h.row().status_kehadiran,'manual_hadir');
});
test('stale versions, foreign Jenjang, revoked actor, inactive membership and future session cannot write',()=>{
 const h=fixture(),d=h.payload();assert.throws(()=>h.save({...d,id_sesi:'SES003',id_keikutsertaan:'KST003'}),/AKSES_DITOLAK/);h.save(d);assert.throws(()=>h.save({...d,id_permintaan:'stale_manual_request_001'}),/Data sudah berubah/);
 const r=h.payload();h.t.h.patch('Keikutsertaan','KST001','id_keikutsertaan',{status_keikutsertaan:'batal'});assert.throws(()=>h.save(r),/tidak terdaftar/);h.t.h.patch('Keikutsertaan','KST001','id_keikutsertaan',{status_keikutsertaan:'terdaftar'});h.t.h.patch('Sesi','SES001','id_sesi',{tanggal_sesi:'2099-10-20'});assert.throws(()=>h.save(r),/sebelum sesi dimulai/);
});
test('manual rejects original QR, pending accepted QR logs and timestamp corrections',()=>{
 const h=sessionHarness(),r=h.call(h.staff,'muatKehadiranIndex','SES001').peserta[0],d={id_sesi:'SES001',id_keikutsertaan:'KST001',status:'hadir',versi:r.versi,id_permintaan:'qr_cannot_be_manual_request'};assert.throws(()=>h.call(h.staff,'simpanPresensiManualIndex',d),/pencatatan waktu/);
 const f=fixture(),input=f.payload();f.append('Log_Absensi',{id_log:'LOG-QR',id_sesi:'SES001',id_keikutsertaan:'KST001',status_scan:'diterima'});assert.throws(()=>f.save(input),/menggunakan QR/);
 const g=fixture();g.save(g.payload());const row=g.call(g.staff,'muatKehadiranIndex','SES001').peserta[0];assert.throws(()=>g.call(g.staff,'simpanKoreksiIndex',{id_kehadiran:row.id_kehadiran,versi:row.versi,datang:'2026-10-20T08:00',alasan:'Koreksi',dasar:'Petugas'}),/Ubah Presensi Manual/);
});
test('manual is included in session verification and approved leave counts without creating behavior points',()=>{
 const h=fixture();h.save(h.payload('izin'));const v=h.call(h.staff,'muatVerifikasiSesiPanitia','SES001');assert.equal(v.ringkasan.lengkap,1);assert.equal(v.ringkasan.izin_manual,1);assert.equal(v.kehadiran[0].presensi,'Manual: Izin');const p=h.call(h.staff,'ajukanVerifikasiSesiPanitia',{id_sesi:'SES001',versi:v.versi,catatan:'Sudah diperiksa'});h.call(h.admin,'putuskanVerifikasiSesiPanitia',{id:p.id,keputusan:'setujui',alasan:'Pemeriksaan selesai'});assert.equal(h.row().status_validasi,'terverifikasi');const recap=h.call(h.admin,'muatRekapJPProgramIndex','PRG001').peserta.find(p=>p.id_keikutsertaan==='KST001');assert.equal(recap.statistik_csv.jumlah_izin,1);assert.equal(recap.statistik_csv.jumlah_catatan_negatif,0);assert.equal(h.call(h.staff,'muatProfilPesertaIndex',{id_keikutsertaan:'KST001'}).ringkasan.status,'data_lengkap');
});
test('manual absences in PDF are explicit known statuses, excluded from attendance and unresolved scans',()=>{
 const h=reportHarness();h.t.h.patch('Kehadiran','KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:'',metode_input:'manual_status_v1',status_kehadiran:'manual_sakit'});const r=h.report();assert.equal(r.total.sakit,1);assert.equal(r.total.lengkap,1);const pages=h.renderer.susunHalamanLaporan_(r);const text=JSON.stringify(plain(pages));assert.match(text,/Sakit \(manual\)/);assert.match(text,/Sakit\/Izin\/Alpa/);
});
test('teacher cannot save manual attendance, and actor revocation while waiting for lock prevents writes',async()=>{
 const {pengajarHarness}=await import('./support/pengajar-harness.mjs');const h=pengajarHarness();assert.throws(()=>h.call(h.teacher,'simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'KST001',status:'hadir',id_permintaan:'teacher_manual_request_00001'}),/AKSES_DITOLAK/);
 const f=fixture(),d=f.payload(),original=f.t.c.LockService.getScriptLock;let revoked=false,waits=0;f.t.c.LockService.getScriptLock=()=>{const l=original(),wait=l.waitLock;l.waitLock=(...a)=>{if(++waits===2&&!revoked){revoked=true;const u=f.t.access.records('Pengguna').find(u=>u.email_google==='petugas@gmail.com');f.t.access.patch('Pengguna',u.id_pengguna,'id_pengguna',{status:'nonaktif'});}return wait(...a);};return l;};const before=f.t.h.writes.length;assert.throws(()=>f.save(d),/SESI_BERAKHIR/);assert.equal(f.t.h.writes.length,before);
});
test('QR cannot overwrite manual attendance or a pending manual create; other participants still use QR',async()=>{
 const {createHash}=await import('node:crypto');for(const pending of [false,true]){
 const h=fixture(),d=h.payload();if(pending){h.t.h.fault(e=>{if(e.name==='Kehadiran'&&e.op==='before')throw Error('interrupted');});assert.throws(()=>h.save(d));h.t.h.fault(()=>{});}else h.save(d);
 const token='QR_MANUAL_ISOLATION_TEST',hash=createHash('sha256').update(token).digest('hex');h.append('Token_QR',{id_token_qr:'TOKEN-MANUAL',id_sesi:'SES001',token_hash:hash});h.t.c.validasiTokenQR=()=>({valid:true,id_sesi:'SES001',id_token_qr:'TOKEN-MANUAL',jenis_scan:'datang'});
 const qr={token,id_peserta:'PST001',id_permintaan:'manual_qr_attempt_request_0001'},before=h.row();if(pending)assert.throws(()=>h.t.c.simpanAbsensiPeserta(qr),/belum selesai/);else assert.equal(h.t.c.simpanAbsensiPeserta(qr).sukses,false);assert.deepEqual(h.row(),before);
 h.append('Peserta',{id_peserta:'PST-MIXED',nama_pegawai:'Peserta QR'});h.append('Keikutsertaan',{id_keikutsertaan:'KST-MIXED',id_peserta:'PST-MIXED',id_program:'PRG001',id_jenjang:'JEN001',status_keikutsertaan:'terdaftar'});assert.equal(h.t.c.simpanAbsensiPeserta({...qr,id_peserta:'PST-MIXED',id_permintaan:'mixed_qr_attempt_request_0001'}).sukses,true);assert.deepEqual(h.row(),before);
 }
});
test('pending manual writes block verification/recap, and another physical edit is never overwritten on retry',()=>{
 const h=fixture(),d=h.payload();h.t.h.fault(e=>{if(e.name==='Kehadiran'&&e.op==='after')throw Error('interrupted');});assert.throws(()=>h.save(d));h.t.h.fault(()=>{});assert.throws(()=>h.call(h.staff,'muatVerifikasiSesiPanitia','SES001'),/belum selesai/);assert.throws(()=>h.call(h.admin,'muatRekapJPProgramIndex','PRG001'),/belum selesai/);h.t.h.patch('Kehadiran',h.row().id_kehadiran,'id_kehadiran',{alasan_koreksi:'Perubahan langsung'});assert.throws(()=>h.save(d),/di luar rencana/);assert.equal(h.row().alasan_koreksi,'Perubahan langsung');
});
test('manual full-session leave appears in the leave view without extra notes and counts once beside an approved legacy leave',()=>{
 const h=fixture();h.save(h.payload('izin'),h.admin);const before=h.t.h.records('Catatan_Perilaku').length,view=h.call(h.staff,'muatDaftarIzinIndex','SES001');assert.equal(view.catatan.length,1);assert.equal(view.catatan[0].sumber,'presensi_manual');assert.equal(view.catatan[0].status,'disetujui');assert.equal(h.t.h.records('Catatan_Perilaku').length,before);
 h.append('Catatan_Perilaku',{id_catatan:'CTP-OLD',id_sesi:'SES001',id_keikutsertaan:'KST001',id_indikator:'IND001',status_validasi:'disetujui'});const r=h.call(h.admin,'muatRekapJPProgramIndex','PRG001').peserta.find(r=>r.id_keikutsertaan==='KST001');assert.equal(r.statistik_csv.jumlah_izin,1);assert.equal(r.statistik_csv.jumlah_catatan_negatif,0);
});
function proofDrive(h){
 const files=new Map(),folderId='FOLDER-MANUAL-PROOFS',c=h.t.c;let created=0;
 const iterator=values=>{let i=0;return {hasNext:()=>i<values.length,next:()=>values[i++]};};
 const folder={getId:()=>folderId,isTrashed:()=>false,getFilesByName:name=>iterator([...files.values()].filter(f=>f.name===name)),createFile(blob){const id='PROOF-MANUAL-'+String(++created).padStart(12,'0');const f={id,name:blob.name,desc:'',trashed:false,parent:folderId,getId:()=>id,getDescription(){return this.desc;},setDescription(v){this.desc=v;},isTrashed(){return this.trashed;},getParents(){return iterator([{getId:()=>this.parent}]);}};files.set(id,f);return f;}};
 c.PropertiesService.getScriptProperties().setProperty('FOLDER_BUKTI|COPY-DB',folderId);c.DriveApp={getFolderById:id=>{assert.equal(id,folderId);return folder;},getFileById:id=>{if(!files.has(id))throw Error('File tidak ditemukan');return files.get(id);}};
 c.Utilities.base64Decode=s=>Array.from(Buffer.from(s,'base64'));c.Utilities.newBlob=(bytes,mime,name)=>({bytes,mime,name});
 return {files,created:()=>created};
}
async function uploadFixture(status='sakit'){
 const {createHash}=await import('node:crypto');const h=fixture(),drive=proofDrive(h),c=h.t.c;c.Utilities.computeDigest=(a,v)=>Array.from(createHash('sha256').update(typeof v==='string'?v:Buffer.from(v)).digest());
 const upload={jenis:'izin',id_sesi:'SES001',id_keikutsertaan:'KST001',id_permintaan:'manual_upload_support_00001',nama:'surat.png',base64:Buffer.from([137,80,78,71,13,10,26,10,0]).toString('base64')};
 const result=h.call(h.staff,'unggahBuktiIndex',upload),payload={...h.payload(status),id_bukti:result.id};return {...h,drive,upload,result,data:payload};
}
test('Sakit evidence uses existing private upload/leave view with no attendance, izin count or behavior points',async()=>{
 const h=await uploadFixture();assert.equal(h.call(h.staff,'unggahBuktiIndex',h.upload).id,h.result.id);assert.equal(h.drive.created(),1);h.save(h.data);
 assert.match(h.row().dasar_verifikasi,new RegExp(h.result.id));const list=h.call(h.staff,'muatDaftarIzinIndex','SES001');assert.equal(list.catatan[0].jenis_ketidakhadiran,'Sakit');assert.match(list.catatan[0].bukti,new RegExp(h.result.id));assert.equal(h.t.h.records('Catatan_Perilaku').length,0);const v=h.call(h.staff,'muatVerifikasiSesiPanitia','SES001');assert.match(v.kehadiran[0].bukti,new RegExp(h.result.id));assert.equal(v.ringkasan.izin_manual,0);h.call(h.admin,'hitungJPSesiIndex','SES001');const r=h.call(h.admin,'muatRekapJPProgramIndex','PRG001').peserta.find(r=>r.id_keikutsertaan==='KST001');assert.equal(r.jp_diperoleh,0);assert.equal(r.statistik_csv.jumlah_izin,0);assert.equal(r.statistik_csv.jumlah_catatan_negatif,0);
});
test('Izin evidence remains optional and reviewable; edits preserve it, replacement is scoped and Hadir clears current reference',async()=>{
 const h=await uploadFixture('izin');h.save(h.data);h.save(h.payload('izin'));assert.match(h.row().dasar_verifikasi,new RegExp(h.result.id));
 const second=h.call(h.staff,'unggahBuktiIndex',{...h.upload,id_permintaan:'manual_upload_support_00002'});h.save({...h.payload('sakit'),id_bukti:second.id});assert.match(h.row().dasar_verifikasi,new RegExp(second.id));assert.ok(!h.row().dasar_verifikasi.includes(h.result.id));h.save(h.payload('hadir'));assert.equal(h.row().dasar_verifikasi,'PRESENSI_MANUAL_V1');assert.equal(h.drive.files.size,2,'old evidence retained privately for audit');assert.equal(h.call(h.staff,'muatDaftarIzinIndex','SES001').catatan.length,0);
});
for(const corruption of ['target','folder','trashed'])test(`manual evidence ${corruption} mismatch cannot be saved or create an attendance audit`,async()=>{
 const h=await uploadFixture(),f=h.drive.files.get(h.result.id);if(corruption==='target'){const meta=JSON.parse(f.desc);meta.target='IZIN|SES003|KST003';f.desc=JSON.stringify(meta);}if(corruption==='folder')f.parent='ANOTHER-FOLDER';if(corruption==='trashed')f.trashed=true;
 const before=plain(h.t.h.store);assert.throws(()=>h.save(h.data),/sesuai|Sampah/);assert.deepEqual(plain(h.t.h.store),before);
});
test('evidence cannot be attached to Hadir/Terlambat/Tanpa Keterangan and forged URLs are ignored',async()=>{
 const h=await uploadFixture();for(const status of ['hadir','terlambat','alpa'])assert.throws(()=>h.save({...h.data,status}),/hanya.*Sakit atau Izin/);h.save({...h.payload('sakit'),bukti:'https://evil.invalid/fake'});assert.equal(h.row().dasar_verifikasi,'PRESENSI_MANUAL_V1');
});
test('same-ID evidence retry after row write resumes with Admin and never creates a second attendance or upload',async()=>{
 const h=await uploadFixture();let once=true;h.t.h.fault(e=>{if(once&&e.name==='Kehadiran'&&e.op==='after'){once=false;throw Error('lost proof receipt');}});assert.throws(()=>h.save(h.data),/lost proof/);h.t.h.fault(()=>{});const draft=h.call(h.admin,'muatKehadiranIndex','SES001').peserta[0].manual_pending;assert.equal(draft.id_bukti,h.result.id);h.save(draft,h.admin);assert.equal(h.drive.created(),1);assert.equal(h.t.h.records('Kehadiran').filter(r=>r.id_sesi==='SES001').length,1);assert.match(h.row().dasar_verifikasi,new RegExp(h.result.id));
});
