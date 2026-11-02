/** Presensi berbasis status. Tidak menciptakan waktu scan atau catatan/poin perilaku. */
function statusPresensiManual_(r){
  if(!r||String(r.metode_input||'').trim()!=='manual_status_v1')return null;
  const status=String(r.status_kehadiran||'').replace(/^manual_/,''),labels={hadir:'Hadir',terlambat:'Terlambat',sakit:'Sakit',izin:'Izin',alpa:'Alpa'};
  if(!Object.prototype.hasOwnProperty.call(labels,status)||String(r.status_kehadiran)!=='manual_'+status)throw Error('Status presensi manual tidak valid.');
  if(['waktu_datang','waktu_pulang','waktu_datang_terverifikasi','waktu_pulang_terverifikasi'].some(k=>r[k]!==''&&r[k]!=null))throw Error('Presensi status bercampur dengan waktu scan. Periksa Kehadiran.');
  return {status,label:labels[status],hadir:['hadir','terlambat'].includes(status),terlambat:status==='terlambat',keterangan:String(r.alasan_koreksi||'')};
}
function hitungJPManual_(r,p){
  const m=statusPresensiManual_(r);if(!m)throw Error('Sumber bukan presensi manual berbasis status.');
  if(!Number.isFinite(p.mulai)||!Number.isFinite(p.selesai)||p.selesai<=p.mulai)throw Error('Jadwal presensi manual tidak valid.');
  const clip=ranges=>gabungRentangJP_(ranges.map(x=>[Math.max(p.mulai,x[0]),Math.min(p.selesai,x[1])]));
  const total=ranges=>ranges.reduce((n,x)=>n+x[1]-x[0],0)/60000;
  const acuan=(p.selesai-p.mulai)/60000-total(clip(p.jeda||[]));
  const efektif=(p.selesai-p.mulai)/60000-total(clip((p.jeda||[]).concat(p.izin||[])));
  const diakui=m.hadir?Math.max(0,efektif-(m.terlambat?15:0)):0;
  return {durasi_aktual_menit:'',durasi_diakui_menit:diakui,menit_terlambat:'',menit_pengurang_jp:Math.max(0,acuan-diakui),jp_diakui_presisi:diakui/45};
}
function kolomJPManual_(){return ['durasi_aktual_menit','durasi_diakui_menit','menit_terlambat','menit_pengurang_jp','jp_diakui_presisi','usulan_durasi_diakui_menit','usulan_jp_diakui_presisi'];}
function pastikanTidakAdaPresensiManualTertunda_(sesi,ikut,allow){
  const latest=new Map();tabelIndex_('Riwayat_Validasi',['id_transaksi_perubahan','jenis_tindakan','nilai_sesudah','status_transaksi']).records.filter(r=>r.jenis_tindakan==='presensi_manual_status').forEach(r=>latest.set(String(r.id_transaksi_perubahan),r));
  for(const [tx,r] of latest){
    if(tx===allow||r.status_transaksi==='SELESAI')continue;
    const p=JSON.parse(r.nilai_sesudah);if(!p.input)throw Error('Rencana presensi manual tidak valid.');
    if((Array.isArray(sesi)?sesi.includes(p.input.id_sesi):p.input.id_sesi===sesi)&&(!ikut||p.input.id_keikutsertaan===ikut))throw Error('Presensi manual peserta ini belum selesai. Ulangi Simpan dengan permintaan yang sama sebelum melakukan tindakan lain.');
  }
}
function simpanPresensiManualIndex(d){
  if(typeof wajibEndpointAkses_==='function')wajibEndpointAkses_('simpanPresensiManualIndex');
  const actor=wajibPemilikIndex_(),txt=v=>String(v==null?'':v).trim();d=d||{};
  const input={id_sesi:txt(d.id_sesi),id_keikutsertaan:txt(d.id_keikutsertaan),versi:txt(d.versi),status:txt(d.status),keterangan:txt(d.keterangan)};
  const req=txt(d.id_permintaan);if(!/^[a-zA-Z0-9_-]{16,100}$/.test(req))throw Error('ID permintaan manual tidak valid.');
  if(!['hadir','terlambat','sakit','izin','alpa'].includes(input.status)||!input.id_sesi||!input.id_keikutsertaan)throw Error('Pilih peserta, sesi dan status presensi.');
  if(input.keterangan.length>2000||/^=/.test(input.keterangan))throw Error('Keterangan maksimal 2.000 karakter dan tidak boleh berupa rumus.');
  const tx='PRESENSI-MANUAL|'+req,lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    pastikanTidakAdaHapusTertunda_();blokirEditTertunda_();
    // Seluruh relasi/peran diperiksa kembali di bawah lock, termasuk permintaan ulang.
    const target=targetIzinIndex_(input),s=target.sesi;
    if(typeof wajibSesiTargetAkses_==='function'&&typeof konteksSesiPanitia_!=='undefined'&&konteksSesiPanitia_)wajibSesiTargetAkses_(input.id_sesi);
    const zona=databasePelatihan_().getSpreadsheetTimeZone();
    if(Date.now()<waktuJadwalJP_(s.tanggal_sesi,s.jam_mulai,zona))throw Error('Presensi manual belum dapat diisi sebelum sesi dimulai.');
    const columns=['id_kehadiran','id_sesi','id_keikutsertaan','waktu_datang','waktu_pulang','waktu_datang_terverifikasi','waktu_pulang_terverifikasi','metode_input','status_kehadiran','status_validasi','status_scan_pulang','alasan_koreksi','dasar_verifikasi','diverifikasi_oleh','diverifikasi_pada','status_perhitungan_ulang','alasan_perhitungan_ulang','updated_at'].concat(kolomJPManual_());
    const k=tabelIndex_('Kehadiran',columns),a=tabelIndex_('Riwayat_Validasi',['id_riwayat','jenis_data','id_referensi','jenis_tindakan','kolom_diubah','nilai_sebelum','nilai_sesudah','alasan_perubahan','diubah_oleh','waktu_perubahan','id_transaksi_perubahan','status_transaksi']);
    const ss=databasePelatihan_(),sheet=ss.getSheetByName('Kehadiran'),audit=ss.getSheetByName('Riwayat_Validasi');
    pastikanTidakAdaPresensiManualTertunda_(input.id_sesi,input.id_keikutsertaan,tx);
    const history=a.records.filter(r=>txt(r.id_transaksi_perubahan)===tx);
    let plan;
    if(history.length){
      if(history.some(r=>r.jenis_tindakan!=='presensi_manual_status'||r.diubah_oleh!==actor&&(typeof petugasDalamKonteksAkses_==='function'&&petugasDalamKonteksAkses_())))throw Error('ID permintaan sudah digunakan pihak lain.');
      plan=JSON.parse(history[0].nilai_sesudah);
      if(plan.schema!==1||JSON.stringify(plan.input)!==JSON.stringify(input)||JSON.stringify(plan.header)!==JSON.stringify(k.header))throw Error('Data permintaan berbeda. Muat ulang sebelum menyimpan.');
      if(history[history.length-1].status_transaksi==='SELESAI')return {sukses:true,pesan:'Presensi manual sudah tersimpan. JP mengikuti perhitungan terbaru.',id_kehadiran:plan.id};
    }
    const pair=r=>txt(r.id_sesi)===input.id_sesi&&txt(r.id_keikutsertaan)===input.id_keikutsertaan;
    if(tabelIndex_('Log_Absensi',['id_sesi','id_keikutsertaan','status_scan']).records.some(r=>pair(r)&&txt(r.status_scan)==='diterima'))throw Error('Peserta sudah menggunakan QR pada sesi ini. Gunakan koreksi waktu untuk data QR.');
    const matches=k.records.filter(pair);if(matches.length>1)throw Error('Kehadiran peserta duplikat.');
    const current=matches[0],at=current?k.rows.findIndex(r=>txt(r[k.header.indexOf('id_kehadiran')])===txt(current.id_kehadiran)):-1,row=at<0?null:k.rows[at];
    if(current&&!statusPresensiManual_(current))throw Error('Kehadiran sudah menggunakan pencatatan waktu. Gunakan koreksi waktu.');
    const pending=new Map();a.records.filter(r=>r.jenis_data==='Kehadiran'&&r.id_transaksi_perubahan).forEach(r=>pending.set(r.id_transaksi_perubahan,r));
    if([...pending.values()].some(r=>r.id_transaksi_perubahan!==tx&&txt(r.id_referensi)===txt(current&&current.id_kehadiran)&&txt(r.status_transaksi)&&!['SELESAI','DIBATALKAN'].includes(txt(r.status_transaksi).toUpperCase())))throw Error('Ada transaksi kehadiran tertunda. Pulihkan sebelum mengubah presensi.');
    if(!plan){
      if((row?versiBarisIndex_(row):'')!==input.versi)throw Error('Data sudah berubah. Muat ulang peserta sebelum menyimpan.');
      const now=new Date(),id=current?txt(current.id_kehadiran):'HDR-'+Utilities.getUuid(),patch={id_kehadiran:id,id_sesi:input.id_sesi,id_keikutsertaan:input.id_keikutsertaan,metode_input:'manual_status_v1',status_kehadiran:'manual_'+input.status,status_validasi:typeof petugasDalamKonteksAkses_==='function'&&petugasDalamKonteksAkses_()?'belum_divalidasi':'terverifikasi',status_scan_pulang:'tidak_diperlukan',alasan_koreksi:input.keterangan,dasar_verifikasi:'PRESENSI_MANUAL_V1',diverifikasi_oleh:typeof petugasDalamKonteksAkses_==='function'&&petugasDalamKonteksAkses_()?'':actor,diverifikasi_pada:typeof petugasDalamKonteksAkses_==='function'&&petugasDalamKonteksAkses_()?'':now,status_perhitungan_ulang:'menunggu_perhitungan',alasan_perhitungan_ulang:'Status manual diperbarui; hitung ulang JP. Tanpa poin perilaku otomatis.',updated_at:now};
      kolomJPManual_().forEach(h=>patch[h]='');
      const after=(row||k.header.map(()=>'' )).slice();Object.keys(patch).forEach(h=>after[k.header.indexOf(h)]=patch[h]);
      plan={schema:1,input,header:k.header,id,before:row?row.map(nilaiHapus_):null,after:after.map(nilaiHapus_)};
    }
    if(JSON.stringify(plan).length>40000)throw Error('Rencana presensi terlalu panjang.');
    const norm=r=>r?r.map(nilaiHapus_):null,eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
    if(!eq(norm(row),plan.before)&&!eq(norm(row),plan.after))throw Error('Data berubah di luar rencana. Presensi tidak ditimpa.');
    if(at>=0&&sheet.getRange(at+2,1,1,k.header.length).getFormulas()[0].some(Boolean))throw Error('Baris kehadiran berisi rumus. Periksa sebelum menyimpan.');
    function journal(status){
      const id='RV-'+Utilities.getUuid(),r={id_riwayat:id,jenis_data:'Kehadiran',id_referensi:plan.id,jenis_tindakan:'presensi_manual_status',kolom_diubah:JSON.stringify(columns),nilai_sebelum:JSON.stringify({id_sesi:input.id_sesi,id_keikutsertaan:input.id_keikutsertaan,row:plan.before}),nilai_sesudah:JSON.stringify(plan),alasan_perubahan:(input.keterangan||'Pencatatan status '+input.status)+(history.length&&history[0].diubah_oleh!==actor?' · Pemulihan oleh '+actor:''),diubah_oleh:history.length?history[0].diubah_oleh:actor,waktu_perubahan:new Date(),id_transaksi_perubahan:tx,status_transaksi:status};
      audit.appendRow(a.header.map(h=>r[h]===undefined?'':r[h]));SpreadsheetApp.flush();
      const receipt=tabelIndex_('Riwayat_Validasi',['id_riwayat']).records.filter(x=>x.id_riwayat===id);
      if(receipt.length!==1||receipt[0].nilai_sesudah!==r.nilai_sesudah||receipt[0].status_transaksi!==status)throw Error('Tanda terima belum terkonfirmasi. Coba lagi dengan permintaan yang sama.');
    }
    if(!history.length)journal('PENDING');
    if(!eq(norm(row),plan.after)){
      const values=plan.after.map(v=>v&&typeof v==='object'&&v.$date?new Date(v.$date):v),n=at>=0?at+2:sheet.getLastRow()+1;
      sheet.getRange(n,1,1,values.length).setValues([values]);SpreadsheetApp.flush();
      if(!eq(norm(sheet.getRange(n,1,1,values.length).getValues()[0]),plan.after))throw Error('Penyimpanan belum terkonfirmasi. Coba lagi dengan permintaan yang sama.');
    }
    journal('SELESAI');
    return {sukses:true,id_kehadiran:plan.id,pesan:'Presensi manual tersimpan. Hitung JP untuk memperbarui rekap; tidak ada poin perilaku otomatis.'};
  }finally{lock.releaseLock();}
}

