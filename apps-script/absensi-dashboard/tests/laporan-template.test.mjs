import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {reportHarness,plain} from './support/laporan-template-harness.mjs';

function net(h,{pages=25,upload=200,lost=false,cleanupFail=false}={}){
 const c=h.renderer,calls=[],trash=[];c.ScriptApp.getOAuthToken=()=> 'mock-oauth';c.DriveApp={getFileById:id=>({getAs:()=>h.blob('%PDF-1.4\n'+Array(pages).fill('/Type /Page\n').join('')),setTrashed:()=>{trash.push(id);if(cleanupFail)throw Error('Drive cleanup failed');}})};
 c.UrlFetchApp.fetch=(url,opt)=>{calls.push({url,opt});if(url.includes('upload/')){if(lost)throw Error('Lost import response');return {getResponseCode:()=>upload,getContentText:()=>JSON.stringify({id:'TEMP-ID'})};}return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({files:[{id:'TEMP-LOST'}]})};};return {calls,trash};
}
function parts(draft){return JSON.parse(execFileSync('python',['-c',`import sys,zipfile,io,json
with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as z:print(json.dumps({n:z.read(n).decode() for n in z.namelist() if n.endswith('.xml') or n.endswith('.rels')}))`],{input:Buffer.from(draft.blob.getBytes()),maxBuffer:20*1024*1024}).toString());}

