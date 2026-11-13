"""Record the body in real-time Chromium; join the accepted intro without re-encoding it."""
import argparse,functools,http.server,json,subprocess,tempfile,threading,time,re,os,shutil
import playwright
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
# Reuse the installed FFmpeg in a task-local Playwright tool cache.
registry=json.loads((Path(playwright.__file__).parent/'driver/package/browsers.json').read_text())
revision=next(b['revision'] for b in registry['browsers'] if b['name']=='ffmpeg')
tool_cache=Path('/tmp/film-playwright-tools');os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(tool_cache)
recorder=tool_cache/('ffmpeg-'+revision)/'ffmpeg-linux';recorder.parent.mkdir(parents=True,exist_ok=True)
if not recorder.exists():recorder.symlink_to(shutil.which('ffmpeg'))
p=argparse.ArgumentParser();p.add_argument('--stills-only',action='store_true');opt=p.parse_args()
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT.parent)))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/film/player.html?render=1'
try:
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  context=b.new_context(viewport={'width':1920,'height':1080},device_scale_factor=1)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);page.evaluate('window.ready');page.evaluate("document.getElementById('marker').style.display='none'")
  for t,name in [(19,'Pembuka'),(52,'Peran'),(75,'Persiapan'),(103,'Presensi'),(125,'Izin'),(140,'Evaluasi'),(183,'Rekap'),(205,'Laporan'),(222,'Manfaat'),(245,'Penutup')]:
   page.evaluate('window.renderAt',t);page.screenshot(path=str(ROOT/f'Pratinjau_{name}.jpg'),type='jpeg',quality=92)
  assert not errors,errors;context.close()
  if not opt.stills_only:
   folder=Path('/tmp/film-recording');folder.mkdir(exist_ok=True)
   context=b.new_context(viewport={'width':1920,'height':1080},device_scale_factor=1,record_video_dir=str(folder),record_video_size={'width':1920,'height':1080})
   page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);page.evaluate('window.ready');page.wait_for_timeout(600);page.evaluate('window.startBody()')
   start=time.monotonic()
   while time.monotonic()-start<241:
    elapsed=time.monotonic()-start;print(f'Recording body {min(240,elapsed):.1f}/240 seconds',flush=True);page.wait_for_timeout(min(10000,max(1,(241-elapsed)*1000)))
   page.evaluate('window.stopFilm()');video=page.video;context.close();path=video.path();assert not errors,errors
   print('Recorded body; encoding video',flush=True)
   detect=subprocess.run(['ffmpeg','-hide_banner','-i',str(path),'-t','5','-vf','blackdetect=d=0.1:pix_th=0.05:pic_th=0.99','-an','-f','null','-'],capture_output=True,text=True,check=True)
   found=re.search(r'black_start:([0-9.]+) black_end:([0-9.]+)',detect.stderr);assert found,detect.stderr[-1800:];assert float(found.group(1))<4;offset=float(found.group(2))
   body=Path('/tmp/film-recording/body.mp4')
   subprocess.run(['ffmpeg','-v','error','-y','-ss',str(offset),'-i',str(path),'-t','240','-vf','fps=30,scale=1920:1080:in_range=pc:out_range=tv,tpad=stop_mode=clone:stop_duration=1','-t','240','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(body)],check=True)
   intro=ROOT.parent/'intro/Pratinjau_Intro_Logo.mp4';concat=Path('/tmp/film-recording/concat.txt');concat.write_text("file '"+str(intro)+"'\nfile '"+str(body)+"'\n")
   subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart',str(ROOT/'Pratinjau_Dashboard_Lengkap.mp4')],check=True)
   (ROOT/'CATATAN_RENDER.json').write_text(json.dumps({'method':'Real-time local Chromium Canvas animation over actual role-scoped UI captures, then H.264 body encoding and stream-copy concat with accepted intro.','body_preroll_trim_seconds':offset,'body_duration_target_seconds':240,'accepted_intro_seconds':8,'audio':'none; visual/text review version','color_conversion':'Recorder full-range YUV explicitly mapped to TV range for H.264; prevents washed-out UI borders.','browser_errors':errors},indent=2)+'\n')
   print('Rendered full 4:08 visual preview',flush=True)
  b.close()
finally:server.shutdown();server.server_close()
