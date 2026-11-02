// Owner-only reports. Existing attendance/scoring helpers remain the source of truth.
function programLaporanSelesai_(id) {
  const key = String(id || '').trim();
  const rows = tabelIndex_('Program', ['id_program','nama_program','status_program']).records.filter(p => String(p.id_program).trim() === key);
  if (!key || rows.length !== 1) throw Error('Pilih satu program yang valid.');
  if (String(rows[0].status_program).trim().toLowerCase() !== 'selesai') throw Error('Laporan hanya tersedia untuk program berstatus selesai.');
  return rows[0];
}
function dataLaporanProgram_(id) {
  wajibPemilikIndex_();
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    if(typeof periksaUlangSesiPanitia_==='function')periksaUlangSesiPanitia_();
    pastikanTidakAdaHapusTertunda_();
    const program = programLaporanSelesai_(id), txt = v => String(v == null ? '' : v).trim();
    const zona = databasePelatihan_().getSpreadsheetTimeZone();
    function scoped(sheet, fields, key) {
      const all=tabelIndex_(sheet,fields).records, selected=all.filter(r=>txt(r.id_program)===txt(id));
      const selectedIds=new Set(selected.map(r=>txt(r[key]))),counts=new Map();
      all.forEach(r=>{const value=txt(r[key]);if(selectedIds.has(value))counts.set(value,(counts.get(value)||0)+1);});
      if(Array.from(counts.values()).some(n=>n!==1))throw Error('ID lintas program duplikat pada '+sheet+'. Periksa Data.');
      return selected;
    }
    const data = {
      jenjang: typeof konteksJenjang_==='function'?konteksJenjang_(id,'',false).daftar:[],
      program: Object.assign({},program,{jenjang:typeof namaJenjangProgram_==='function'?namaJenjangProgram_(id,program.jenjang):program.jenjang}), sesi: scoped('Sesi',['id_sesi','id_program','nama_sesi','tanggal_sesi','jam_mulai','jam_selesai'],'id_sesi'),
      ikut: scoped('Keikutsertaan',['id_keikutsertaan','id_program','id_peserta','status_keikutsertaan','unit_kerja_saat_pelatihan'],'id_keikutsertaan'),
      peserta: tabelIndex_('Peserta',['id_peserta','nama_pegawai']).records,
      hadir: tabelIndex_('Kehadiran',['id_kehadiran','id_sesi','id_keikutsertaan','waktu_datang','waktu_pulang','waktu_datang_terverifikasi','waktu_pulang_terverifikasi']).records,
      catatan: tabelIndex_('Catatan_Perilaku',['id_catatan','id_keikutsertaan','id_sesi','id_indikator','status_validasi','keterangan','waktu_kejadian']).records,
      indikator: tabelIndex_('Indikator_Perilaku',['id_indikator','kode_indikator','jenis_indikator','definisi_indikator']).records
    };
    if(typeof pastikanTidakAdaPresensiManualTertunda_==='function')pastikanTidakAdaPresensiManualTertunda_(data.sesi.map(s=>txt(s.id_sesi)));
    const r = ringkasLaporanProgram_(data, Date.now(), zona);
    try { r.jadwal = muatKelolaProgramIndex(id).sesi; } catch(e) { r.jadwal=[];r.peringatan.push('Rincian jeda/durasi tidak tersedia: '+e.message); }
    try { r.jp = muatRekapJPProgramIndex(id); } catch(e) { r.peringatan.push('Rekap JP tidak tersedia: '+e.message); }
    try { r.nilai = muatNilaiPerilakuProgramIndex(id); if (!r.nilai.aturan) r.peringatan.push('Aturan nilai perilaku belum tersedia.'); } catch(e) { r.peringatan.push('Nilai perilaku tidak tersedia: '+e.message); }
    try { r.evaluasi=evaluasiUntukLaporan_(r); } catch(e) { r.evaluasi={tersedia:false,alasan:e.message,kelompok:[]};r.peringatan.push('Evaluasi belum tersedia: '+e.message); }
    r.id_laporan='LAP-'+Utilities.getUuid();
    r.versi_sumber=typeof hashAkses_==='function'?hashAkses_(JSON.stringify([data,r.jadwal,r.jp,r.nilai,r.evaluasi])):'';
    programLaporanSelesai_(id);
    return r;
  } finally {lock.releaseLock();}
}
function ringkasLaporanProgram_(d, now, zona) {
  const txt = v => String(v == null ? '' : v).trim(), norm = v => txt(v).toLowerCase();
  if (norm(d.program.status_program) !== 'selesai') throw Error('Program belum selesai.');
  if (d.ikut.length > 1000 || d.sesi.length > 300) throw Error('Laporan mendukung maksimal 1.000 peserta dan 300 sesi per program.');
  function map(rows,key,label) { const m=new Map(); rows.forEach(r=>{const id=txt(r[key]);if(!id||m.has(id))throw Error('ID kosong/duplikat pada '+label+'. Periksa Data terlebih dahulu.');m.set(id,r);});return m; }
  const people=map(d.peserta,'id_peserta','Peserta'), members=map(d.ikut,'id_keikutsertaan','Keikutsertaan'), sessions=map(d.sesi,'id_sesi','Sesi'), indicators=map(d.indikator,'id_indikator','Indikator');
  const levelNames=new Map((d.jenjang||[]).map(j=>[j.id,j.nama]));
  const sejenjang=(s,k)=>!Object.prototype.hasOwnProperty.call(s,'id_jenjang')&&!Object.prototype.hasOwnProperty.call(k,'id_jenjang')||Boolean(txt(s.id_jenjang))&&txt(s.id_jenjang)===txt(k.id_jenjang);
  const seenPeople=new Set(), peringatan=[];
  const peserta=d.ikut.map(k=>{
    const person=people.get(txt(k.id_peserta));if(!person||seenPeople.has(txt(k.id_peserta)))throw Error('Relasi peserta hilang/duplikat dalam program.');seenPeople.add(txt(k.id_peserta));
    return {id:txt(k.id_keikutsertaan),id_jenjang:txt(k.id_jenjang),nama_jenjang:levelNames.get(txt(k.id_jenjang))||'',nama:txt(person.nama_pegawai),unit:txt(k.unit_kerja_saat_pelatihan),status:norm(k.status_keikutsertaan),sakit:0,izin_manual:0,alpa:0,lengkap:0,belum_lengkap:0,belum_tercatat:0,verifikasi:0,terlambat:0,sasaran:0};
  }).sort((a,b)=>a.nama.localeCompare(b.nama,'id'));
  const aktif=peserta.filter(p=>p.status==='terdaftar'), records=new Map();let foreign=0;
  d.hadir.forEach(h=>{const sid=txt(h.id_sesi),kid=txt(h.id_keikutsertaan);if(!sessions.has(sid))return;if(!members.has(kid)||!sejenjang(sessions.get(sid),members.get(kid))){foreign++;return;}const key=JSON.stringify([sid,kid]);if(records.has(key))throw Error('Kehadiran duplikat pada sesi '+sid);records.set(key,h);});
  const total={sakit:0,izin_manual:0,alpa:0,lengkap:0,belum_lengkap:0,belum_tercatat:0,verifikasi:0,sasaran:0,terlambat:0};let selesai=0,mendatang=0,invalid=0;
  const tanggal=v=>v instanceof Date?Utilities.formatDate(v,zona,'yyyy-MM-dd'):txt(v);
  const jam=v=>v instanceof Date?Utilities.formatDate(v,zona,'HH:mm'):txt(v);
  const sesi=d.sesi.map(s=>{
    const row={id:txt(s.id_sesi),id_jenjang:txt(s.id_jenjang),nama_jenjang:levelNames.get(txt(s.id_jenjang))||'',nama:txt(s.nama_sesi),tanggal:tanggal(s.tanggal_sesi),mulai:jam(s.jam_mulai),selesai:jam(s.jam_selesai),jp:txt(s.status_jp),sakit:0,izin_manual:0,alpa:0,lengkap:0,belum_lengkap:0,belum_tercatat:0,verifikasi:0,sasaran:0,status:'jadwal_bermasalah'};
    let end;try{const start=waktuJadwalJP_(s.tanggal_sesi,s.jam_mulai,zona);end=waktuJadwalJP_(s.tanggal_sesi,s.jam_selesai,zona);if(end<=start)throw Error('Jam tidak valid');}catch(e){invalid++;return row;}
    if(end>now){mendatang++;row.status='belum_selesai';return row;}selesai++;row.status='selesai';
    aktif.filter(p=>sejenjang(s,members.get(p.id))).forEach(p=>{const state=statusKehadiranProfil_(s,records.get(JSON.stringify([row.id,p.id])),now,zona);const key=state.status==='sakit'?'sakit':state.status==='izin'?'izin_manual':state.status==='alpa'?'alpa':state.status==='hadir_lengkap'?'lengkap':state.status==='belum_lengkap'?'belum_lengkap':state.status==='belum_tercatat_hadir'?'belum_tercatat':'verifikasi';p[key]++;row[key]++;total[key]++;p.sasaran++;row.sasaran++;total.sasaran++;if(state.terlambat_manual||Number.isFinite(state.terlambat)&&state.terlambat>10){p.terlambat++;row.terlambat=(row.terlambat||0)+1;total.terlambat++;}});
    return row;
  }).sort((a,b)=>a.tanggal.localeCompare(b.tanggal)||a.mulai.localeCompare(b.mulai));
  const validasi={disetujui:0,belum_divalidasi:0,ditolak:0,lainnya:0}, jenis={positif:0,negatif:0,izin:0,lainnya:0}, byIndicator=new Map(), seenNotes=new Set();
  const catatan=[];
  d.catatan.forEach(c=>{
    const kid=txt(c.id_keikutsertaan),sid=txt(c.id_sesi);if(!members.has(kid)){if(sessions.has(sid))foreign++;return;}
    if(sid&&(!sessions.has(sid)||!sejenjang(sessions.get(sid),members.get(kid)))){foreign++;return;}
    const id=txt(c.id_catatan);if(!id||seenNotes.has(id))throw Error('ID catatan kosong/duplikat.');seenNotes.add(id);
    const i=indicators.get(txt(c.id_indikator));if(!i)peringatan.push('Indikator catatan '+id+' tidak ditemukan.');
    const status=norm(c.status_validasi)||'belum_divalidasi';validasi[Object.prototype.hasOwnProperty.call(validasi,status)?status:'lainnya']++;
    const tipe=i&&txt(i.kode_indikator)==='IZIN_SESI'?'izin':i&&['positif','negatif'].includes(norm(i.jenis_indikator))?norm(i.jenis_indikator):'lainnya';jenis[tipe]++;
    const label=i?(txt(i.definisi_indikator)||txt(i.kode_indikator)):'Indikator tidak tersedia';
    if(status==='disetujui')byIndicator.set(label,(byIndicator.get(label)||0)+1);
    catatan.push({id:id,id_keikutsertaan:kid,id_sesi:sid,nama:people.get(txt(members.get(kid).id_peserta)).nama_pegawai,sesi:sid?txt(sessions.get(sid).nama_sesi):'Cakupan program',waktu:c.waktu_kejadian instanceof Date?Utilities.formatDate(c.waktu_kejadian,zona,'yyyy-MM-dd HH:mm:ss'):txt(c.waktu_kejadian),indikator:label,jenis:tipe,status:status,keterangan:txt(c.keterangan)});
  });
  catatan.sort((a,b)=>a.waktu.localeCompare(b.waktu)||a.id.localeCompare(b.id));
  if(catatan.length>3000)throw Error('Laporan mendukung maksimal 3.000 catatan per program.');
  if(!d.sesi.length)peringatan.push('Program tidak memiliki sesi.');if(!aktif.length)peringatan.push('Tidak ada peserta berstatus terdaftar.');
  if(mendatang)peringatan.push(mendatang+' sesi belum selesai menurut jadwal; tidak dihitung dalam persentase kehadiran.');
  if(invalid)peringatan.push(invalid+' jadwal sesi tidak valid; dikeluarkan dari penyebut kehadiran.');
  if(foreign)peringatan.push(foreign+' baris dengan relasi lintas program/tidak sesuai dikeluarkan dari laporan.');
  if(total.belum_lengkap+total.verifikasi)peringatan.push('Masih ada catatan kehadiran yang perlu dilengkapi atau diverifikasi.');
  if(validasi.belum_divalidasi)peringatan.push(validasi.belum_divalidasi+' catatan belum divalidasi.');
  return {sukses:true,program:{id:txt(d.program.id_program),nama:txt(d.program.nama_program),kategori:txt(d.program.kategori_pelatihan),jenjang:txt(d.program.jenjang),mulai:tanggal(d.program.tanggal_mulai),selesai:tanggal(d.program.tanggal_selesai)},waktu:Utilities.formatDate(new Date(now),zona,'yyyy-MM-dd HH:mm:ss'),zona:zona,peserta:peserta,sesi:sesi,total:total,sesi_selesai:selesai,jenis:jenis,validasi:validasi,catatan:catatan,indikator:Array.from(byIndicator,([nama,jumlah])=>({nama:nama,jumlah:jumlah})).sort((a,b)=>b.jumlah-a.jumlah),peringatan:peringatan,jp:null,nilai:null};
}
function muatPratinjauLaporanProgram(id) {
  if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('muatPratinjauLaporanProgram');
  const r=dataLaporanProgram_(String(id||'').trim());
  return {sukses:true,program:r.program,waktu:r.waktu,peserta:r.peserta.length,sesi:r.sesi.length,catatan:r.catatan.length,peringatan:r.peringatan};
}
function buatPDFLaporanProgram(id) {
  if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('buatPDFLaporanProgram');
  wajibPemilikIndex_();const lock=LockService.getUserLock();if(!lock.tryLock(1000))throw Error('Pembuatan laporan masih berjalan. Tunggu proses sebelumnya.');
  try{
    const r=dataLaporanProgram_(String(id||'').trim()),draft=bangunDOCXLaporan_(r),bytes=konversiLaporanPDF_(draft,r);
    const filename=('Laporan '+r.program.nama+' '+r.id_laporan.slice(-8)).replace(/[\\/:*?"<>|\r\n]/g,' ').slice(0,150)+'.pdf';
    return {sukses:true,nama:filename,mime:'application/pdf',base64:Utilities.base64Encode(bytes),waktu:r.waktu,id_laporan:r.id_laporan,peringatan:r.peringatan};
  }finally{lock.releaseLock();}
}

/** Build descriptive evaluations from the same validated journal readers as spreadsheet recap. No writes. */
function evaluasiUntukLaporan_(r) {
  if(typeof konfigurasiEvaluasi_!=='function'||!konfigurasiEvaluasi_())return {tersedia:false,alasan:'Spreadsheet penilaian belum dihubungkan.',kelompok:[]};
  const d=bacaSumberRekapEvaluasi_(),pid=r.program.id;
  for(const name of ['Program','Jenjang','Sesi','Keikutsertaan'])d[name]=d[name].filter(x=>String(x.id_program).trim()===pid);
  const sids=new Set(d.Sesi.map(x=>String(x.id_sesi).trim())),kids=new Set(d.Keikutsertaan.map(x=>String(x.id_keikutsertaan).trim())),pids=new Set(d.Keikutsertaan.map(x=>String(x.id_peserta).trim()));
  d.Peserta=d.Peserta.filter(x=>pids.has(String(x.id_peserta).trim()));d.Catatan_Perilaku=d.Catatan_Perilaku.filter(x=>kids.has(String(x.id_keikutsertaan).trim()));
  for(const name of ['penugasan','evaluasi','evaluasi_pengajar','evaluasi_panitia'])d[name]=d[name].filter(e=>sids.has(e.id_sesi));
  const built=bangunRekapEvaluasi_(d,r.zona),schema=skemaRekapEvaluasi_();
  const ended=new Set(r.sesi.filter(s=>s.status==='selesai').map(s=>s.id)),active=new Set(r.peserta.filter(p=>p.status==='terdaftar').map(p=>p.id));
  const objects=name=>(built.rows[name]||[]).map(row=>Object.fromEntries(schema[name].map((k,i)=>[k,row[i]]))).filter(x=>x['ID Program']===r.program.id&&ended.has(x['ID Sesi']));
  const selected=objects('Rekap_Penilaian_Terpadu').filter(x=>active.has(x['ID Keikutsertaan']));
  const teacherNames=new Map();petaPengajarSesi_(d.penugasan).forEach(a=>{if(a.status==='aktif')teacherNames.set(a.id_sesi,a.nama_pengajar||'Belum ditetapkan');});
  r.sesi.forEach(s=>s.pengajar=teacherNames.get(s.id)||'Belum ditetapkan');
  const defs=[['pengajar','Pengajar terhadap Peserta',aspekEvaluasi_(),selected,'Catatan Pengajar','Waktu Penilaian'],['panitia','Admin/Petugas terhadap Peserta',aspekPanitia_(),objects('Rekap_Evaluasi_Panitia').filter(x=>x['Status Rekaman']==='terkini'&&active.has(x['ID Keikutsertaan'])),'Catatan Panitia','Waktu Penilaian'],['instruktur','Admin terhadap Pengajar',aspekPengajarAdmin_(),objects('Rekap_Evaluasi_Pengajar').filter(x=>x['Status Rekaman']==='terkini'),'Catatan Admin','Waktu Penilaian']];
  const groups=defs.map(([id,nama,aspek,rows,note,time])=>{
    const seen=new Set(),detail=rows.map(x=>{
      const key=JSON.stringify([x['ID Sesi'],id==='instruktur'?x['ID Pengajar']:x['ID Keikutsertaan']]);if(seen.has(key))throw Error('Duplikat pasangan evaluasi laporan.');seen.add(key);
      const skor=aspek.map(a=>typeof x[a.nama]==='number'&&Number.isInteger(x[a.nama])&&x[a.nama]>=1&&x[a.nama]<=5?x[a.nama]:null),filled=skor.every(n=>n!==null),stale=filled&&x['Status Sumber']!=='sesuai';
      return {sesi:x.Sesi,jenjang:x.Jenjang,nama:id==='instruktur'?x.Pengajar:x['Nama Peserta'],unit:id==='instruktur'?'':x['Unit Saat Pelatihan'],pengajar:x.Pengajar||'',skor,diisi:filled,berubah:stale,status:!filled?'Belum diisi':stale?'Sumber berubah; periksa kembali':'Terisi; sumber sesuai',catatan:String(x[note]||''),waktu:String(x[time]||'')};
    });
    const filled=detail.filter(x=>x.diisi),valid=filled.filter(x=>!x.berubah);
    return {id,nama,aspek:aspek.map(a=>a.nama),diharapkan:detail.length,diisi:filled.length,belum:detail.length-filled.length,berubah:filled.length-valid.length,dasar_rata:valid.length,rata:aspek.map((a,i)=>valid.length?valid.reduce((n,x)=>n+x.skor[i],0)/valid.length:null),detail};
  });
  return {tersedia:true,alasan:'Skala 1–5 per aspek. Rata-rata deskriptif hanya dari penilaian terisi dengan sumber sesuai; bukan nilai akhir gabungan.',kelompok:groups};
}
function periksaIzinLaporanKini_(id){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{if(typeof periksaUlangSesiPanitia_==='function')periksaUlangSesiPanitia_();wajibPemilikIndex_();pastikanTidakAdaHapusTertunda_();programLaporanSelesai_(id);}finally{lock.releaseLock();}
}
/** Convert controlled DOCX pages using Drive; only temporary files, no public sharing. */
function konversiLaporanPDF_(draft,r,afterImport){
  const token=ScriptApp.getOAuthToken(),tag='laporan-'+Utilities.getUuid(),boundary='laporan_'+Utilities.getUuid().replace(/-/g,''),meta={name:'TEMP Laporan '+tag,mimeType:'application/vnd.google-apps.document',appProperties:{monitoringLaporan:tag}};
  const part='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+boundary+'\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n';
  const start=Utilities.newBlob(part).getBytes(),end=Utilities.newBlob('\r\n--'+boundary+'--\r\n').getBytes();let id='',result=null,responded=false;
  try{
    const response=UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'post',contentType:'multipart/related; boundary='+boundary,headers:{Authorization:'Bearer '+token},payload:start.concat(draft.blob.getBytes(),end),muteHttpExceptions:true});
    responded=true;
    if(response.getResponseCode()<200||response.getResponseCode()>=300)throw Error('Konversi dokumen laporan ditolak Google (HTTP '+response.getResponseCode()+'). Pastikan Google Drive API aktif pada proyek Google Cloud Apps Script dan otorisasi pemilik sudah diperbarui.');
    id=JSON.parse(response.getContentText()).id;if(!id)throw Error('ID dokumen sementara tidak diterima.');if(afterImport)afterImport(id);
    periksaIzinLaporanKini_(r.program.id);
    const blob=DriveApp.getFileById(id).getAs('application/pdf'),bytes=blob.getBytes();
    if(bytes.length>8*1024*1024)throw Error('PDF melebihi batas 8 MB.');
    // Google Docs may reflow imported pages. Refuse a misleading automatic TOC.
    const raw=Utilities.newBlob(bytes).getDataAsString('ISO-8859-1'),pages=(raw.match(/\/Type\s*\/Page\b/g)||[]).length;
    if(pages!==draft.halaman)throw Error('Tata letak PDF berubah saat konversi ('+pages+' halaman; rancangan '+draft.halaman+'). Daftar isi belum dapat dipastikan. Coba ulang; laporkan ID '+r.id_laporan+' bila tetap terjadi.');
    periksaIzinLaporanKini_(r.program.id);result=bytes;return bytes;
  }catch(e){if(!id&&!responded)throw Error('Konversi belum terkonfirmasi. Periksa dokumen TEMP Laporan '+tag+' di Drive pemilik bila pembersihan belum berhasil. '+e.message);throw e;}finally{
    try{
      if(id)DriveApp.getFileById(id).setTrashed(true);
      else{const q=encodeURIComponent("trashed = false and appProperties has { key='monitoringLaporan' and value='"+tag+"' }");const res=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files?q='+q+'&fields=files(id)&pageSize=100',{headers:{Authorization:'Bearer '+token},muteHttpExceptions:true});if(res.getResponseCode()!==200)throw Error('Pencarian dokumen sementara gagal');JSON.parse(res.getContentText()).files.forEach(f=>DriveApp.getFileById(f.id).setTrashed(true));}
    }catch(e){if(result)r.peringatan.push('Dokumen TEMP Laporan '+tag+' belum dapat dibersihkan. Hapus melalui Drive pemilik.');else console.error('Periksa dokumen TEMP Laporan '+tag+' di Drive pemilik; pembersihan belum terkonfirmasi.');}
  }
}

// Authorize native document/Drive export when prompted by Google.
function otorisasiLaporanProgram(){
  if(typeof konteksSesiPanitia_!=='undefined'&&konteksSesiPanitia_){if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('otorisasiLaporanProgram');wajibPemilikIndex_();}
  else if(typeof wajibPemilikAsliAkses_==='function')wajibPemilikAsliAkses_();else wajibPemilikIndex_();
  let id='';try{const doc=DocumentApp.create('TEMP Otorisasi Laporan');id=doc.getId();doc.getBody().appendParagraph('Pemeriksaan izin laporan.');doc.saveAndClose();DriveApp.getFileById(id).getAs('application/pdf');return 'Izin laporan siap. Kembali ke Pengelolaan.';}finally{if(id)DriveApp.getFileById(id).setTrashed(true);}
}
