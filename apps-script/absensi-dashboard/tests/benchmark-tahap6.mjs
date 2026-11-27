// Perbandingan offline Tahap 6: kondisi hangat (cache otorisasi dan sakelar jalur cepat presensi menyala), Tahap 5 vs Tahap 6.
// Respons dan isi sheet harus identik; hitungan panggilan layanan tiruan, bukan waktu Google.
// Pakai --base=<hash commit Tahap 5> atau --base-dir=<folder berisi Code.gs, Akses.gs, Jenjang.gs, PresensiManual.gs lama>.
import fs from 'node:fs';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
import {sessionHarness} from './support/sesi-harness.mjs';
const arg=n=>process.argv.find(s=>s.startsWith('--'+n+'='))?.slice(n.length+3);
const baseDir=arg('base-dir'),base=arg('base');
if(!baseDir&&!/^[a-f0-9]{7,40}$/.test(base||''))throw Error('Gunakan --base=<hash commit> atau --base-dir=<folder>.');
const lama=n=>baseDir?fs.readFileSync(baseDir+'/'+n,'utf8'):execFileSync('git',['show',base+':apps-script/absensi-dashboard/'+n],{encoding:'utf8'});
const sumber=Object.fromEntries(['Code.gs','Akses.gs','Jenjang.gs','PresensiManual.gs'].map(n=>[n,lama(n)]));
const plain=o=>JSON.parse(JSON.stringify(o));
const normal=o=>JSON.parse(JSON.stringify(o).replace(/[A-Z]{2,4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,'ID-X').replace(/20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z/g,'TS').replace(/[a-f0-9]{64}/g,'H').replace(/"expires":\d+/g,'"expires":0'));
function jalankan(versi,skenario){
  const x=sessionHarness(),{t,staff,call}=x,c=t.c;c.console={log(){}};
  if(versi==='lama')for(const [n,s] of Object.entries(sumber))vm.runInContext(s,c,{filename:n});
  const args=skenario.siapkan?skenario.siapkan(x):[];
  x.asOwner();c.aktifkanCacheOtorisasiPanitia();c.aktifkanValidasiCepatPresensiQR();
  call(staff,'muatBerandaIndex');call(staff,'terbitkanQRAbsensiDariGenerator','SES001','pulang',5);if(skenario.hangat)skenario.hangat(x); // pemanasan: cache terisi, penanda terpasang, pemeriksaan pemilik tercatat
  const k={getActive:0,sheet:0,openById:0,getOwner:0,baca:0,lastRC:0,append:0,setv:0,flush:0};
  const ga=c.SpreadsheetApp.getActiveSpreadsheet;c.SpreadsheetApp.getActiveSpreadsheet=(...a)=>{k.getActive++;return ga.apply(c.SpreadsheetApp,a);};
  for(const b of [t.h.ss,t.access.ss]){const get=b.getSheetByName;b.getSheetByName=n=>{k.sheet++;const s=get(n);if(!s||s.__h)return s;s.__h=true;
    const dr=s.getDataRange;s.getDataRange=()=>{const r=dr();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{k.baca++;return f();};}return r;};
    const ap=s.appendRow.bind(s);s.appendRow=(...a)=>{k.append++;return ap(...a);};
    for(const m of ['getLastRow','getLastColumn']){const f=s[m]&&s[m].bind(s);if(f)s[m]=(...a)=>{k.lastRC++;return f(...a);};}
    const gr=s.getRange.bind(s);s.getRange=(...a)=>{const r=gr(...a),sv=r.setValues&&r.setValues.bind(r);if(sv)r.setValues=(...b)=>{k.setv++;return sv(...b);};return r;};return s;};
    const go=b.getOwner;if(go)b.getOwner=(...a)=>{k.getOwner++;return go.apply(b,a);};}
  const oi=c.SpreadsheetApp.openById;if(oi)c.SpreadsheetApp.openById=(...a)=>{k.openById++;return oi(...a);};
  const fl=c.SpreadsheetApp.flush;c.SpreadsheetApp.flush=(...a)=>{k.flush++;return fl&&fl(...a);};
  const hasil=plain(call(skenario.siapa(x),...skenario.rpc(args)));
  return {k,hasil:normal(hasil),store:normal([t.h.store,t.access.store])};
}
const S={
  absen_manual:{siapkan:x=>{const {t,call,staff}=x,v=t.h.store.Kehadiran.values,ix=v[0].indexOf('id_kehadiran');t.h.put('Kehadiran',v.filter((r,i)=>i===0||r[ix]!=='KHD001'));return [call(staff,'muatKehadiranIndex','SES001').peserta[0].versi];},
    siapa:x=>x.staff,rpc:a=>['simpanPresensiManualIndex',{id_sesi:'SES001',id_keikutsertaan:'KST001',versi:a[0],status:'hadir',keterangan:'Pemeriksaan kelas',id_permintaan:'manual_t6_bench_00000001'}]},
  buka_buku_akses:{siapa:x=>x.admin,hangat:x=>x.call(x.admin,'muatManajemenAksesPanitia'),rpc:()=>['muatManajemenAksesPanitia']},
};
const jumlah=k=>Object.values(k).reduce((a,v)=>a+v,0);
const keluar=[];
for(const [nama,s] of Object.entries(S)){
  let L,B;try{L=jalankan('lama',s);}catch(e){throw Error('lama/'+nama+': '+e.message);}try{B=jalankan('baru',s);}catch(e){throw Error('baru/'+nama+': '+e.message);}
  const a=JSON.stringify(L.hasil),b=JSON.stringify(B.hasil);if(a!==b){let i=0;while(i<a.length&&a[i]===b[i])i++;throw Error('respons berbeda: '+nama+' @'+i+' lama:'+a.slice(Math.max(0,i-60),i+80)+' | baru:'+b.slice(Math.max(0,i-60),i+80));}
  if(JSON.stringify(L.store)!==JSON.stringify(B.store))throw Error('isi sheet berbeda: '+nama);
  keluar.push({aksi:nama,lama:L.k,baru:B.k,total_lama:jumlah(L.k),total_baru:jumlah(B.k)});
}
console.log('LULUS: respons dan isi sheet identik pada '+keluar.length+' aksi (kondisi hangat, Tahap 5 vs Tahap 6).');
console.table(keluar.map(o=>({aksi:o.aksi,total_lama:o.total_lama,total_baru:o.total_baru,hemat:Math.round(100*(1-o.total_baru/o.total_lama))+'%',baca:o.lama.baca+'->'+o.baru.baca,sheet:o.lama.sheet+'->'+o.baru.sheet,openById:o.lama.openById+'->'+o.baru.openById,getOwner:o.lama.getOwner+'->'+o.baru.getOwner})));
const dest=arg('out');if(dest)fs.writeFileSync(dest,JSON.stringify({catatan:'Hitungan panggilan layanan tiruan, kondisi hangat; bukan waktu Google.',hasil:keluar},null,2));
