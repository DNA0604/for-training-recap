"""Capture current injected UI for a consistent fictional four-person training case."""
import hashlib,json,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parent;APP=ROOT.parents[1];REPO=APP.parents[1]
f=json.loads(subprocess.check_output(['node',str(ROOT/'fixture-film.mjs')],cwd=REPO,text=True))
MOCK=r'''
window.calls=[];window.role=ROLE;window.stage=STAGE;
function result(name,arg){
 if(name==='muatSesiAplikasiPanitia')return F.identity[role];
 if(name==='mulaiLoginAplikasiPanitia')return F.flow;
 if(name==='mulaiVerifikasiAkunPanitia')return F.verificationFlow;
 if(name==='muatIlustrasiLoginPanitia')return F.artwork;
 if(name==='keluarAplikasiPanitia')return {sukses:true};
 if(name==='muatTampilanAbsensiQR')return F.publicMeta;
 if(name==='cariPesertaAbsensi')return F.publicPeople;
 if(name==='simpanAbsensiPeserta')return F.publicSaved;
 if(name==='panggilBacaanDashboardPanitia')return {sukses:true,hasil:arg.permintaan.map(p=>({sukses:true,data:result('panggilAplikasiPanitia',p)}))};
 if(name!=='panggilAplikasiPanitia')throw Error('Unexpected native '+name);
 const n=arg.nama,a=arg.args;
 if(n==='muatPesertaProgramIndex')return F.stages[stage][role].participants;
 if(n==='terbitkanQRAbsensiDariGenerator')return F.qr;
 if(n==='simpanPresensiManualIndex'){stage=a[0].status==='terlambat'?'manual':'attendance';return a[0].status==='terlambat'?F.writes.manualB:F.writes.manualC;}
 if(n==='simpanEvaluasiPesertaSesi'){stage='teacher';return F.writes.teacher;}
 if(n==='simpanEvaluasiPanitiaSesi'){stage='evaluated';return F.writes.panitia;}
 if(n==='ajukanVerifikasiSesiPanitia'){stage='submitted';return F.writes.verification;}
 if(n==='hitungJPSesiIndex'){stage='calculated';return F.writes.jp;}
 if(n==='muatPratinjauLaporanProgram')return F.report.preview;
 if(n==='muatPenghapusanTertundaIndex'&&role!=='admin')throw Error('AKSES_DITOLAK: Hanya Admin Pelatihan.');
 const r=F.stages[stage][role].responses;
 if(!(n in r))throw Error('Unexpected application '+n+' for '+role);
 return r[n];
}
function bridge(ok,bad){return new Proxy({},{get(t,n){if(n==='withSuccessHandler')return f=>bridge(f,bad);if(n==='withFailureHandler')return f=>bridge(ok,f);if(n==='withUserObject')return ()=>bridge(ok,bad);return arg=>{calls.push({name:n,arg});setTimeout(()=>{try{ok?.(result(n,arg));}catch(e){console.error(e.message);bad?.(e)}},20)};}})}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){fn({parameter:Object.fromEntries(new URL(location.href).searchParams)})}}}};
'''
images=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def open_page(host='Index',role='admin',stage='initial',guest=False,public=False):
  page=b.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1.25,locale='id-ID',timezone_id='Asia/Jakarta');page.errors=[];page.on('pageerror',lambda e:page.errors.append(str(e)))
  script='window.F='+json.dumps(f)+';'+MOCK.replace('ROLE',json.dumps(role)).replace('STAGE',json.dumps(stage))
  if not guest and not public:script+='sessionStorage.setItem(F.roles[role].storage_key,F.roles[role].token);'
  page.add_init_script(script)
  def route(r):
   if r.request.resource_type!='document':r.abort();return
   q=parse_qs(urlparse(r.request.url).query);key=q.get('page',[''])[0];name={'monitoring':'Index','pengelolaan':'Pengelolaan','peserta':'Peserta','profil':'Profil'}.get(key,'Beranda')
   r.fulfill(status=200,content_type='text/html',body=f['publicHtml'] if public else f['loginHtml'] if guest else f['html'][name])
  page.route('**/*',route)
  q='absen=film_demo_token' if public else {'Index':'page=monitoring&program=PRG001&jenjang=JEN001&sesi=SES001','Pengelolaan':'page=pengelolaan&program=PRG001&jenjang=JEN001','Peserta':'page=peserta&program=PRG001&jenjang=JEN001','Profil':'page=profil&peserta=PST001&program=PRG001'}.get(host,'')
  page.goto('https://script.google.com/macros/s/COPY/exec?'+q,wait_until='domcontentloaded');page.add_script_tag(content=(ROOT/'vendor/qrcode.min.js').read_text())
  if public:expect(page.locator('#inputNama')).to_be_visible()
  elif guest:expect(page.locator('#panitiaAuth')).to_be_visible()
  else:expect(page.locator('#panitiaAuth')).not_to_be_visible();expect(page.locator('.sidebar-account-text small')).to_have_text({'admin':'Admin Pelatihan','staff':'Petugas Kelas','teacher':'Pengajar'}[role])
  return page
 def snap(page,name,selector='body',height=None):
  el=page.locator(selector).first;expect(el).to_be_visible();el.scroll_into_view_if_needed()
  if selector=='body':
   page.screenshot(path=str(ROOT/'assets'/name))
  elif height:
   box=el.bounding_box();page.evaluate('(dy)=>window.scrollBy(0,dy)',min(0,box['y']-118));box=el.bounding_box();page.screenshot(path=str(ROOT/'assets'/name),clip={'x':max(0,box['x']),'y':max(0,box['y']),'width':box['width'],'height':min(height,box['height'],1000-max(0,box['y']))})
  else:el.screenshot(path=str(ROOT/'assets'/name))
  assert not page.errors,page.errors
  controls={}
  targets={'login.png':'#panitiaLogin','sesi.png':'#sesi','qr-form.png':'#publish','qr-terbit.png':'#qrImage','qr-peserta.png':'#btnKonfirmasi','qr-tercatat.png':'#status','manual-kosong.png':'#manualSearch','manual-terlambat.png':'#manualSave','manual-izin.png':'#manualSave','evaluasi-pengajar-kosong.png':'#evaluasiPesertaDialog select','evaluasi-pengajar-isi.png':'#saveEvaluasiPeserta','evaluasi-pengajar-simpan.png':'#evaluasiPesertaStatus','evaluasi-panitia-kosong.png':'#evaluasiPanitiaDialog select','evaluasi-panitia-isi.png':'#saveEvaluasiPanitia','evaluasi-panitia-simpan.png':'#evaluasiPanitiaStatus','hitung-jp.png':'#calculate','rekap.png':'#downloadRecap','laporan-dialog.png':'#generateProgramReport','pengelolaan-selesai.png':'#openProgramReport'}
  target=page.locator(targets[name]).first if name in targets else None
  if target is not None and target.is_visible():
   tb=target.bounding_box();eb={'x':0,'y':0,'width':1440,'height':1000} if selector=='body' else el.bounding_box();controls={'x':(tb['x']+tb['width']/2-eb['x'])/eb['width'],'y':(tb['y']+tb['height']/2-eb['y'])/(min(height,eb['height'],1000-max(0,eb['y'])) if height else eb['height'])}
  images.append({'file':'assets/'+name,'focus':controls,'selector':selector,'role':page.evaluate('window.role'),'stage':page.evaluate('window.stage'),'sha256':hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()});print('Captured',name,flush=True)
 login=open_page(guest=True);snap(login,'login.png','#panitiaAuth>section');login.close()
 home=open_page('Beranda');expect(home.locator('#homeProgramBody')).to_be_visible();snap(home,'beranda.png');home.close()
 manage=open_page('Pengelolaan');expect(manage.locator('#manageSessions tr')).to_have_count(1);snap(manage,'pengelolaan.png','#app',height=770);manage.close()
 people=open_page('Peserta');expect(people.locator('#participantsBody tr')).to_have_count(4);snap(people,'peserta.png','#app',height=700);snap(people,'peserta-daftar.png','.panel:has(#participantsBody)',height=620);people.close()
 mon=open_page(role='staff');expect(mon.locator('#tableBody tr')).to_have_count(4);snap(mon,'sesi.png','section:has(#calculate)',height=240);snap(mon,'sebelum-presensi.png','#sessionPanel',height=640)
 mon.locator('#openPresensi').click();snap(mon,'pilihan-presensi.png','#presensiDialog');mon.locator('#openQR').click();snap(mon,'qr-form.png','#qrDialog');mon.locator('#publish').click();expect(mon.locator('#qrImage img')).to_be_visible();snap(mon,'qr-terbit.png','#qrDialog');mon.locator('#closeQR').click();mon.close()
 pub=open_page(public=True);pub.set_viewport_size({'width':430,'height':900});pub.locator('#inputNama').fill('Peserta Contoh A');pub.locator('#hasilPencarian button').first.click();snap(pub,'qr-peserta.png');pub.locator('#btnKonfirmasi').click();expect(pub.locator('#btnKonfirmasi')).to_have_text('Absensi Tercatat');snap(pub,'qr-tercatat.png');pub.close()
 mon=open_page(role='staff',stage='qr');mon.locator('#openPresensi').click();mon.locator('#quickManual').click();snap(mon,'manual-kosong.png','#manualDialog')
 mon.locator('#manualSearch').fill('Peserta Contoh B');mon.locator('#manualResults button').first.click();mon.locator('#manualPresent').check();mon.locator('#manualStatus').select_option('terlambat');mon.locator('#manualReason').fill('Peserta mengikuti sesi dengan keterlambatan.');snap(mon,'manual-terlambat.png','#manualDialog');mon.locator('#manualSave').click();expect(mon.locator('#manualDialog')).not_to_be_visible();snap(mon,'manual-hasil.png','#sessionPanel',height=680)
 mon.locator('#openPresensi').click();mon.locator('#quickManual').click();mon.locator('#manualSearch').fill('Peserta Contoh C');mon.locator('#manualResults button').first.click();mon.locator('#manualAbsent').check();mon.locator('#manualStatus').select_option('izin');mon.locator('#manualReason').fill('Izin tidak mengikuti satu sesi penuh.');snap(mon,'manual-izin.png','#manualDialog');mon.locator('#manualSave').click();expect(mon.locator('#manualDialog')).not_to_be_visible();snap(mon,'kehadiran.png','#sessionPanel',height=680);mon.locator('#tabIzin').click();snap(mon,'izin.png','#izinPanel',height=440);mon.close()
 teacher=open_page(role='teacher',stage='attendance');teacher.locator('#openEvaluasi').click();teacher.locator('#openEvaluasiPeserta').click();expect(teacher.locator('#evaluasiPesertaDialog select')).to_have_count(24);snap(teacher,'evaluasi-pengajar-kosong.png','#evaluasiPesertaDialog')
 for grade_index,row in enumerate([0,1,3]):
  for col,score in enumerate([[4,5,4,4,5,4][(grade_index+j)%6] for j in range(6)]):teacher.locator('#evaluasiPesertaDialog select').nth(row*6+col).select_option(str(score))
  teacher.locator('#evaluasiPesertaDialog textarea').nth(row).fill('Berpartisipasi dan bekerja sama selama sesi.')
 snap(teacher,'evaluasi-pengajar-isi.png','#evaluasiPesertaDialog');teacher.locator('#saveEvaluasiPeserta').click();expect(teacher.locator('#evaluasiPesertaStatus')).to_contain_text('3 penilaian peserta tersimpan');snap(teacher,'evaluasi-pengajar-simpan.png','#evaluasiPesertaDialog');teacher.close()
 mon=open_page(role='staff',stage='teacher');mon.locator('#openEvaluasi').click();mon.locator('#openEvaluasiPanitia').click();expect(mon.locator('#evaluasiPanitiaDialog select')).to_have_count(12);snap(mon,'evaluasi-panitia-kosong.png','#evaluasiPanitiaDialog')
 for grade_index,row in enumerate([0,1,3]):
  for col,score in enumerate([[4,5,4,4,5,4][(grade_index+j)%6] for j in range(3)]):mon.locator('#evaluasiPanitiaDialog select').nth(row*3+col).select_option(str(score))
 snap(mon,'evaluasi-panitia-isi.png','#evaluasiPanitiaDialog');mon.locator('#saveEvaluasiPanitia').click();expect(mon.locator('#evaluasiPanitiaStatus')).to_contain_text('3 evaluasi Panitia tersimpan');snap(mon,'evaluasi-panitia-simpan.png','#evaluasiPanitiaDialog');mon.locator('#closeEvaluasiPanitia').click();mon.locator('#tabPerilaku').click();snap(mon,'catatan.png','#behaviorPanel',height=500);mon.locator('#tabSesi').click();mon.locator('#panitiaVerificationOpen').click();snap(mon,'verifikasi.png','#panitiaVerificationDialog');mon.close()
 admin=open_page(stage='submitted');snap(admin,'hitung-jp.png','section:has(#calculate)',height=240);admin.locator('#calculate').click();expect(admin.locator('#calculate')).to_be_enabled();admin.locator('#tabRekap').click();expect(admin.locator('#recapBody tr')).to_have_count(4);snap(admin,'rekap.png','#recapPanel',height=680);admin.locator('#recapBody').get_by_role('button',name='Rincian Nilai').first.click();snap(admin,'rincian-nilai.png','#finalScoreDialog');admin.close()
 final=open_page('Pengelolaan',stage='final');snap(final,'pengelolaan-selesai.png','#app',height=770);final.locator('#openProgramReport').click();expect(final.locator('#reportPreview')).not_to_be_empty();snap(final,'laporan-dialog.png','#programReportDialog');final.close()
 profile=open_page('Profil',stage='final');snap(profile,'profil.png','#content',height=730);profile.close();b.close()
(ROOT/'SUMBER_UI.json').write_text(json.dumps({'source_application':'7dacfb0','capture':'Actual server-rendered UI with role-scoped synthetic backend fixture states. No Google login/data access. QR historical row/receipt are synthetic seeds; manual/evaluation/verification/JP snapshots from actual local handlers.','case':f['evidence'],'images':images},ensure_ascii=False,indent=2)+'\n')
