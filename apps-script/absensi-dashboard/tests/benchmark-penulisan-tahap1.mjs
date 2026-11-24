// Perbandingan offline sebelum/sesudah Tahap 1 (jalur tulis): hasil respons, isi sheet, dan hitungan panggilan layanan.
// Bukan pengukuran waktu Google. Pakai --base=<hash commit> atau --base-file=<path Code.gs lama>.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {loadingHarness} from './support/pemuatan-audit-harness.mjs';
const arg=n=>process.argv.find(s=>s.startsWith('--'+n+'='))?.slice(n.length+3);
const baseFile=arg('base-file'),base=arg('base');
if(!baseFile&&!/^[a-f0-9]{7,40}$/.test(base||''))throw Error('Gunakan --base=<hash commit> atau --base-file=<path Code.gs lama>.');
const previous=baseFile?fs.readFileSync(baseFile,'utf8'):execFileSync('git',['show',base+':apps-script/absensi-dashboard/Code.gs'],{encoding:'utf8'});
const current=fs.readFileSync(new URL('../Code.gs',import.meta.url),'utf8');
const plain=o=>JSON.parse(JSON.stringify(o));
// Waktu pembuatan harness, UUID audit, dan hash turunannya berbeda antar-proses; nilai bisnis dibandingkan apa adanya.
const normal=o=>JSON.parse(JSON.stringify(o).replace(/RV-[0-9a-f-]{8,}/gi,'RV-X').replace(/20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g,'TS').replace(/[a-f0-9]{64}/g,'H'));
function sama(a,b,label){const x=JSON.stringify(a),y=JSON.stringify(b);if(x===y)return;let i=0;while(i<x.length&&x[i]===y[i])i++;throw Error(label+' | beda di posisi '+i+': sebelum ...'+x.slice(Math.max(0,i-80),i+120)+' | sesudah ...'+y.slice(Math.max(0,i-80),i+120));}
function run(source,size,scenario){
  const h=loadingHarness(size),c=h.t.c;vm.runInContext(source,c);
  const fixed=Date.now();c.Date=new Proxy(Date,{get:(t,k)=>k==='now'?()=>fixed:Reflect.get(t,k),construct:(t,a)=>Reflect.construct(t,a.length?a:[fixed])});
  const k={baca:0,appendRow:0,flush:0,sheet:0,sel:0};
  for(const b of [h.t.h.ss,h.t.access.ss,h.evalBook.ss]){const get=b.getSheetByName;const seen=new WeakSet();
    b.getSheetByName=n=>{k.sheet++;const s=get(n);if(!s||seen.has(s))return s;seen.add(s);const ap=s.appendRow.bind(s);s.appendRow=(...a)=>{k.appendRow++;return ap(...a);};
      const dr=s.getDataRange;s.getDataRange=()=>{const r=dr();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{const v=f();k.baca++;k.sel+=v.length*(v[0]?v[0].length:0);return v;};}return r;};return s;};}
  const fl=c.SpreadsheetApp.flush;c.SpreadsheetApp.flush=(...a)=>{k.flush++;return fl&&fl(...a);};
  const before=plain(h.t.h.store);for(const x of Object.keys(k))k[x]=0;
  const result=normal(scenario(h));const counts={...k};
  return {counts,result,store:normal(h.t.h.store),before:normal(before)};
}
const baris=n=>Array.from({length:n},(_,i)=>({nomor:i+2,nip:'19800101202001'+String(1000+i),nama:'Peserta Impor '+i,unit:'Unit X'}));
const skenario={
  tambah_program:h=>h.call(h.admin,'tambahProgramIndex',{nama:'Program Ukur',kategori:'Teknis',jenjang:'',mulai:'2026-12-01',selesai:'2026-12-05',status:'draft',id_permintaan:'ukur_program_request_0001'}),
  tambah_sesi_3_jeda:h=>h.call(h.admin,'tambahSesiIndex',{id_program:'PRG001',id_jenjang:'JEN001',nama:'Sesi Ukur',tanggal:'2026-10-20',mulai:'08:00',selesai:'12:00',status_jp:'dihitung',jeda:[{mulai:'09:00',selesai:'09:10',keterangan:'a'},{mulai:'10:00',selesai:'10:10',keterangan:'b'},{mulai:'11:00',selesai:'11:10',keterangan:'c'}],id_permintaan:'ukur_sesi_request_00001'}),
};
for(const n of [1,5,10,20])skenario['impor_'+n]=h=>{const pre=plain(h.call(h.admin,'pratinjauImporPesertaIndex','PRG001',baris(n),'JEN001'));return h.call(h.admin,'imporPesertaProgramIndex',{id_program:'PRG001',id_jenjang:'JEN001',id_permintaan:'impor_ukur_request_'+n+'_01',batch:0,baris:pre.baris});};
const out=[];
for(const size of [22,100,500])for(const [nama,fn] of Object.entries(skenario)){
  const a=run(previous,size,fn),b=run(current,size,fn);
  sama(a.result,b.result,'respons berbeda: '+nama+' '+size);sama(a.store,b.store,'isi sheet berbeda: '+nama+' '+size);
  out.push({peserta:size,aksi:nama,sebelum:a.counts,sesudah:b.counts});
}
console.log('LULUS: '+out.length+' perbandingan, respons dan isi sheet identik.');
console.table(out.filter(o=>o.peserta===22).map(o=>({aksi:o.aksi,baca_sebelum:o.sebelum.baca,baca_sesudah:o.sesudah.baca,flush_sebelum:o.sebelum.flush,flush_sesudah:o.sesudah.flush,getSheet_sebelum:o.sebelum.sheet,getSheet_sesudah:o.sesudah.sheet})));
console.table(out.filter(o=>o.peserta===500).map(o=>({aksi:o.aksi,sel_sebelum:o.sebelum.sel,sel_sesudah:o.sesudah.sel})));
const dest=arg('out');if(dest)fs.writeFileSync(dest,JSON.stringify({catatan:'Hitungan panggilan layanan tiruan; bukan waktu Google.',hasil:out},null,2));
