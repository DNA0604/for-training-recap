/** Nilai evaluasi peserta: Pengajar 60% + Panitia 40%; JP/perilaku tetap terpisah. */
function aksiBobotNilaiAkhir_(){return 'bobot_nilai_akhir';}
function auditBobotNilaiAkhir_(){return tabelIndex_('Riwayat_Validasi',['id_riwayat','jenis_data','id_referensi','jenis_tindakan','nilai_sebelum','nilai_sesudah','diubah_oleh','waktu_perubahan','id_transaksi_perubahan','status_transaksi']).records;}
function bobotNilaiAkhir_(records,id){
 const t=v=>String(v==null?'':v).trim(),seen=new Set();let latest={schema:1,id_program:t(id),pengajar:60,panitia:40,versi:'DEFAULT-60-40',sumber:'bawaan'};
 records.filter(r=>r.jenis_tindakan===aksiBobotNilaiAkhir_()&&t(r.id_referensi)===t(id)).forEach(r=>{
  if(r.jenis_data!=='Program'||r.status_transaksi!=='SELESAI'||!r.id_riwayat||seen.has(t(r.id_transaksi_perubahan)))throw Error('Riwayat bobot nilai akhir tidak valid atau duplikat.');seen.add(t(r.id_transaksi_perubahan));
  const p=JSON.parse(r.nilai_sesudah);if(p.schema!==1||t(p.id_program)!==t(id)||!Number.isInteger(p.pengajar)||!Number.isInteger(p.panitia)||p.pengajar<1||p.panitia<1||p.pengajar+p.panitia!==100)throw Error('Bobot nilai akhir program tidak valid.');
  latest={schema:1,id_program:t(id),pengajar:p.pengajar,panitia:p.panitia,versi:t(r.id_riwayat),sumber:'pengaturan_program'};
 });return latest;
}
function muatBobotNilaiAkhirIndex(id){
 if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('muatBobotNilaiAkhirIndex');adminEvaluasi_();
 const p=barisTargetAkses_('Program','id_program',id);return {sukses:true,nama_program:String(p.nama_program),aturan:bobotNilaiAkhir_(auditBobotNilaiAkhir_(),id)};
}
function simpanBobotNilaiAkhirIndex(d){
 if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('simpanBobotNilaiAkhirIndex');const actor=adminEvaluasi_();d=d||{};
 const t=v=>String(v==null?'':v).trim(),id=t(d.id_program),request=permintaanEvaluasi_(d.id_permintaan),alasan=t(d.alasan),input={schema:1,id_program:id,pengajar:d.pengajar,panitia:d.panitia};
 if(!Number.isInteger(input.pengajar)||!Number.isInteger(input.panitia)||input.pengajar<1||input.panitia<1||input.pengajar+input.panitia!==100||!alasan||alasan.length>2000||alasan.startsWith('='))throw Error('Kedua bobot harus angka bulat 1–99, total 100%, dan alasan wajib diisi (maksimal 2.000 karakter; tidak diawali =).');
 const lock=LockService.getScriptLock();lock.waitLock(30000);try{
  pastikanTidakAdaHapusTertunda_();adminEvaluasi_();barisTargetAkses_('Program','id_program',id);
  const audit=auditBobotNilaiAkhir_(),tx='BOBOT-AKHIR|'+request,old=audit.filter(r=>r.id_transaksi_perubahan===tx);
  if(old.length){if(old.length!==1||old[0].jenis_tindakan!==aksiBobotNilaiAkhir_()||old[0].diubah_oleh!==actor||old[0].nilai_sesudah!==JSON.stringify(input)||old[0].alasan_perubahan!==alasan||old[0].status_transaksi!=='SELESAI')throw Error('ID permintaan bobot sudah digunakan untuk data berbeda.');return {sukses:true,pesan:'Bobot sebelumnya sudah tersimpan.'};}
  const before=bobotNilaiAkhir_(audit,id);if(before.versi!==t(d.versi))throw Error('Bobot sudah berubah. Muat ulang sebelum menyimpan.');
  const row={id_riwayat:'RV-'+Utilities.getUuid(),jenis_data:'Program',id_referensi:id,jenis_tindakan:aksiBobotNilaiAkhir_(),kolom_diubah:JSON.stringify(['bobot_pengajar','bobot_panitia']),nilai_sebelum:JSON.stringify(before),nilai_sesudah:JSON.stringify(input),alasan_perubahan:alasan,diubah_oleh:actor,waktu_perubahan:new Date(),id_transaksi_perubahan:tx,status_transaksi:'SELESAI'};
  const tab=tabelIndex_('Riwayat_Validasi',['id_riwayat','alasan_perubahan','kolom_diubah']),sheet=databasePelatihan_().getSheetByName('Riwayat_Validasi');sheet.appendRow(tab.header.map(k=>row[k]===undefined?'':row[k]));SpreadsheetApp.flush();
  const receipt=auditBobotNilaiAkhir_().filter(r=>r.id_riwayat===row.id_riwayat);if(receipt.length!==1||receipt[0].nilai_sesudah!==row.nilai_sesudah||receipt[0].id_transaksi_perubahan!==tx)throw Error('Tanda terima bobot belum terkonfirmasi. Coba lagi dengan permintaan yang sama.');
  return {sukses:true,pesan:'Bobot nilai akhir tersimpan. Muat ulang Rekap; perbarui snapshot spreadsheet dan laporan bila diperlukan.'};
 }finally{lock.releaseLock();}
}
function lengkapiSumberNilaiAkhir_(d,zona){
 const fields=['id_kehadiran','id_sesi','id_keikutsertaan','waktu_datang','waktu_pulang','waktu_datang_terverifikasi','waktu_pulang_terverifikasi','metode_input','status_kehadiran','status_validasi'];
 const hadir=tabelIndex_('Kehadiran',fields).records;if(hadir.length>10000)throw Error('Nilai akhir dibatasi 10.000 baris kehadiran.');
 d.Kehadiran=hadir.map(r=>Object.fromEntries(fields.map(k=>[k,r[k]===undefined?'':r[k]])));
 const audit=auditBobotNilaiAkhir_(),last=new Map();audit.filter(r=>r.jenis_data==='Kehadiran'&&r.id_transaksi_perubahan&&String(r.status_transaksi||'').trim()).forEach(r=>last.set(String(r.id_transaksi_perubahan),r));
 d.kehadiran_tertunda=[...new Set([...last.values()].filter(r=>!['SELESAI','DIBATALKAN'].includes(String(r.status_transaksi).trim().toUpperCase())).map(r=>String(r.id_referensi)))].sort();
 d.aturan_nilai_akhir=audit.filter(r=>r.jenis_tindakan===aksiBobotNilaiAkhir_());
 d.fase_nilai_akhir=d.Sesi.map(s=>{try{return [s.id_sesi,Date.now()>=waktuJadwalJP_(s.tanggal_sesi,s.jam_selesai,zona)?'berakhir':'mendatang'];}catch(e){return [s.id_sesi,'jadwal_invalid'];}});return d;
}
function bacaSumberNilaiAkhir_(){
 const specs={Program:['id_program','nama_program','status_program'],Jenjang:['id_jenjang','id_program','nama_jenjang'],Sesi:['id_sesi','id_program','id_jenjang','nama_sesi'],Keikutsertaan:['id_keikutsertaan','id_program','id_jenjang','id_peserta','status_keikutsertaan'],Peserta:['id_peserta','nama_pegawai']},d={};
 Object.keys(specs).forEach(n=>{d[n]=tabelIndex_(n,specs[n]).records;if(d[n].length>10000)throw Error('Nilai akhir dibatasi 10.000 baris sumber per tabel.');});
 d.penugasan=tabelEvaluasi_('Pengajar_Sesi').records;d.evaluasi=tabelEvaluasi_('Evaluasi_Peserta').records;d.evaluasi_panitia=jurnalPanitia_(false).records;
 return lengkapiSumberNilaiAkhir_(d,databasePelatihan_().getSpreadsheetTimeZone());
}
/** Pure aggregation of validated journal snapshots; does not write grades or infer absence. */
function bangunNilaiAkhir_(d,zona,now){
 const t=v=>String(v==null?'':v).trim(),norm=v=>t(v).toLowerCase(),round=n=>Number.isFinite(n)?Math.round((n+Number.EPSILON)*100)/100:null;
 function index(rows,key){const m=new Map();rows.forEach(r=>{const id=t(r[key]);if(!id||m.has(id))throw Error('ID sumber nilai akhir kosong/duplikat pada '+key+'.');m.set(id,r);});return m;}
 const programs=index(d.Program,'id_program'),levels=index(d.Jenjang,'id_jenjang'),people=index(d.Peserta,'id_peserta'),members=index(d.Keikutsertaan,'id_keikutsertaan'),sessions=index(d.Sesi,'id_sesi');
 const assignments=petaPengajarSesi_(d.penugasan||[]),teachers=petaNilaiEvaluasi_(d.evaluasi||[]),staff=petaPanitia_(d.evaluasi_panitia||[]),attendance=new Map(),pending=new Set(d.kehadiran_tertunda||[]),byLevel=new Map(),contexts=new Map(),weights=new Map();
 programs.forEach((p,id)=>weights.set(id,bobotNilaiAkhir_(d.aturan_nilai_akhir||[],id)));
 members.forEach(k=>{const j=levels.get(t(k.id_jenjang));if(!programs.has(t(k.id_program))||!j||t(j.id_program)!==t(k.id_program)||!people.has(t(k.id_peserta)))throw Error('Relasi peserta/Program/Jenjang nilai akhir tidak sesuai.');if(norm(k.status_keikutsertaan)==='terdaftar'){const key=t(k.id_jenjang);if(!byLevel.has(key))byLevel.set(key,[]);byLevel.get(key).push(k);}});
 (d.Kehadiran||[]).forEach(h=>{const sid=t(h.id_sesi),kid=t(h.id_keikutsertaan);if(!sessions.has(sid)||!members.has(kid))return;if(!sesuaiJenjang_(sessions.get(sid),members.get(kid)))throw Error('Relasi kehadiran nilai akhir tidak sesuai Jenjang.');const key=JSON.stringify([sid,kid]);if(attendance.has(key))throw Error('Kehadiran duplikat pada nilai akhir.');attendance.set(key,h);});
 sessions.forEach((s,id)=>{
  const p=programs.get(t(s.id_program)),j=levels.get(t(s.id_jenjang));if(!p||!j||t(j.id_program)!==t(s.id_program))throw Error('Relasi sesi/Program/Jenjang nilai akhir tidak sesuai.');
  const roster=byLevel.get(t(s.id_jenjang))||[],ps=roster.map(k=>({id_keikutsertaan:t(k.id_keikutsertaan),id_peserta:t(k.id_peserta),nama:t(people.get(t(k.id_peserta)).nama_pegawai),unit:t(k.unit_kerja_saat_pelatihan)})),a=assignments.get(id);
  const active=a&&a.status==='aktif'&&a.id_program===t(s.id_program)&&a.id_jenjang===t(s.id_jenjang)?a:null;
  let ended=false,error='';try{const start=waktuJadwalJP_(s.tanggal_sesi,s.jam_mulai,zona),end=waktuJadwalJP_(s.tanggal_sesi,s.jam_selesai,zona);if(end<=start)throw Error('Jadwal sesi tidak valid.');ended=now>=end;}catch(e){error=e.message;}
  contexts.set(id,{s,active,ended,error,teacherVersion:hashAkses_(serialAkses_([s,a,roster,ps])),staffVersion:versiSumberPanitia_(s,p,j,roster,ps)});
 });
 let pairs=0;
 const rows=[...members.values()].map(k=>{
  const id=t(k.id_keikutsertaan),pid=t(k.id_program),own=[...contexts.values()].filter(c=>sesuaiJenjang_(c.s,k)),w=weights.get(pid),p=people.get(t(k.id_peserta));
  const r={id_program:pid,id_jenjang:t(k.id_jenjang),id_keikutsertaan:id,nama:t(p.nama_pegawai),unit:t(k.unit_kerja_saat_pelatihan),nilai:null,status:'sementara',aturan:w,pengajar:{nilai:null,rata: null,terisi:0,diharapkan:0},panitia:{nilai:null,rata:null,terisi:0,diharapkan:0},sesi_total:own.length,sesi_tidak_dinilai:0,presensi_perlu_diperiksa:0,alasan:[],rincian:[]};
  if(norm(k.status_keikutsertaan)!=='terdaftar'){r.status='peserta_nonaktif';r.alasan.push('Keikutsertaan tidak aktif; nilai lama tetap pada riwayat.');return r;}
  const sum={pengajar:0,panitia:0};let waiting=0;
  own.forEach(c=>{
   if(++pairs>10000)throw Error('Nilai akhir dibatasi 10.000 pasangan peserta-sesi.');
   const sid=t(c.s.id_sesi),h=attendance.get(JSON.stringify([sid,id])),item={id_sesi:sid,nama_sesi:t(c.s.nama_sesi),status:'menunggu',keterangan:'',pengajar:null,panitia:null};r.rincian.push(item);
   if(c.error||!c.ended){waiting++;item.status=c.error?'jadwal_bermasalah':'menunggu_sesi';item.keterangan=c.error||'Sesi belum berakhir.';return;}
   let state;try{state=statusKehadiranProfil_(c.s,h,now,zona);}catch(e){state={status:'perlu_verifikasi',keterangan:e.message};}
   if(h&&pending.has(t(h.id_kehadiran))){waiting++;r.presensi_perlu_diperiksa++;item.status='presensi_belum_jelas';item.keterangan='Transaksi kehadiran belum selesai.';return;}
   if(['sakit','izin','alpa'].includes(state.status)){
    r.sesi_tidak_dinilai++;item.status='tidak_dinilai';item.keterangan='Tidak Dinilai: '+state.status.replace('alpa','Tanpa Keterangan')+'. Dikeluarkan dari kedua rata-rata; JP tetap terpisah.';
    if(!h||h.status_validasi!=='terverifikasi'){waiting++;r.presensi_perlu_diperiksa++;item.keterangan+=' Presensi menunggu verifikasi.';}return;
   }
   if(state.status!=='hadir_lengkap'){waiting++;r.presensi_perlu_diperiksa++;item.status='presensi_belum_jelas';item.keterangan='Presensi belum jelas/lengkap; tidak dianggap tidak hadir atau nilai nol.';return;}
   if(!h||h.status_validasi!=='terverifikasi'){waiting++;r.presensi_perlu_diperiksa++;}
   const g=c.active?teachers.get(kunciNilaiEvaluasi_(c.active.id_pengajar,sid,id)):null,v=staff.get(kunciPanitia_(sid,id));
   for(const [name,entry,version,aspects] of [['pengajar',g,c.teacherVersion,aspekEvaluasi_()],['panitia',v,c.staffVersion,aspekPanitia_()]]){
    if(entry&&(entry.id_peserta!==t(k.id_peserta)||entry.id_program!==pid||entry.id_jenjang!==t(k.id_jenjang)))throw Error('Relasi nilai peserta berubah. Periksa jurnal evaluasi.');
    if(entry&&entry.versi_sumber===version){const mean=aspects.reduce((n,a)=>n+entry.skor[a.id],0)/aspects.length;sum[name]+=mean;r[name].terisi++;item[name]=round(mean/5*100);}
   }
   item.status=item.pengajar!==null&&item.panitia!==null?'dinilai':'belum_lengkap';item.keterangan=item.status==='dinilai'?'Rata-rata aspek dikonversi ke 100; setiap sesi berbobot sama.':'Evaluasi belum diisi, sumber berubah, atau Pengajar sesi belum ditetapkan. Nilai kosong bukan nol.';
  });
  for(const name of ['pengajar','panitia']){r[name].diharapkan=own.length-r.sesi_tidak_dinilai;if(r[name].terisi){r[name].rata=round(sum[name]/r[name].terisi);r[name].nilai=round(sum[name]/r[name].terisi/5*100);}}
  if(r.pengajar.terisi&&r.panitia.terisi)r.nilai=round((sum.pengajar/r.pengajar.terisi/5*100*w.pengajar+sum.panitia/r.panitia.terisi/5*100*w.panitia)/100);
  const missing=own.length-r.sesi_tidak_dinilai;
  if(!own.length)r.alasan.push('Belum ada sesi untuk Jenjang peserta.');
  if(waiting)r.alasan.push(waiting+' sesi/presensi perlu dilengkapi atau diverifikasi.');
  if(r.pengajar.terisi<missing)r.alasan.push((missing-r.pengajar.terisi)+' evaluasi Pengajar belum tersedia/sesuai.');
  if(r.panitia.terisi<missing)r.alasan.push((missing-r.panitia.terisi)+' evaluasi Panitia belum tersedia/sesuai.');
  if(own.length&&!missing&&!waiting){r.status='tidak_dinilai';r.alasan.push('Seluruh sesi tercatat tidak dihadiri; tidak ada dasar rata-rata.');}
  else if(r.nilai!==null&&!waiting&&r.pengajar.terisi===missing&&r.panitia.terisi===missing&&norm(programs.get(pid).status_program)==='selesai')r.status='lengkap';
  if(norm(programs.get(pid).status_program)!=='selesai'&&r.status!=='tidak_dinilai')r.alasan.push('Program belum ditandai selesai.');
  if(r.nilai===null&&r.status==='sementara')r.alasan.push('Nilai gabungan menunggu dasar penilaian pada kedua komponen.');
  return r;
 });return {sukses:true,aturan:[...weights.values()],peserta:rows};
}
function nilaiAkhirUntukRekap_(id,visible){
 if(typeof pengajarDalamKonteksAkses_==='function'&&pengajarDalamKonteksAkses_())return {sukses:true,tersedia:false,pesan:'Nilai gabungan tersedia untuk Admin dan Petugas dalam penugasan.',peserta:[]};
 if(typeof konfigurasiEvaluasi_!=='function'||!konfigurasiEvaluasi_())return {sukses:true,tersedia:false,pesan:'Spreadsheet penilaian belum dihubungkan.',peserta:[]};
 const d=bacaSumberNilaiAkhir_(),ids=new Set(visible.map(k=>String(k.id_keikutsertaan))),levels=new Set(visible.map(k=>String(k.id_jenjang)));
 d.Program=d.Program.filter(p=>String(p.id_program)===id);d.Jenjang=d.Jenjang.filter(j=>String(j.id_program)===id&&levels.has(String(j.id_jenjang)));d.Sesi=d.Sesi.filter(s=>String(s.id_program)===id&&levels.has(String(s.id_jenjang)));d.Keikutsertaan=d.Keikutsertaan.filter(k=>ids.has(String(k.id_keikutsertaan)));
 const r=bangunNilaiAkhir_(d,databasePelatihan_().getSpreadsheetTimeZone(),Date.now());r.tersedia=true;r.aturan=r.aturan[0]||bobotNilaiAkhir_(d.aturan_nilai_akhir,id);return r;
}
function barisRekapNilaiAkhir_(d,zona){
 return bangunNilaiAkhir_(d,zona,Date.now()).peserta.map(r=>[r.id_program,String((d.Program.find(p=>String(p.id_program)===r.id_program)||{}).nama_program||''),r.id_jenjang,r.id_keikutsertaan,r.nama,r.unit,r.aturan.pengajar,r.aturan.panitia,r.pengajar.nilai===null?'':r.pengajar.nilai,r.panitia.nilai===null?'':r.panitia.nilai,r.nilai===null?'':r.nilai,r.status,r.pengajar.terisi,r.panitia.terisi,r.pengajar.diharapkan,r.sesi_tidak_dinilai,r.presensi_perlu_diperiksa,r.aturan.versi,r.alasan.join('\n')]);
}
