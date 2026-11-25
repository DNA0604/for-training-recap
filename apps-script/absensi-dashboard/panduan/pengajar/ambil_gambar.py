"""Capture current Pengajar UI using synthetic fixtures. Does not contact Google or alter app sources."""
import hashlib,json,re,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];REPO=ROOT.parents[1]
f=json.loads(subprocess.check_output(['node',str(OUT/'fixture-pengajar.mjs')],cwd=REPO,text=True))
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
 if(n==='muatEvaluasiPesertaSesi')return F.evaluation[stage];
 if(n==='simpanEvaluasiPesertaSesi'){window.stage=stage==='saved'?'updated':'saved';return stage==='updated'?F.updated:F.saved;}
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
   expect(page.locator('.sidebar-account-text small')).to_have_text('Pengajar')
  return page
 def snap(page,name,selector,caption,height=None,markers=()):
  loc=page.locator(selector).first;expect(loc).to_be_visible();loc.scroll_into_view_if_needed()
  if height:
   box=loc.bounding_box();page.evaluate('(dy)=>window.scrollBy(0,dy)',min(0,box['y']-118))
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
 # Each authenticated capture uses the teacher token and real scoped backend fixtures.
 page=open_page('Beranda',guest=True)
 expect(page.locator('#panitiaVerify')).to_have_attribute('href',re.compile('^https://accounts'))
 snap(page,'01-login.png','.login-content','Login dan Verifikasi Akun Pengajar',markers=('#panitiaVerify','#panitiaLogin'));page.close()
 home=open_page('Beranda');expect(home.locator('#homeProgramBody')).to_be_visible()
 snap(home,'02-beranda.png','#dashContent','Beranda dalam cakupan sesi mengajar',height=560)
 snap(home,'03-menu.png','#dashSidebar','Menu yang tersedia untuk Pengajar')
 expect(home.locator('[data-dash-page="pengelolaan"]')).not_to_be_visible();home.close()
 people=open_page('Peserta');expect(people.locator('#participantsBody tr')).to_have_count(4)
 expect(people.locator('#openSingleParticipant')).not_to_be_visible()
 snap(people,'04-peserta.png','#app','Daftar peserta dalam cakupan kelas Pengajar',height=610);people.close()
 profile=open_page('Profil');snap(profile,'05-profil.png','#content','Profil peserta yang dapat dibaca Pengajar',height=580);profile.close()
 monitor=open_page();expect(monitor.locator('#tableBody tr')).to_have_count(4)
 expect(monitor.locator('#calculate')).not_to_be_visible();expect(monitor.locator('#openPresensi')).not_to_be_visible()
 expect(monitor.locator('#quickBehavior')).not_to_be_visible();expect(monitor.locator('#panitiaVerification')).to_have_count(0)
 assert monitor.locator('#sesi option').count()==2
 snap(monitor,'06-filter-sesi.png','section:has(#calculate)','Pilihan Program, Jenjang dan Sesi sesuai penugasan Pengajar',height=240)
 snap(monitor,'07-kehadiran.png','#sessionPanel','Pemantauan kehadiran peserta oleh Pengajar',height=580)
 monitor.locator('#tabPerilaku').click();expect(monitor.locator('#behaviorBody tr').first).to_be_visible()
 expect(monitor.locator('#behaviorBody button')).not_to_be_visible()
 snap(monitor,'08-catatan.png','#behaviorPanel','Catatan perilaku yang dapat dibaca tanpa tindakan validasi',height=500)
 monitor.locator('#tabIzin').click();snap(monitor,'09-izin.png','#izinPanel','Daftar izin pada sesi mengajar',height=430)
 monitor.locator('#tabRekap').click();expect(monitor.locator('#downloadRecap')).to_be_enabled()
 expect(monitor.locator('#openFinalWeights')).not_to_be_visible()
 expect(monitor.locator('#recapBody').get_by_role('button',name='Rincian Nilai')).to_have_count(0)
 snap(monitor,'10-rekap.png','#recapPanel','Rekap JP dalam cakupan Pengajar tanpa nilai akhir gabungan',height=580)
 monitor.locator('#tabSesi').click();monitor.locator('#openEvaluasi').click()
 expect(monitor.locator('#openEvaluasiPanitia')).to_have_count(0);expect(monitor.locator('#openEvaluasiPengajarAdmin')).to_have_count(0)
 expect(monitor.locator('#openEvaluasiPeserta')).to_have_text('Isi Evaluasi PesertaIsi enam aspek evaluasi peserta pada sesi yang Anda ajar.')
 snap(monitor,'11-pilihan-evaluasi.png','#evaluasiChoiceDialog','Pilihan Isi Evaluasi Peserta pada akses Pengajar')
 monitor.set_viewport_size({'width':1440,'height':1000});monitor.locator('#openEvaluasiPeserta').click()
 expect(monitor.locator('#evaluasiPesertaDialog select')).to_have_count(24)
 expect(monitor.locator('#perbaruiRekapSpreadsheet')).not_to_be_visible()
 snap(monitor,'12-evaluasi-kosong.png','#evaluasiPesertaDialog','Evaluasi peserta enam aspek sebelum diisi')
 monitor.locator('#evaluasiPesertaDialog select').nth(0).select_option('4');monitor.locator('#saveEvaluasiPeserta').click()
 expect(monitor.locator('#evaluasiPesertaStatus')).to_contain_text('Lengkapi enam aspek')
 assert not monitor.evaluate("calls.some(c=>c.arg?.nama==='simpanEvaluasiPesertaSesi')")
 for i,n in enumerate([4,5,4,5,3,4]):monitor.locator('#evaluasiPesertaDialog select').nth(i).select_option(str(n))
 monitor.locator('#evaluasiPesertaDialog textarea').first.fill('Berpartisipasi dalam diskusi')
 snap(monitor,'13-evaluasi-isian.png','#evaluasiPesertaDialog','Contoh enam nilai dan catatan sebelum Simpan Halaman')
 monitor.locator('#saveEvaluasiPeserta').click();expect(monitor.locator('#evaluasiPesertaStatus')).to_contain_text('1 penilaian peserta tersimpan')
 snap(monitor,'14-evaluasi-tersimpan.png','#evaluasiPesertaDialog','Konfirmasi penilaian peserta tersimpan')
 assert monitor.evaluate("calls.find(c=>c.arg?.nama==='simpanEvaluasiPesertaSesi').arg.args[0].nilai.length") == 1
 monitor.locator('#evaluasiPesertaDialog select').first.select_option('5')
 monitor.once('dialog',lambda d:d.dismiss());monitor.locator('#closeEvaluasiPeserta').click()
 expect(monitor.locator('#evaluasiPesertaDialog')).to_be_visible()
 monitor.locator('#evaluasiPesertaDialog select').nth(4).select_option('4')
 monitor.locator('#evaluasiPesertaDialog textarea').first.fill('Aktif berdiskusi dan membantu kelompok.')
 monitor.locator('#saveEvaluasiPeserta').click();expect(monitor.locator('#evaluasiPesertaStatus')).to_contain_text('tersimpan')
 snap(monitor,'15-evaluasi-perbaikan.png','#evaluasiPesertaDialog','Contoh perbaikan nilai oleh Pengajar yang sama')
 close(monitor,'#closeEvaluasiPeserta');monitor.close()
 stale=open_page(stage='stale');stale.set_viewport_size({'width':1440,'height':1000});stale.locator('#openEvaluasi').click();stale.locator('#openEvaluasiPeserta').click()
 expect(stale.locator('#evaluasiPesertaDialog')).to_contain_text('Sumber berubah; periksa kembali')
 snap(stale,'16-sumber-berubah.png','#evaluasiPesertaDialog','Penanda sumber berubah yang perlu diperiksa Pengajar');stale.close()
 many=open_page(stage='many');many.set_viewport_size({'width':1440,'height':1000});many.locator('#openEvaluasi').click();many.locator('#openEvaluasiPeserta').click()
 expect(many.locator('#evaluasiPesertaDialog select')).to_have_count(120)
 many.locator('#evaluasiPesertaDialog').get_by_role('button',name='Berikutnya',exact=True).click()
 expect(many.locator('#evaluasiPesertaDialog select')).to_have_count(6)
 expect(many.locator('#evaluasiPesertaDialog')).to_contain_text('Halaman 2 dari 2')
 snap(many,'17-evaluasi-halaman-berikutnya.png','#evaluasiPesertaDialog','Halaman berikutnya pada evaluasi lebih dari 20 peserta');many.close()
 b.close()
(OUT/'SUMBER_GAMBAR.json').write_text(json.dumps({'source_application':'7dacfb0','role':'pengajar','capture':'Current server-injected HTML, actual teacher-scoped synthetic backend fixtures; Google mocked; no real data or application changes.','permissions_checked':f['permissions'],'images':images},indent=2)+'\n')
print('Captured',len(images),'teacher-only manual illustrations')
