import {nilaiAkhirHarness} from './nilai-akhir-harness.mjs';
export const loadingScenarios=[['initial','muatAwalIndex'],['home','muatBerandaIndex'],['attendance','muatKehadiranIndex','SES001'],['recap','muatRekapJPProgramIndex','PRG001'],['manage','muatKelolaProgramIndex','PRG001'],['participants','muatPesertaProgramIndex','PRG001','',0,'JEN001'],['evaluation','muatEvaluasiPanitiaSesi','SES001']];
/** Synthetic valid identities/relations with distinct arrival times and mixed manual statuses. */
export function loadingHarness(size=22){
 const h=nilaiAkhirHarness(),people=[],members=[],attendance=[],base=h.t.h.records('Kehadiran');
 for(let i=1;i<size;i++){
  const id='LOAD-'+String(i).padStart(4,'0');people.push({id_peserta:'P-'+id,nama_pegawai:'Peserta '+id,nip:'200001012020'+String(i).padStart(6,'0'),unit_kerja:'Unit Uji'});members.push({id_keikutsertaan:'K-'+id,id_peserta:'P-'+id,id_program:'PRG001',id_jenjang:'JEN001',status_keikutsertaan:'terdaftar',unit_kerja_saat_pelatihan:'Unit Uji'});
  for(const sid of ['SES001','SES004']){
   const b=base.find(r=>r.id_kehadiran===(sid==='SES001'?'KHD001':'KHD004')),r={...b,id_kehadiran:'H-'+id+'-'+sid,id_sesi:sid,id_keikutsertaan:'K-'+id,waktu_datang:new Date(b.waktu_datang.getTime()+(i%15)*60000+Math.floor(i/15)*1000),waktu_pulang:new Date(b.waktu_pulang.getTime()+(i%10)*1000)};
   if(i%5===0)Object.assign(r,{metode_input:'manual_status_v1',status_kehadiran:'manual_'+['hadir','terlambat','sakit','izin','alpa'][Math.floor(i/5)%5],waktu_datang:'',waktu_pulang:'',waktu_datang_terverifikasi:'',waktu_pulang_terverifikasi:''});attendance.push(r);
  }
 }
 for(const [name,rows] of [['Peserta',people],['Keikutsertaan',members],['Kehadiran',attendance]]){const table=h.t.h.store[name],head=table.values[0];rows.forEach(r=>{table.values.push(head.map(k=>r[k]??''));table.formulas.push(head.map(()=>''));});}
 h.fill();return h;
}
export function instrumentLoading(h){
 let calls={};const add=k=>calls[k]=(calls[k]||0)+1,seen=new WeakSet();
 for(const [label,b] of [['main',h.t.h.ss],['access',h.t.access.ss],['eval',h.evalBook.ss]]){
  for(const m of ['getOwner','getSpreadsheetTimeZone']){const f=b[m];b[m]=(...a)=>{add(m);return f(...a);};}
  const get=b.getSheetByName;b.getSheetByName=n=>{add('getSheetByName');const s=get(n);if(!s||seen.has(s))return s;seen.add(s);const range=s.getDataRange;s.getDataRange=()=>{const r=range();for(const m of ['getValues','getFormulas']){const f=r[m];r[m]=()=>{add(label+'/'+n+'/'+m);return f();};}return r;};return s;};
 }
 const open=h.t.c.SpreadsheetApp.openById;h.t.c.SpreadsheetApp.openById=(...a)=>{add('openById');return open(...a);};
 for(const m of ['formatDate','parseDate']){const f=h.t.c.Utilities[m];h.t.c.Utilities[m]=(...a)=>{add(m);return f(...a);};}
 return {reset(){calls={};},snapshot:()=>({...calls})};
}
