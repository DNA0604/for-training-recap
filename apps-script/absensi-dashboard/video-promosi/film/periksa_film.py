"""Validate the delivered movie, original intro frames, UI hashes and role-consistent fixture."""
import functools,hashlib,http.server,json,subprocess,threading
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright,expect
R=Path(__file__).resolve().parent;APP=R.parents[1];REPO=APP.parents[1]
timeline=json.loads((R/'TIMELINE.json').read_text());end=8
for shot in timeline['shots']:
 assert shot['start']==end and shot['end']>shot['start'];end=shot['end']
 for key in ['asset','after']:
  if shot[key]:assert (R/'assets'/shot[key]).exists()
assert end==248
source=json.loads((R/'SUMBER_UI.json').read_text())
for im in source['images']:assert hashlib.sha256((R/im['file']).read_bytes()).hexdigest()==im['sha256']
case={v['name']:v for v in source['case']['summary']};assert abs(case['Peserta Contoh A']['jp']-2)<1e-9 and abs(case['Peserta Contoh B']['jp']-75/45)<1e-9
assert case['Peserta Contoh C']['jp']==0 and case['Peserta Contoh C']['grade'] is None and case['Peserta Contoh C']['status']=='tidak_dinilai'
movie=R/'Pratinjau_Dashboard_Lengkap.mp4';m=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(movie)]));v=m['streams'][0]
assert len(m['streams'])==1 and v['codec_name']=='h264' and v['width']==1920 and v['height']==1080 and v['r_frame_rate']=='30/1'
assert abs(float(m['format']['duration'])-248)<.15 and int(v['nb_frames'])==7440
subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True)
def first_hashes(path):
 s=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-frames:v','240','-f','framemd5','-'],text=True)
 return [line.split(',')[-1].strip() for line in s.splitlines() if line and not line.startswith('#')]
intro=R.parent/'intro/Pratinjau_Intro_Logo.mp4';assert first_hashes(movie)==first_hashes(intro)
# Check stable flat-color areas against the original browser frame.
color_frame=Path('/tmp/film-color-check.png')
subprocess.run(['ffmpeg','-v','error','-y','-ss','140','-i',str(movie),'-frames:v','1',str(color_frame)],check=True)
reference=Image.open(R/'Pratinjau_Evaluasi.jpg').convert('RGB');decoded=Image.open(color_frame).convert('RGB')
color_checks=[]
for xy in [(20,400),(1600,60)]:
 expected=reference.getpixel(xy);actual=decoded.getpixel(xy);delta=max(abs(a-b) for a,b in zip(expected,actual));assert delta<=12,(xy,expected,actual)
 color_checks.append({'point':list(xy),'source':list(expected),'video':list(actual),'max_channel_delta':delta})
assert intro.read_bytes()==subprocess.check_output(['git','show','HEAD:'+intro.relative_to(REPO).as_posix()],cwd=REPO)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(R.parent)));threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/film/player.html'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1920,'height':1080});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url+'?render=1');page.evaluate('window.ready');page.evaluate("document.getElementById('marker').style.display='none'")
  times=[0,2.8,7.96,8,8.3,15,32.9,33,69,75,99,103,114,140,155,176,194,205,222,237,247.9]
  for t in times:page.evaluate('window.renderAt',t)
  assert not errors,errors
  mobile=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');mobile.on('pageerror',lambda e:errors.append(str(e)));mobile.goto(url);mobile.evaluate('window.ready');expect(mobile.locator('#clock')).to_have_text('04:08 / 04:08');mobile.locator('#chapter').select_option('133');expect(mobile.locator('#clock')).to_have_text('02:13 / 04:08');mobile.locator('#captionToggle').click();expect(mobile.locator('#captionToggle')).to_have_attribute('aria-pressed','true');mobile.locator('#play').click();expect(mobile.locator('#play')).to_have_text('Jeda');mobile.locator('#play').click();expect(mobile.locator('#play')).to_have_text('Putar');assert not errors,errors;b.close()
finally:server.shutdown();server.server_close()
for name,digest in json.loads((APP/'SOURCE_SNAPSHOT.json').read_text())['files'].items():assert hashlib.sha256((APP/name).read_bytes()).hexdigest()==digest
for role,file in [('admin','Panduan_Admin_Pelatihan.docx'),('petugas','Panduan_Petugas_Kelas.docx'),('pengajar','Panduan_Pengajar.docx')]:
 path=APP/'panduan'/role/file;assert path.read_bytes()==subprocess.check_output(['git','show','HEAD:'+path.relative_to(REPO).as_posix()],cwd=REPO)
report={'format':'visual/text review version, no voice/music','duration_seconds':float(m['format']['duration']),'resolution':[1920,1080],'fps':30,'frames':int(v['nb_frames']),'full_decode_ok':True,'approved_intro_first_240_decoded_frames_identical':True,'approved_intro_file_unchanged':True,'continuous_body_shots':len(timeline['shots']),'source_ui_captures':len(source['images']),'source_ui_hashes_verified':True,'source_color_comparison':color_checks,'synthetic_case_jp_and_absence_semantics_verified':True,'sampled_browser_times':times,'mobile_controls_reduced_motion_and_captions_checked':True,'browser_errors':errors,'unchanged_application_sources':19,'previous_three_manual_docx_unchanged':True,'video_sha256':hashlib.sha256(movie.read_bytes()).hexdigest()}
(R/'PEMERIKSAAN_FILM.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