/** Hanya draft belum selesai milik aktor/lingkup yang berwenang yang dikirim untuk retry. */
function drafPresensiManualSesi_(id){
  const actor=wajibPemilikIndex_(),latest=new Map(),result=new Map();
  tabelIndex_('Riwayat_Validasi',['id_transaksi_perubahan','jenis_tindakan','nilai_sesudah','status_transaksi','diubah_oleh']).records.filter(r=>r.jenis_tindakan==='presensi_manual_status').forEach(r=>latest.set(String(r.id_transaksi_perubahan),r));
  for(const [tx,r] of latest){if(r.status_transaksi==='SELESAI')continue;const p=JSON.parse(r.nilai_sesudah);if(p.input.id_sesi!==id)continue;
    if(typeof pengajarDalamKonteksAkses_==='function'&&pengajarDalamKonteksAkses_())continue;
    if(typeof petugasDalamKonteksAkses_==='function'&&petugasDalamKonteksAkses_()&&r.diubah_oleh!==actor)continue;
    result.set(p.input.id_keikutsertaan,Object.assign({},p.input,{id_permintaan:tx.replace(/^PRESENSI-MANUAL\|/,'')}));
  }return result;
}
/** Tampilan izin manual berasal dari Kehadiran; bukan Catatan_Perilaku baru. */
function izinManualSesi_(id){
  const txt=v=>String(v==null?'':v).trim(),sessions=tabelIndex_('Sesi',['id_sesi','id_program']).records.filter(s=>txt(s.id_sesi)===id);if(sessions.length!==1)throw Error('Sesi izin tidak ditemukan atau duplikat.');
  const members=tabelIndex_('Keikutsertaan',['id_keikutsertaan','id_program','id_peserta']).records.filter(k=>sesuaiJenjang_(sessions[0],k)),people=new Map(tabelIndex_('Peserta',['id_peserta','nama_pegawai']).records.map(p=>[txt(p.id_peserta),txt(p.nama_pegawai)])),map=new Map(members.map(k=>[txt(k.id_keikutsertaan),k]));
  return tabelIndex_('Kehadiran',['id_kehadiran','id_sesi','id_keikutsertaan','metode_input','status_kehadiran','status_validasi']).records.filter(r=>txt(r.id_sesi)===id&&map.has(txt(r.id_keikutsertaan))).flatMap(r=>{const manual=statusPresensiManual_(r);if(!manual||manual.status!=='izin')return [];return [{id:txt(r.id_kehadiran),id_keikutsertaan:txt(r.id_keikutsertaan),nama:people.get(txt(map.get(txt(r.id_keikutsertaan)).id_peserta))||'(peserta tidak ditemukan)',kode:'IZIN_SESI_MANUAL',sumber:'presensi_manual',status:r.status_validasi==='terverifikasi'?'disetujui':'belum_divalidasi',mulai_izin:'Satu sesi penuh',selesai_izin:'Sesuai jadwal sesi',durasi_izin_menit:null,keterangan:manual.keterangan||'Izin tidak mengikuti sesi.',bukti:'',status_pengurangan_jp:'JP 0; tanpa poin otomatis'}];});
}
