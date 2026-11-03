// Offline visual check only. No Google calls: journals are fixtures, charts use local matplotlib.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {reportHarness} from './support/laporan-template-harness.mjs';
const dir='/tmp/report-template-preview';fs.mkdirSync(dir,{recursive:true});
for(const size of [2,13]){
 const h=reportHarness(),c=h.renderer;
 h.t.h.patch('Peserta','PST002','id_peserta',{nama_pegawai:'Peserta B'});h.t.h.patch('Jenjang','JEN003','id_jenjang',{nama_jenjang:'Lanjutan'});h.t.h.patch('Sesi','SES003','id_sesi',{nama_sesi:'Pendalaman AI Agent'});h.t.h.patch('Sesi','SES004','id_sesi',{nama_sesi:'Praktik AI Agent'});
 for(let i=2;i<size;i++){h.append('Peserta',{id_peserta:'PST-PREVIEW-'+i,nama_pegawai:'Peserta Contoh '+String(i+1).padStart(2,'0'),nip:'199001012020011001',unit_kerja:'Unit Contoh'});h.append('Keikutsertaan',{id_keikutsertaan:'KST-PREVIEW-'+i,id_peserta:'PST-PREVIEW-'+i,id_program:'PRG001',id_jenjang:'JEN001',unit_kerja_saat_pelatihan:'Unit Pengembangan Kompetensi Aparatur',status_keikutsertaan:'terdaftar'});}
 h.append('Kehadiran',{id_kehadiran:'KHD-PREVIEW-ABSENT',id_sesi:'SES004',id_keikutsertaan:'KST001',metode_input:'manual_status_v1',status_kehadiran:'manual_sakit',status_validasi:'terverifikasi'});const panitia=h.call(h.staff,'muatEvaluasiPanitiaSesi','SES001');h.call(h.staff,'simpanEvaluasiPanitiaSesi',{id_sesi:'SES001',rubrik:panitia.rubrik,versi_sumber:panitia.versi_sumber,id_permintaan:'report_preview_panitia_0001',nilai:[{id_keikutsertaan:'KST001',versi:'',skor:{kedisiplinan:4,kerja_sama:4,prakarsa:4},catatan:'Penilaian contoh Panitia'}]});h.call(h.teacher,'simpanEvaluasiPesertaSesi',h.payload());h.note({keterangan:'Peserta aktif memberikan masukan dalam diskusi kelompok.'});
 const r=h.report();r.id_laporan='LAP-CONTOH-'+size+'-PESERTA';r.waktu='2026-11-03 09:00:00';const layout=c.susunHalamanLaporan_(r);
 execFileSync('python',['-c',`import sys,json,matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path
folder=Path(sys.argv[1])
for i,img in enumerate(json.load(sys.stdin)):
 rows=img['rows'];fig,ax=plt.subplots(figsize=(10,10*img['height']/img['width']),dpi=100);labels=[r[0] for r in rows];ax.barh(labels,[r[1] for r in rows],color=['#'+c for c in img['colors']]);ax.invert_yaxis();ax.set_xlim(left=0);ax.set_title(img['title'],fontsize=11);ax.grid(axis='x',alpha=.15);ax.set_axisbelow(True);fig.tight_layout();fig.savefig(folder/('chart'+str(i)+'.png'),facecolor='white');plt.close(fig)` ,dir],{input:JSON.stringify(layout.images)});
 let next=0;c.Charts={ColumnType:{STRING:'string',NUMBER:'number'},newDataTable:()=>({addColumn(){return this;},addRow(){return this;},build(){return [];}}),newBarChart:()=>{const b={};for(const n of ['setDataTable','setTitle','setDimensions','setColors','setOption'])b[n]=()=>b;b.build=()=>({getAs:()=>h.blob(fs.readFileSync(dir+'/chart'+(next++)+'.png'))});return b;}};
 const draft=c.bangunDOCXLaporan_(r);fs.writeFileSync(dir+'/laporan-'+size+'.docx',Buffer.from(draft.blob.getBytes()));fs.writeFileSync(dir+'/laporan-'+size+'.json',JSON.stringify({pages:draft.halaman,toc:draft.daftar_isi,report_id:r.id_laporan},null,2));
 console.log(size+' participants, '+draft.halaman+' planned pages, '+layout.images.length+' charts');
}