test('report snapshot preserves source data, program/Jenjang denominator, unique IDs and latest evaluation identity',()=>{
 const h=reportHarness(),before=plain([h.t.h.store,h.t.access.store,h.evalBook.store]),r=h.report(),again=h.report();
 assert.deepEqual(plain([h.t.h.store,h.t.access.store,h.evalBook.store]),before);assert.notEqual(r.id_laporan,again.id_laporan);assert.equal(r.versi_sumber,again.versi_sumber);assert.equal(r.total.sasaran,3);assert.equal(r.sesi.find(s=>s.id==='SES001').pengajar,'Pengajar Satu');assert.equal(r.evaluasi.tersedia,true);assert.equal(r.evaluasi.kelompok[0].diharapkan,3);assert.equal(r.evaluasi.kelompok[0].belum,3);
 assert.ok(!JSON.stringify(r.evaluasi).includes('nip'));assert.ok(!JSON.stringify(r.evaluasi).includes('owner@test.invalid'));
});
test('descriptive evaluation means exclude stale source and replaced-teacher grades without inventing a final score',()=>{
 const h=reportHarness();h.call(h.teacher,'simpanEvaluasiPesertaSesi',h.payload());let g=h.report().evaluasi.kelompok[0];assert.equal(g.diisi,1);assert.equal(g.dasar_rata,1);assert.equal(g.rata[0],4);
 h.t.h.patch('Sesi','SES001','id_sesi',{nama_sesi:'Materi diubah'});g=h.report().evaluasi.kelompok[0];assert.equal(g.diisi,1);assert.equal(g.berubah,1);assert.equal(g.dasar_rata,0);assert.equal(g.rata[0],null);
 const current=h.call(h.admin,'muatKelolaPengajar').penugasan.find(p=>p.id_sesi==='SES001');h.assign('SES001',h.guru2.id,'report_reassign_request_001',current.versi);g=h.report().evaluasi.kelompok[0];assert.equal(g.diisi,0);assert.equal(g.belum,3);
});
test('Panitia and Admin-to-Pengajar remain separate per-session rubrics and never reuse missing scores as zero',()=>{
 const h=reportHarness(),v=h.call(h.staff,'muatEvaluasiPanitiaSesi','SES001');h.call(h.staff,'simpanEvaluasiPanitiaSesi',{id_sesi:'SES001',rubrik:v.rubrik,versi_sumber:v.versi_sumber,id_permintaan:'report_panitia_request_001',nilai:[{id_keikutsertaan:'KST001',versi:'',skor:{kedisiplinan:4,kerja_sama:3,prakarsa:5},catatan:'Penilaian Panitia'}]});
 const x=h.call(h.admin,'muatEvaluasiPengajarSesi','SES001');h.call(h.admin,'simpanEvaluasiPengajarSesi',{id_sesi:'SES001',id_pengajar:x.id_pengajar,rubrik:x.rubrik,versi_sumber:x.versi_sumber,versi:'',id_permintaan:'report_instructor_request_001',skor:Object.fromEntries(x.aspek.map(a=>[a.id,5])),catatan:'Penilaian Admin'});
 const groups=h.report().evaluasi.kelompok;assert.equal(groups[0].diisi,0);assert.equal(groups[1].diisi,1);assert.equal(groups[1].rata[0],4);assert.equal(groups[2].diisi,1);assert.equal(groups[2].rata[0],5);assert.equal(groups[2].aspek.length,5);
});
test('missing/unavailable evaluation source is explicitly unavailable and cannot erase otherwise available JP or notes',()=>{
 const h=reportHarness();h.renderer.konfigurasiEvaluasi_=()=>null;const r=h.report();assert.equal(r.evaluasi.tersedia,false);assert.ok(r.jp);assert.equal(r.evaluasi.kelompok.length,0);
 const layout=h.renderer.susunHalamanLaporan_(r),text=layout.pages.flatMap(p=>p.parts).join('');assert.ok(text.includes('Bagian evaluasi belum dapat disajikan'));assert.ok(!text.includes('Lampiran E.'));
});
test('completed-only report and native/app permissions still reject staff, teachers and active programs',()=>{
 const h=reportHarness();for(const who of [h.staff,h.teacher])for(const name of ['muatPratinjauLaporanProgram','buatPDFLaporanProgram'])assert.throws(()=>h.call(who,name,'PRG001'),/AKSES_DITOLAK/);
 h.t.h.patch('Program','PRG001','id_program',{status_program:'aktif'});assert.throws(h.report,/selesai/);
 h.asOwner();let cleaned=0;h.renderer.DocumentApp={create:()=>({getId:()=> 'AUTH-TEMP',getBody:()=>({appendParagraph(){}}),saveAndClose(){}})};h.renderer.DriveApp={getFileById:()=>({getAs:()=>h.blob('%PDF'),setTrashed:()=>cleaned++})};assert.match(h.renderer.otorisasiLaporanProgram(),/siap/);assert.equal(cleaned,1);h.renderer.Session={getActiveUser:()=>({getEmail:()=> 'stranger@test.invalid'})};assert.throws(()=>h.renderer.otorisasiLaporanProgram(),/pemilik/i);
});
test('future/invalid sessions do not create missing evaluation opportunities or attendance denominators',()=>{
 const h=reportHarness();h.t.h.patch('Sesi','SES001','id_sesi',{tanggal_sesi:new Date('2027-01-01T00:00:00Z')});h.t.h.patch('Sesi','SES004','id_sesi',{jam_selesai:'07:00'});const r=h.report();assert.equal(r.total.sasaran,1);assert.equal(r.evaluasi.kelompok[0].diharapkan,1);assert.equal(r.evaluasi.kelompok[1].diharapkan,1);assert.ok(r.peringatan.length);
});
test('12 participants use tables; 13 may add charts with consistent bounded categories',()=>{
 const h=reportHarness(),r=h.report();while(r.peserta.length<12)r.peserta.push({...r.peserta[0],id:'EXTRA-'+r.peserta.length});assert.equal(h.renderer.susunHalamanLaporan_(r).images.length,0);
 r.peserta.push({...r.peserta[0],id:'EXTRA-13'});const layout=h.renderer.susunHalamanLaporan_(r);assert.ok(layout.images.length>0);assert.ok(layout.images.every(i=>i.rows.length<=10));assert.ok(layout.images.find(i=>i.title.includes('Kelengkapan pencatatan kehadiran')).colors.includes('27845F'));
});
test('controlled DOCX contains exact approved assets, corrected white cover/body headers, numbering, margins and all sections',()=>{
 const h=reportHarness(),r=h.report(),draft=h.renderer.bangunDOCXLaporan_(r),xml=parts(draft),body=xml['word/document.xml'];
 for(let i=1;i<=7;i++)assert.ok(draft.daftar_isi.some(e=>e.text.startsWith(i+'. ')));assert.ok(draft.daftar_isi.some(e=>e.text.startsWith('Lampiran G.')));
 assert.ok(body.includes('Daftar Isi'));assert.ok(body.includes('w:bottom="1417"'));assert.ok(body.includes('w:top="1843"'));assert.ok(body.includes('w:orient="landscape"'));assert.ok(body.includes('<w:cantSplit/>'));assert.ok(body.includes('<w:tblHeader/>'));assert.ok(body.includes('w:ascii="Arial"'));assert.ok(body.includes('w:val="FFFFFF"'));
 assert.ok(xml['word/headerBody.xml'].includes('Pusat Pengembangan Aparatur'));assert.ok(!body.includes('Pengebangan'));assert.ok(xml['word/footerPage1.xml'].includes('|  1'));assert.ok(!body.includes('Disahkan /'));
 assert.equal(draft.halaman,h.renderer.susunHalamanLaporan_(r).pages.length+1);
 const assetBytes=execFileSync('python',['-c',`import sys,zipfile,io,hashlib,json
with zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read())) as z:print(json.dumps({n:hashlib.sha256(z.read(n)).hexdigest() for n in ['word/media/cover.jpg','word/media/logo.png']}))`],{input:Buffer.from(draft.blob.getBytes())}).toString();const actual=JSON.parse(assetBytes),expected=JSON.parse(fs.readFileSync(new URL('../previews/laporan-template/ASSETS.json',import.meta.url),'utf8'));assert.equal(actual['word/media/cover.jpg'],expected.assets.cover.sha256);assert.equal(actual['word/media/logo.png'],expected.assets.logo.sha256);
});
test('long text/XML characters are preserved across pages, TOC is bounded and no trailing empty page is emitted',()=>{
 const h=reportHarness(),r=h.report();r.catatan=[{id:'NOTE',id_keikutsertaan:'KST001',nama:'Nama <&>',sesi:'Sesi',waktu:'2026-10-20 08:00:00',indikator:'Indikator',jenis:'positif',status:'disetujui',keterangan:('Keterangan panjang & < > " '.repeat(80))}];
 const layout=h.renderer.susunHalamanLaporan_(r),all=layout.pages.flatMap(p=>p.parts).join('');assert.ok(all.includes('&amp;'));assert.ok(all.includes('&lt;'));assert.ok(all.includes('&quot;'));assert.ok(layout.pages.every(p=>p.parts.length));assert.ok(layout.pages.slice(1).every(p=>p.used<=p.height));assert.ok(layout.toc.every(e=>e.page>=2&&e.page<=layout.pages.length));
});
test('narrative uses flowing justified LTR paragraphs without artificial soft returns; headings and table alignment stay explicit',()=>{
 const h=reportHarness(),r=h.report(),layout=h.renderer.susunHalamanLaporan_(r),paragraph=layout.pages.flatMap(p=>p.parts).find(p=>p.includes('Program '+r.program.nama+' merupakan'));
 assert.ok(paragraph.includes('<w:jc w:val="both"/>'));assert.ok(paragraph.includes('<w:bidi w:val="0"/>'));assert.ok(paragraph.includes('<w:rtl w:val="0"/>'));assert.ok(!paragraph.includes('<w:br/>'));
 assert.ok(layout.pages.flatMap(p=>p.parts).find(p=>p.includes('1. Ringkasan Eksekutif')).includes('<w:jc w:val="left"/>'));
 assert.ok(layout.pages.flatMap(p=>p.parts).filter(p=>p.startsWith('<w:tbl>')).some(p=>p.includes('<w:jc w:val="right"/>')));
});
test('page splitting preserves original words, whitespace and Unicode, while explicit user line breaks remain intentional',()=>{
 const h=reportHarness(),c=h.renderer,source=('Narasi  asli dengan spasi, angka 12 dan aksen é. '.repeat(80))+'https://contoh.invalid/'+('a'.repeat(150))+' 😀 selesai';let rest=source,combined='',count=0;
 while(rest){const part=c.potongTeksMengalirLaporan_(rest,300,12,5);assert.ok(part.head.length);assert.ok(c.barisTeksLaporan_(part.head,300,12).length<=5);assert.ok(!/[\uD800-\uDBFF]$/.test(part.head));combined+=part.head;rest=part.tail;assert.ok(++count<100);}
 assert.equal(combined,source);assert.ok(count>1);assert.ok(c.paragrafXMLLaporan_('Baris pertama\nBaris kedua').includes('<w:br/>'));
});
test('PDF converter cleans imported private temp, validates physical page count and rechecks permission before delivery',()=>{
 const h=reportHarness(),r=h.report(),draft={blob:h.blob('DOCX'),halaman:25},n=net(h);let checks=0;h.renderer.periksaIzinLaporanKini_=()=>checks++;
 const out=h.renderer.konversiLaporanPDF_(draft,r);assert.ok(Buffer.from(out).toString().startsWith('%PDF'));assert.deepEqual(n.trash,['TEMP-ID']);assert.equal(checks,2);assert.equal(n.calls.length,1);assert.ok(!n.calls[0].opt.payload.toString().includes('anyone'));
});
test('page reflow, status/account reversal and failed import never return a misleading PDF and clean temps',()=>{
 const h=reportHarness(),r=h.report(),draft={blob:h.blob('DOCX'),halaman:25};let n=net(h,{pages:26});h.renderer.periksaIzinLaporanKini_=()=>{};assert.throws(()=>h.renderer.konversiLaporanPDF_(draft,r),/Daftar isi/);assert.deepEqual(n.trash,['TEMP-ID']);
 n=net(h);h.renderer.periksaIzinLaporanKini_=()=>{throw Error('AKSES_DITOLAK: Dicabut');};assert.throws(()=>h.renderer.konversiLaporanPDF_(draft,r),/Dicabut/);assert.deepEqual(n.trash,['TEMP-ID']);
 n=net(h,{upload:403});assert.throws(()=>h.renderer.konversiLaporanPDF_(draft,r),/Google Drive API/);assert.deepEqual(n.trash,['TEMP-LOST']);
 n=net(h,{lost:true});assert.throws(()=>h.renderer.konversiLaporanPDF_(draft,r),/Lost import/);assert.deepEqual(n.trash,['TEMP-LOST']);
});
test('actual live directory revocation during conversion is rechecked under lock before delivering bytes',()=>{
 const h=reportHarness(),r=h.report(),n=net(h),admin=h.t.access.records('Pengguna').find(x=>x.peran==='admin_pelatihan');
 assert.throws(()=>h.run(()=>h.renderer.konversiLaporanPDF_({blob:h.blob('DOCX'),halaman:25},r,()=>h.t.access.patch('Pengguna',admin.id_pengguna,'id_pengguna',{status:'nonaktif'}))),/SESI_BERAKHIR/);assert.deepEqual(n.trash,['TEMP-ID']);assert.equal(h.t.h.locks.held,false);
});
test('successful response carries traceable PDF name/ID; export failure always releases generation lock',()=>{
 const h=reportHarness(),c=h.renderer;let released=0;c.LockService.getUserLock=()=>({tryLock:()=>true,releaseLock:()=>released++});c.bangunDOCXLaporan_=()=>({});c.konversiLaporanPDF_=()=>[37,80,68,70];const out=h.run(()=>c.buatPDFLaporanProgram('PRG001'));assert.match(out.id_laporan,/^LAP-/);assert.match(out.nama,/\.pdf$/);assert.equal(out.mime,'application/pdf');assert.equal(released,1);
 c.konversiLaporanPDF_=()=>{throw Error('CONVERSION FAILED');};assert.throws(()=>h.run(()=>c.buatPDFLaporanProgram('PRG001')),/CONVERSION FAILED/);assert.equal(released,2);
});
