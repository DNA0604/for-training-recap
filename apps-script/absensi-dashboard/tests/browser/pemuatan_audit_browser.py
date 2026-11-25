"""Injected Monitoring in Chromium; hold QR CDN and mock Google service latency."""
import json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];REPO=ROOT.parents[1]
script=r"""import {loadingHarness} from './apps-script/absensi-dashboard/tests/support/pemuatan-audit-harness.mjs';const h=loadingHarness(22),responses={};for(const rpc of ['muatAwalIndex','muatKehadiranIndex','muatRekapJPProgramIndex','muatNilaiPerilakuProgramIndex','muatDaftarVerifikasiSesiPanitia','muatPengajuanKoreksiPanitia'])responses[rpc]=h.call(h.admin,rpc,...(['muatAwalIndex','muatDaftarVerifikasiSesiPanitia','muatPengajuanKoreksiPanitia'].includes(rpc)?[]:rpc==='muatKehadiranIndex'?['SES001']:['PRG001']));process.stdout.write(JSON.stringify({html:h.t.c.keluaranAplikasiPanitia_('Index','Monitoring').content,identity:h.t.c.muatSesiAplikasiPanitia(h.admin.token),login:h.admin,responses}));"""
f=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=REPO,text=True))
mock=r'''
window.calls=[];window.fail=false;sessionStorage.setItem(F.login.storage_key,F.login.token);
function value(name,arg){if(name==='muatSesiAplikasiPanitia')return F.identity;if(name==='panggilBacaanDashboardPanitia')return {sukses:true,hasil:arg.permintaan.map(p=>{try{return {sukses:true,data:value('panggilAplikasiPanitia',{nama:p.nama,args:p.args})};}catch(e){return {sukses:false,pesan:e.message};}})};if(name!=='panggilAplikasiPanitia')throw Error('Unexpected transport');if(window.fail&&arg.nama==='muatNilaiPerilakuProgramIndex'){window.fail=false;throw Error('SIMULATED_PRIVATE_ERROR');}if(arg.nama==='terbitkanQRAbsensiDariGenerator')return {sukses:true,id_sesi:'SES001',jenis_scan:'datang',url_absensi:'https://script.google.com/macros/s/COPY/exec?token=PRIVATE_QR_TOKEN',berlaku_sampai:new Date(Date.now()+60000).toISOString()};if(F.responses[arg.nama])return JSON.parse(JSON.stringify(F.responses[arg.nama]));throw Error('Missing fixture '+arg.nama);}
function bridge(ok,bad){return new Proxy({}, {get(t,name){if(name==='withSuccessHandler')return fn=>bridge(fn,bad);if(name==='withFailureHandler')return fn=>bridge(ok,fn);return arg=>{calls.push({name,arg});setTimeout(()=>{try{ok?.(value(name,arg));}catch(e){bad?.(e);}},25);};}});}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){fn({parameter:{page:'monitoring',program:'PRG001',jenjang:'JEN001',sesi:'SES001'}});}}}};
'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width in [1440,390]:
  page=b.new_page(viewport={'width':width,'height':1000});errors=[];held=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script('window.F='+json.dumps(f)+';\n'+mock)
  def route(r):
   if 'qrcode.min.js' in r.request.url:held.append(r)
   elif r.request.resource_type=='document':r.fulfill(status=200,content_type='text/html',body=f['html'])
   else:r.abort()
  page.route('**/*',route);page.goto('https://script.google.com/macros/s/COPY/exec?page=monitoring&program=PRG001&jenjang=JEN001&sesi=SES001',wait_until='domcontentloaded');expect(page.locator('#total')).to_have_text('22');expect(page.locator('#tableBody tr')).to_have_count(10);assert len(held)==1;assert page.evaluate("typeof QRCode==='undefined'");assert page.locator('script[src*="qrcode.min.js"]').get_attribute('async') is not None
  page.locator('#openPresensi').click();page.locator('#openQR').click();page.locator('#publish').click();expect(page.locator('#message')).to_contain_text('Pustaka QR masih dimuat');assert not page.evaluate("calls.some(c=>c.arg?.nama==='terbitkanQRAbsensiDariGenerator')")
  held.pop().fulfill(status=200,content_type='application/javascript',body="window.QRCode=function(el,o){el.textContent='QR READY';};window.QRCode.CorrectLevel={M:0};");page.wait_for_function("typeof QRCode==='function'");page.locator('#publish').click();expect(page.locator('#qrImage')).to_have_text('QR READY');page.locator('#closeQR').click()
  page.locator('#tabRekap').click();expect(page.locator('#downloadRecap')).to_be_enabled();r=page.evaluate('pelatihanPemuatan.baca()');assert r['halaman']=='Index' and isinstance(r['data_awal_ms'],int);assert any(x['transport']=='panggilBacaanDashboardPanitia' and 'muatRekapJPProgramIndex' in x['tindakan'] for x in r['permintaan']);assert all(x['durasi_ms']>=0 for x in r['permintaan'])
  page.evaluate('window.fail=true');page.locator('#refreshRecap').click();expect(page.locator('#recapInfo')).to_contain_text('SIMULATED_PRIVATE_ERROR');expect(page.locator('#downloadRecap')).to_be_disabled();assert page.evaluate('pelatihanPemuatan.baca().permintaan.some(r=>!r.berhasil)')
  text=page.evaluate('JSON.stringify(pelatihanPemuatan.baca())');assert not any(secret in text for secret in [f['login']['token'],'PRIVATE_QR_TOKEN','SIMULATED_PRIVATE_ERROR','KST001','Peserta A','199001012020011001']);page.evaluate("const copy=pelatihanPemuatan.baca();copy.permintaan[0].tindakan='TAMPERED';copy.permintaan.length=0");assert page.evaluate("pelatihanPemuatan.baca().permintaan[0].tindakan!=='TAMPERED'")
  if width==1440:
   page.evaluate("async()=>{await Promise.all(Array.from({length:105},()=>new Promise((ok,bad)=>pelatihanRun.withSuccessHandler(ok).withFailureHandler(bad).muatAwalIndex())));}");assert page.evaluate('pelatihanPemuatan.baca().permintaan.length')==100
  assert not errors,errors;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.close()
 b.close()
print('PASS: slow QR CDN does not block initial Monitoring/10-row rendering, later QR publication without reload, desktop/mobile, local timing metadata privacy/copy isolation/100-record cap, grouped-read failure keeps CSV blocked; Google and QR renderer mocked.')
