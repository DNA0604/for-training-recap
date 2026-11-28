"""Capture current Petugas UI using synthetic fixtures. Does not contact Google or alter app sources."""
import hashlib,json,re,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];REPO=ROOT.parents[1]
f=json.loads(subprocess.check_output(['node',str(OUT/'fixture-petugas.mjs')],cwd=REPO,text=True))
MOCK=r'''
window.calls=[];window.stage='initial';
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
 if(n==='muatVerifikasiSesiPanitia')return F.verification[stage];
 if(n==='muatDaftarVerifikasiSesiPanitia')return F.lists[stage];
 if(n==='muatPenghapusanTertundaIndex')throw Error('AKSES_DITOLAK: Hanya Admin Pelatihan.');
 if(!(n in F.responses))throw Error('Unexpected app RPC '+n);
 return F.responses[n];
}
function bridge(ok,bad){return new Proxy({},{get(t,n){if(n==='withSuccessHandler')return fn=>bridge(fn,bad);if(n==='withFailureHandler')return fn=>bridge(ok,fn);if(n==='withUserObject')return ()=>bridge(ok,bad);return arg=>{calls.push({name:n,arg});setTimeout(()=>{try{ok?.(value(n,arg));}catch(e){console.error(e.message);bad?.(e);}},15);};}});}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){fn({parameter:Object.fromEntries(new URL(location.href).searchParams)});}}}};
'''
images=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def open_page(host='Index',guest=False,query='',stage='initial'):
  page=b.new_page(viewport={'width':1180,'height':1000},device_scale_factor=2,locale='id-ID',timezone_id='Asia/Jakarta');page.errors=[];page.on('pageerror',lambda e:page.errors.append(str(e)))
  page.add_init_script('window.F='+json.dumps(f)+';'+MOCK+'window.stage='+json.dumps(stage)+';'+('' if guest else 'sessionStorage.setItem(F.session.storage_key,F.session.token);'))
  def route(r):
   if r.request.resource_type!='document':r.abort();return
   key=parse_qs(urlparse(r.request.url).query).get('page',[''])[0]
   name={'monitoring':'Index','pengelolaan':'Pengelolaan','peserta':'Peserta','profil':'Profil','akses':'ManajemenAkses'}.get(key,'Beranda')
   r.fulfill(status=200,content_type='text/html',body=f['loginHtml'] if guest else f['html'][name])
  page.route('**/*',route)
  if not query:query={'Index':'page=monitoring&program=PRG001&jenjang=JEN001&sesi=SES001','Pengelolaan':'page=pengelolaan&program=PRG001&jenjang=JEN001','Peserta':'page=peserta&program=PRG001&jenjang=JEN001','Profil':'page=profil&peserta=PST001&program=PRG001','ManajemenAkses':'page=akses'}.get(host,'')
  page.goto('https://script.google.com/macros/s/COPY/exec?'+query,wait_until='domcontentloaded')
  expect(page.locator('#panitiaAuth')).to_be_visible() if guest else expect(page.locator('#panitiaAuth')).not_to_be_visible()
  if not guest:
   expect(page.locator('.sidebar-account-text small')).to_have_text('Petugas Kelas')
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
 # Every authenticated illustration uses the staff session and server-scoped response fixtures.
 page=open_page('Beranda',guest=True);expect(page.locator('#panitiaVerify')).to_have_attribute('href',re.compile('^https://accounts'));snap(page,'01-login.png','.login-content','Login dan verifikasi akun Petugas',markers=('#panitiaVerify','#panitiaLogin'));page.close()
 home=open_page('Beranda');expect(home.locator('#homeProgramBody')).to_be_visible();snap(home,'02-beranda.png','#dashContent','Beranda sesuai penugasan Petugas',height=560);snap(home,'03-menu.png','#dashSidebar','Menu Petugas Kelas');expect(home.locator('[data-dash-page="pengelolaan"]')).not_to_be_visible();home.close()
 people=open_page('Peserta');expect(people.locator('#participantsBody tr')).to_have_count(4);expect(people.locator('#openSingleParticipant')).not_to_be_visible();snap(people,'04-peserta.png','#app','Daftar peserta pada Program dan Jenjang penugasan',height=610);people.close()
 profile=open_page('Profil');snap(profile,'05-profil.png','#content','Profil peserta dalam cakupan penugasan',height=580);profile.close()
 monitor=open_page();expect(monitor.locator('#tableBody tr')).to_have_count(4);expect(monitor.locator('#calculate')).not_to_be_visible()
 snap(monitor,'06-filter-sesi.png','section:has(#calculate)','Pemilihan Program, Jenjang dan Sesi oleh Petugas',height=240);snap(monitor,'07-kehadiran.png','#sessionPanel','Kehadiran peserta pada sesi yang ditugaskan',height=580)
 monitor.locator('#openPresensi').click();snap(monitor,'08-pilihan-presensi.png','#presensiDialog','Pilihan Presensi Manual, QR Absensi dan Catat Izin');monitor.locator('#openQR').click();snap(monitor,'09-qr.png','#qrDialog','Pengaturan QR datang atau pulang');close(monitor,'#closeQR')
 monitor.locator('#openPresensi').click();monitor.locator('#quickManual').click();monitor.locator('#manualPresent').check();monitor.locator('#manualStatus').select_option('hadir');snap(monitor,'10-manual-hadir.png','#manualDialog','Presensi Manual untuk status Hadir');monitor.locator('#manualAbsent').check();monitor.locator('#manualStatus').select_option('sakit');snap(monitor,'11-manual-tidak-hadir.png','#manualDialog','Presensi Manual untuk Sakit dan bukti pendukung opsional');close(monitor,'#manualClose')
 monitor.locator('#openPresensi').click();monitor.locator('#quickLeave').click();snap(monitor,'12-izin.png','#editDialog','Catat Izin Sesi untuk peserta yang dipilih');close(monitor,'#cancelEdit')
 monitor.locator('#tableBody button.action').first.click();snap(monitor,'13-koreksi-langsung.png','#editDialog','Formulir Koreksi Petugas Kelas');close(monitor,'#cancelEdit')
 monitor.locator('#quickBehavior').click();snap(monitor,'14-catatan-perilaku.png','#behaviorDialog','Pencatatan sikap dan perilaku oleh Petugas');close(monitor,'#closeBehavior')
 monitor.locator('#tabPerilaku').click();expect(monitor.locator('#behaviorBody tr').first).to_be_visible();expect(monitor.locator('#behaviorBody button')).not_to_be_visible();snap(monitor,'15-daftar-perilaku.png','#behaviorPanel','Catatan dan status pemeriksaan yang dapat dilihat Petugas',height=560)
 monitor.locator('#tabIzin').click();snap(monitor,'16-daftar-izin.png','#izinPanel','Daftar Izin Peserta pada sesi penugasan',height=500)
 monitor.locator('#tabSesi').click();monitor.locator('#openEvaluasi').click();expect(monitor.locator('#openEvaluasiPengajarAdmin')).to_have_count(0);expect(monitor.locator('#openEvaluasiPeserta')).to_have_count(0);snap(monitor,'17-pilihan-evaluasi.png','#evaluasiChoices','Pilihan evaluasi yang tersedia untuk Petugas');monitor.locator('#openEvaluasiPanitia').click();expect(monitor.locator('#evaluasiPanitiaDialog select')).to_have_count(12);expect(monitor.locator('#rekapEvaluasiPanitia')).not_to_be_visible();snap(monitor,'18-evaluasi-panitia.png','#evaluasiPanitiaDialog','Evaluasi peserta oleh Panitia sesuai penugasan');close(monitor,'#closeEvaluasiPanitia')
 monitor.locator('#panitiaVerificationOpen').click();expect(monitor.locator('#panitiaVerificationSubmit')).to_have_text('Kirim Pengajuan');snap(monitor,'19-ajukan-verifikasi.png','#panitiaVerificationDialog','Paket verifikasi sesi sebelum diajukan Petugas');close(monitor,'#panitiaVerificationDialog .modal-close')
 monitor.locator('#tabRekap').click();expect(monitor.locator('#downloadRecap')).to_be_enabled();expect(monitor.locator('#openFinalWeights')).not_to_be_visible();snap(monitor,'20-rekap.png','#recapPanel','Rekap Program dalam cakupan Jenjang Petugas',height=580);monitor.locator('#recapBody').get_by_role('button',name='Rincian Nilai').first.click();snap(monitor,'21-rincian-nilai.png','#finalScoreDialog','Rincian nilai akhir peserta yang dapat dilihat Petugas');close(monitor,'#closeFinalScore');monitor.close()
 pending=open_page(stage='pending');expect(pending.locator('#panitiaVerificationList')).to_contain_text('menunggu');snap(pending,'22-verifikasi-menunggu.png','#panitiaVerification','Status pengajuan sesi yang menunggu keputusan Admin');pending.close()
 rejected=open_page(stage='rejected');expect(rejected.locator('#panitiaVerificationList')).to_contain_text('ditolak');snap(rejected,'23-verifikasi-ditolak.png','#panitiaVerification','Status ditolak dan alasan keputusan Admin');rejected.locator('#panitiaVerificationOpen').click();snap(rejected,'24-ajukan-ulang.png','#panitiaVerificationDialog','Pemeriksaan paket dan pengajuan kembali setelah penolakan');rejected.close()
 b.close()
(OUT/'SUMBER_GAMBAR.json').write_text(json.dumps({'source_application':'7dacfb0','role':'petugas_kelas','capture':'Current server-injected HTML, actual staff-scoped synthetic backend fixtures; Google mocked; no real data or application changes.','permissions_checked':f['permissions'],'images':images},indent=2)+'\n')
print('Captured',len(images),'staff-only manual illustrations')
