import {pengajarHarness,plain} from './pengajar-harness.mjs';export {plain};
export function rekapHarness(){
 const h=pengajarHarness(),book=h.evalBook,ss=book.ss,getSheet=ss.getSheetByName,insert=ss.insertSheet,meta=new Map();let nextId=1;
 function wrap(sheet){if(!sheet)return null;const name=sheet.getName();if(!meta.has(name))meta.set(name,{id:nextId++,rows:1000,cols:26,filter:false});const m=meta.get(name),getRange=sheet.getRange;
  sheet.getSheetId=()=>m.id;sheet.getMaxRows=()=>m.rows;sheet.getMaxColumns=()=>m.cols;sheet.insertRowsAfter=(last,n)=>m.rows+=n;sheet.insertColumnsAfter=(last,n)=>m.cols+=n;
  sheet.getFilter=()=>m.filter?{remove(){m.filter=false;}}:null;sheet.clearContents=()=>{book.store[name].values=[['']];book.store[name].formulas=[['']];book.writes.push({name,clear:true});return sheet;};
  for(const fn of ['setFrozenRows','setFrozenColumns','setColumnWidths','setColumnWidth'])sheet[fn]=()=>sheet;
  sheet.getRange=(r,c,rows=1,cols=1)=>{const range=getRange(r,c,rows,cols),set=range.setValues;range.setValues=values=>{const literal=values.map(row=>row.map(v=>typeof v==='string'&&v.startsWith("'")?v.slice(1):v));set.call(range,literal);values.forEach((row,i)=>row.forEach((v,j)=>{if(typeof v==='string'&&v.startsWith('='))book.store[name].formulas[r-1+i][c-1+j]=v;}));return range;};for(const fn of ['setBackground','setFontColor','setFontWeight','setVerticalAlignment','setWrap'])range[fn]=()=>range;range.createFilter=()=>{if(m.filter)throw Error('Filter already exists');m.filter=true;return range;};return range;};return sheet;
 }
 ss.getSheetByName=name=>wrap(getSheet(name));ss.insertSheet=name=>{const sheet=insert(name);meta.delete(name);return wrap(sheet);};ss.getSheets=()=>Object.keys(book.store).map(ss.getSheetByName);
 function note(patch={}){h.append('Catatan_Perilaku',{id_catatan:'NOTE001',id_keikutsertaan:'KST001',id_sesi:'SES001',cakupan_kejadian:'sesi',id_indikator:'IND_POS',status_validasi:'disetujui',waktu_kejadian:new Date('2026-10-20T01:30:00Z'),keterangan:'Diskusi aktif',sumber_catatan:'web: Petugas Uji',...patch});}
 h.append('Indikator_Perilaku',{id_indikator:'IND_POS',kode_indikator:'AKTIF_DISKUSI',definisi_indikator:'Aktif berdiskusi',jenis_indikator:'positif',status_indikator:'aktif'});
 const run=()=>h.call(h.admin,'perbaruiRekapPenilaian');return {...h,note,run,meta};
}
