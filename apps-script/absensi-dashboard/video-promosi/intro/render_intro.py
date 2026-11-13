"""Render the exact supplied logo images in a deterministic local Chromium timeline."""
import argparse,functools,http.server,json,subprocess,tempfile,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--stills-only',action='store_true');opt=p.parse_args()
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=b.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:') else route.abort())
  page.goto(f'http://127.0.0.1:{server.server_port}/intro.html?render=1');page.evaluate('window.ready');assert not errors,errors
  for t,name in [(2.8,'Pratinjau_Logo.png'),(7.5,'Pratinjau_Judul.png')]:
   page.evaluate('window.renderAt',t);page.locator('#stage').screenshot(path=str(ROOT/name))
  if not opt.stills_only:
   with tempfile.TemporaryDirectory(prefix='intro-frames-') as directory:
    folder=Path(directory)
    for frame in range(240):
     page.evaluate('window.renderAt',frame/30);page.locator('#stage').screenshot(path=str(folder/f'{frame:04d}.png'))
     if frame%60==0:print(f'Rendered {frame}/240 frames',flush=True)
    subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i',str(folder/'%04d.png'),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(ROOT/'Pratinjau_Intro_Logo.mp4')],check=True)
   print('Rendered 8-second 1920×1080 30fps silent intro',flush=True)
  assert not errors,errors;b.close()
finally:server.shutdown();server.server_close()
