"""Capture current Admin UI using synthetic fixtures. Does not contact Google or alter app sources."""
import hashlib,json,re,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];REPO=ROOT.parents[1]
f=json.loads(subprocess.check_output(['node',str(OUT/'fixture-admin.mjs')],cwd=REPO,text=True))
MOCK=r'''
window.calls=[];
function value(name,arg){
 if(name==='muatSesiAplikasiPanitia')return F.identity;
 if(name==='mulaiLoginAplikasiPanitia')return F.flow;
 if(name==='mulaiVerifikasiAkunPanitia')return F.verificationFlow;
 if(name==='muatIlustrasiLoginPanitia')return F.artwork;
 if(name==='keluarAplikasiPanitia')return {sukses:true};
 if(name==='panggilBacaanDashboardPanitia')return {sukses:true,hasil:arg.permintaan.map(p=>({sukses:true,data:value('panggilAplikasiPanitia',p)}))};
 if(name!=='panggilAplikasiPanitia')throw Error('Unexpected native RPC '+name);
 const n=arg.nama,a=arg.args;
 if(n==='muatPesertaProgramIndex')return F.participants[a[3]||''];
 if(n==='muatEditDataIndex')return F.edit[a[0]+'|'+a[1]]||F.edit[a[0]];
 if(n==='pratinjauHapusDataIndex')return F.deletion;
 if(n==='cariPesertaLamaIndex')return {sukses:true,peserta:[]};
 if(!(n in F.responses))throw Error('Unexpected app RPC '+n);
 return F.responses[n];
}
function bridge(ok,bad){return new Proxy({},{get(t,n){if(n==='withSuccessHandler')return fn=>bridge(fn,bad);if(n==='withFailureHandler')return fn=>bridge(ok,fn);if(n==='withUserObject')return ()=>bridge(ok,bad);return arg=>{calls.push({name:n,arg});setTimeout(()=>{try{ok?.(value(n,arg));}catch(e){console.error(e.message);bad?.(e);}},15);};}});}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){fn({parameter:Object.fromEntries(new URL(location.href).searchParams)});}}}};
'''
images=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def open_page(host='Index',guest=False,query=''):
  page=b.new_page(viewport={'width':1180,'height':1000},device_scale_factor=2,locale='id-ID',timezone_id='Asia/Jakarta');page.errors=[];page.on('pageerror',lambda e:page.errors.append(str(e)))
  page.add_init_script('window.F='+json.dumps(f)+';'+MOCK+('' if guest else 'sessionStorage.setItem(F.session.storage_key,F.session.token);'))
  def route(r):
   if r.request.resource_type!='document':r.abort();return
   key=parse_qs(urlparse(r.request.url).query).get('page',[''])[0]
   name={'monitoring':'Index','pengelolaan':'Pengelolaan','peserta':'Peserta','profil':'Profil','akses':'ManajemenAkses'}.get(key,'Beranda')
   r.fulfill(status=200,content_type='text/html',body=f['loginHtml'] if guest else f['html'][name])
  page.route('**/*',route)
  if not query:query={'Index':'page=monitoring&program=PRG001&jenjang=JEN001&sesi=SES001','Pengelolaan':'page=pengelolaan&program=PRG001&jenjang=JEN001','Peserta':'page=peserta&program=PRG001&jenjang=JEN001','Profil':'page=profil&peserta=PST001&program=PRG001','ManajemenAkses':'page=akses'}.get(host,'')
  page.goto('https://script.google.com/macros/s/COPY/exec?'+query,wait_until='domcontentloaded')
  expect(page.locator('#panitiaAuth')).to_be_visible() if guest else expect(page.locator('#panitiaAuth')).not_to_be_visible()
  return page
 def snap(page,name,selector,caption,height=None,markers=()):
  loc=page.locator(selector).first;expect(loc).to_be_visible();loc.scroll_into_view_if_needed()
  # Ephemeral numbered badges are placed in blank control padding; only documentation captures include them.
  page.evaluate("document.querySelectorAll('[data-guide-pin]').forEach(e=>e.remove())")
  for i,sel in enumerate(markers,1):
   target=page.locator(sel).first
   if target.is_visible():
    box=target.bounding_box()
    page.evaluate("v=>{const e=document.createElement('span');e.dataset.guidePin='';e.textContent=v.n;Object.assign(e.style,{position:'fixed',left:(v.x)+'px',top:(v.y)+'px',zIndex:'2147483647',display:'grid',placeItems:'center',width:'22px',height:'22px',borderRadius:'50%',background:'#203960',color:'white',font:'bold 12px Arial',border:'2px solid white',boxShadow:'0 0 0 1px #203960',pointerEvents:'none'});(document.documentElement.hasAttribute('data-panitia-locked')?document.getElementById('panitiaAuth'):document.body).append(e);}",{'n':str(i),'x':box['x']+box['width']-26,'y':box['y']+3})
  path=OUT/'assets'/name
  if height and loc.evaluate("e=>e.tagName!=='DIALOG'"):
   box=loc.bounding_box();page.screenshot(path=str(path),clip={'x':max(0,box['x']),'y':max(0,box['y']),'width':box['width'],'height':min(height,box['height'],1000-max(0,box['y']))})
  else:loc.screenshot(path=str(path))
  page.evaluate("document.querySelectorAll('[data-guide-pin]').forEach(e=>e.remove())")
  assert not page.errors,page.errors
  images.append({'file':'assets/'+name,'selector':selector,'caption':caption,'markers':list(markers),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
  print('Captured',name,flush=True)
 def close(page,selector):page.locator(selector).first.click()
 # Login and main navigation.
 page=open_page('Beranda',guest=True);expect(page.locator('#panitiaVerify')).to_have_attribute('href',re.compile('^https://accounts'));snap(page,'01-login.png','.login-content','Panel login dan verifikasi akun',markers=('#panitiaVerify','#panitiaLogin'));page.close()
 home=open_page('Beranda');expect(home.locator('#homeProgramBody')).to_be_visible();snap(home,'02-beranda.png','#dashContent','Beranda Admin Pelatihan',height=560);snap(home,'03-menu.png','#dashSidebar','Menu navigasi Admin');home.close()
 # Access management.
 access=open_page('ManajemenAkses');expect(access.locator('#userForm')).to_be_visible();snap(access,'04-akun.png','#userForm','Formulir akun pengguna');snap(access,'05-penugasan.png','#assignmentForm','Penugasan Petugas pada Program dan Jenjang');snap(access,'06-daftar-akun.png','#users','Daftar akun dan tindakan perubahan status');access.close()
 # Program, level, session and teacher assignment.
 manage=open_page('Pengelolaan');expect(manage.locator('#program')).to_have_value('PRG001');expect(manage.locator('#openNewSession')).to_be_enabled()
 snap(manage,'07-pengelolaan.png','#managePanel','Halaman Pengelolaan program dan sesi',height=560);snap(manage,'41-periksa-data.png','section.panel:has(#checkData)','Pemeriksaan konsistensi data program',height=520)
 manage.locator('#openNewProgram').click();snap(manage,'08-program.png','#newProgramDetails','Formulir Tambah Program Pelatihan',height=650);close(manage,'[data-close-creation="newProgramDetails"]')
 manage.locator('#openNewJenjang').click();snap(manage,'09-jenjang.png','#newJenjangDialog','Formulir Tambah Jenjang Program');close(manage,'#closeJenjang')
 manage.locator('#openNewSession').click();snap(manage,'10-sesi.png','#newSessionDetails','Formulir sesi, perhitungan JP dan jeda',height=650);close(manage,'[data-close-creation="newSessionDetails"]')
 manage.locator('#openPengajarSesi').click();expect(manage.locator('#kelolaPengajarSesi')).to_be_visible();snap(manage,'11-pengajar-sesi.png','#kelolaPengajarSesi','Penetapan Pengajar untuk setiap sesi',height=600);manage.keyboard.press('Escape')
 manage.locator('#openProgramReport').click();expect(manage.locator('#generateProgramReport')).to_be_enabled();snap(manage,'12-laporan.png','#programReportDialog','Pembuatan laporan program yang sudah selesai');close(manage,'#closeProgramReport')
 manage.close()
 # Participants and import.
 people=open_page('Peserta');expect(people.locator('#participantsBody tr')).to_have_count(4);snap(people,'13-peserta.png','#participantsPanel','Pemilihan Program dan Jenjang serta daftar peserta',height=550)
 people.locator('#openSingleParticipant').click();snap(people,'14-tambah-peserta.png','#singleParticipantDialog','Pendaftaran peserta baru atau peserta lama',height=600);people.keyboard.press('Escape')
 people.locator('#fileInput').set_input_files({'name':'Peserta_Contoh.csv','mimeType':'text/csv','buffer':('nip,nama_pegawai,unit_kerja\n200001012024011001,Peserta Impor Satu,Unit Pengembangan\n200001022024011002,Peserta Impor Dua,Unit Pengembangan\n').encode()})
 expect(people.locator('#previewFile')).to_be_enabled();people.locator('#previewFile').click();expect(people.locator('#previewBody tr')).to_have_count(2);snap(people,'15-pratinjau-impor.png','#participantPreviewCard','Pratinjau hasil pemeriksaan impor peserta',height=560);people.close()
 # Monitoring and attendance.
 monitor=open_page();expect(monitor.locator('#tableBody tr')).to_have_count(4);snap(monitor,'16-monitoring.png','#sessionPanel','Kehadiran peserta per sesi',height=560);snap(monitor,'40-filter-jp.png','section:has(#calculate)','Pemilihan sesi dan tombol Hitung JP Sesi',height=240)
 monitor.locator('#openPresensi').click();snap(monitor,'17-pilihan-presensi.png','#presensiDialog','Tiga pilihan pada tombol Presensi');monitor.locator('#quickManual').click();expect(monitor.locator('#manualDialog')).to_be_visible();monitor.locator('#manualPresent').check();monitor.locator('#manualStatus').select_option('hadir');snap(monitor,'18-manual.png','#manualDialog','Pencatatan status kehadiran manual',height=640);close(monitor,'#manualClose')
 monitor.locator('#openPresensi').click();monitor.locator('#openQR').click();snap(monitor,'19-qr.png','#qrDialog','Pengaturan QR absensi datang atau pulang',height=600);close(monitor,'#closeQR')
 monitor.locator('#openPresensi').click();monitor.locator('#quickLeave').click();expect(monitor.locator('#editDialog')).to_be_visible();snap(monitor,'20-izin.png','#editDialog','Pencatatan izin, termasuk peserta yang belum presensi',height=620);close(monitor,'#cancelEdit')
 # Behavior notes and rules.
 monitor.locator('#quickBehavior').click();expect(monitor.locator('#behaviorDialog')).to_be_visible();snap(monitor,'21-catatan-perilaku.png','#behaviorDialog','Formulir Catat Sikap dan Perilaku',height=620);close(monitor,'#closeBehavior')
 monitor.locator('#tabPerilaku').click();expect(monitor.locator('#behaviorBody')).to_be_visible();monitor.locator('#behaviorBody button').first.click();snap(monitor,'38-validasi-catatan.png','#validationDialog','Pemeriksaan status, bukti dan alasan validasi catatan',height=620);close(monitor,'#cancelValidation');snap(monitor,'22-daftar-perilaku.png','#behaviorPanel','Daftar catatan dan tindakan validasi',height=550)
 monitor.locator('#tabNilai').click();expect(monitor.locator('#newIndicatorForm')).to_be_enabled();snap(monitor,'23-aturan-perilaku.png','#scorePanel','Pengaturan nilai dan aturan perilaku program',height=570);monitor.locator('#newIndicatorForm').click();snap(monitor,'24-indikator.png','#indicatorDialog','Tambah atau kelola indikator perilaku',height=650);close(monitor,'#closeIndicatorDialog')
 monitor.locator('#tabSesi').click();monitor.locator('#openEvaluasi').click();snap(monitor,'25-pilihan-evaluasi.png','#evaluasiChoices','Tiga jenis evaluasi untuk Admin');monitor.locator('#openEvaluasiPanitia').click();expect(monitor.locator('#evaluasiPanitiaDialog select')).to_have_count(12);snap(monitor,'26-evaluasi-panitia.png','#evaluasiPanitiaDialog','Evaluasi peserta oleh panitia: tiga aspek',height=620);close(monitor,'#closeEvaluasiPanitia')
 monitor.locator('#openEvaluasi').click();monitor.locator('#openEvaluasiPengajarAdmin').click();expect(monitor.locator('#evaluasiPengajarAdminDialog')).to_be_visible();snap(monitor,'27-evaluasi-pengajar.png','#evaluasiPengajarAdminDialog','Evaluasi Pengajar oleh Admin',height=620);close(monitor,'#closeEvaluasiPengajarAdmin')
 monitor.locator('#openEvaluasi').click();monitor.locator('#openEvaluasiPeserta').click();snap(monitor,'28-evaluasi-peserta-pengajar.png','#evaluasiPesertaDialog','Tampilan baca evaluasi peserta oleh Pengajar',height=620);snap(monitor,'39-rekap-spreadsheet.png','#evaluasiPesertaDialog .evaluasi-actions','Tombol pembaruan rekap pada spreadsheet penilaian');close(monitor,'#closeEvaluasiPeserta')
 # Grades and verification.
 monitor.locator('#tabSesi').click();monitor.locator('#tableBody button.action').first.click();snap(monitor,'37-koreksi-langsung.png','#editDialog','Melengkapi atau mengoreksi waktu kehadiran',height=620);close(monitor,'#cancelEdit')
 monitor.locator('#tabRekap').click();expect(monitor.locator('#downloadRecap')).to_be_enabled();snap(monitor,'29-rekap.png','#recapPanel','Rekap Program, nilai akhir dan unduh CSV',height=560)
 monitor.locator('#openFinalWeights').click();snap(monitor,'30-bobot.png','#finalWeightsDialog','Pengaturan bobot Pengajar dan Panitia');close(monitor,'#closeFinalWeights')
 monitor.locator('#recapBody').get_by_role('button',name='Rincian Nilai').first.click();snap(monitor,'31-rincian-nilai.png','#finalScoreDialog','Rincian komponen dan kelengkapan nilai akhir',height=620);close(monitor,'#closeFinalScore')
 monitor.locator('#panitiaVerificationList button').first.click();snap(monitor,'32-verifikasi.png','#panitiaVerificationDialog','Pemeriksaan pengajuan verifikasi sesi',height=620);close(monitor,'#panitiaVerificationDialog .modal-close')
 monitor.locator('#panitiaRequests .request-row button').first.click();snap(monitor,'33-koreksi.png','#panitiaReview','Pemeriksaan pengajuan koreksi dari Petugas',height=620);monitor.keyboard.press('Escape');monitor.close()
 profile=open_page('Profil');snap(profile,'34-profil.png','#content','Profil peserta dan riwayat program',height=600);profile.close()
 # Direct editing and deletion previews are inspected only, never executed.
 manage=open_page('Pengelolaan');expect(manage.locator('#program')).to_have_value('PRG001');manage.locator('#managePrograms button').filter(has_text='Edit').first.click();snap(manage,'35-edit.png','#dataEditDialog','Formulir perubahan data dan alasan perubahan',height=620);close(manage,'#dataEditCancel')
 manage.locator('#managePrograms button').filter(has_text='Edit').last.click();manage.locator('#dataEditDelete button').click();snap(manage,'36-hapus.png','#deleteDataDialog','Pratinjau dampak penghapusan dan konfirmasi',height=620);close(manage,'#closeDeleteData');manage.close()
 b.close()
(OUT/'SUMBER_GAMBAR.json').write_text(json.dumps({'source_application':'7dacfb0','capture':'Current server-injected HTML, Chromium and synthetic fixtures. Google services mocked; no real account/operational writes.','images':images},indent=2)+'\n')
print('Captured',len(images),'manual illustrations')
