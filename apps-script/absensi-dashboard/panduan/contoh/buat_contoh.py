"""Capture the current app login and render one illustrative manual page; no Google services contacted."""
import functools,hashlib,json,subprocess,threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];REPO=ROOT.parents[1];OUT=Path(__file__).resolve().parent
script=r"""import {sessionHarness} from './apps-script/absensi-dashboard/tests/support/sesi-harness.mjs';const {t}=sessionHarness();const html=t.c.doGet({parameter:{page:'masuk'}}).content;process.stdout.write(JSON.stringify({html,login:t.startApp(),verify:t.startVerification(),artwork:t.c.muatIlustrasiLoginPanitia()}));"""
f=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=REPO,text=True))
mock=r'''
window.requests=[];
function bridge(ok,bad){return new Proxy({},{get(t,name){if(name==='withSuccessHandler')return fn=>bridge(fn,bad);if(name==='withFailureHandler')return fn=>bridge(ok,fn);return arg=>{requests.push(name);setTimeout(()=>{try{if(name==='mulaiLoginAplikasiPanitia')ok?.(F.login);else if(name==='mulaiVerifikasiAkunPanitia')ok?.(F.verify);else if(name==='muatIlustrasiLoginPanitia')ok?.(F.artwork);else throw Error('Unexpected RPC '+name);}catch(e){bad?.(e);}},0);};}});}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){fn({parameter:{page:'masuk'}});}}}};
'''
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000},device_scale_factor=2);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('window.F='+json.dumps(f)+';'+mock)
 page.route('**/*',lambda r:r.fulfill(status=200,content_type='text/html',body=f['html']) if r.request.resource_type=='document' else r.abort())
 page.goto('https://script.google.com/macros/s/COPY/exec?page=masuk',wait_until='domcontentloaded')
 for selector,label in [('#panitiaLogin','Masuk dengan Google'),('#panitiaVerify','Verifikasi Akun')]:
  expect(page.locator(selector)).to_have_text(label);expect(page.locator(selector)).to_have_attribute('href',__import__('re').compile(r'^https://accounts\.google\.com/'))
 page.wait_for_function("document.getElementById('panitiaLoginPhoto').naturalWidth>0")
 panel=page.locator('.login-content');box=panel.bounding_box();markers={}
 for number,selector in [(1,'#panitiaVerify'),(2,'#panitiaLogin'),(3,'.login-help summary')]:
  target=page.locator(selector).bounding_box();markers[str(number)]={'x':0,'y':round(100*(target['y']+target['height']/2-box['y'])/box['height'],3)}
 panel.screenshot(path=str(OUT/'assets/panel-login.png'))
 assert not errors,errors;assert set(page.evaluate('requests'))=={'mulaiLoginAplikasiPanitia','mulaiVerifikasiAkunPanitia','muatIlustrasiLoginPanitia'}
 page.close()
 html=(OUT/'contoh-panduan-login.template.html').read_text()
 for number,point in markers.items():html=html.replace('{{PIN_'+number+'}}',str(point['y']))
 (OUT/'contoh-panduan-login.html').write_text(html)
 # Local HTTP keeps browser rendering independent of restricted file:// navigation.
 class QuietHandler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(OUT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  doc=b.new_page(viewport={'width':900,'height':1200},device_scale_factor=1)
  doc.goto('http://127.0.0.1:'+str(server.server_port)+'/contoh-panduan-login.html')
  doc.wait_for_function("[...document.images].every(i=>i.complete&&i.naturalWidth>0)")
  assert doc.locator('.pin').count()==3
  assert doc.evaluate('document.documentElement.scrollWidth<=innerWidth')
  doc.pdf(path=str(OUT/'Contoh_Halaman_Panduan_Login.pdf'),format='A4',print_background=True,prefer_css_page_size=True)
  doc.screenshot(path=str(OUT/'contoh-panduan-login.png'),full_page=True)
  doc.close()
 finally:server.shutdown()
 b.close()
metadata={'source_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'application_source':'7dacfb0 (unchanged by documentation work)','screen':'#panitiaAuth .login-content from the actual server-injected Beranda renderer','capture':'Chromium, synthetic fixtures, mocked Google services; no private app data or real Google login','markers':markers,'screenshot_sha256':hashlib.sha256((OUT/'assets/panel-login.png').read_bytes()).hexdigest(),'status':'One-page visual/layout sample, not a completed role manual'}
(OUT/'SUMBER_GAMBAR.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('PASS: current login captured; three document annotations; PDF and preview rendered; no operational RPCs')
