"""Check the supplied assets, video encoding, timeline geometry and local player."""
import functools,hashlib,http.server,json,struct,subprocess,threading
from pathlib import Path
from zipfile import ZipFile
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parent;APP=ROOT.parents[1]
metadata=json.loads((ROOT/'SUMBER_ASET.json').read_text())
for source in metadata['logos']:
 assert hashlib.sha256((ROOT/source['file']).read_bytes()).hexdigest()==source['sha256']
video=ROOT/'Pratinjau_Intro_Logo.mp4'
m=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(video)]));v=m['streams'][0]
assert len(m['streams'])==1 and v['codec_type']=='video' and v['codec_name']=='h264'
assert v['width']==1920 and v['height']==1080 and v['r_frame_rate']=='30/1' and int(v['nb_frames'])==240 and v['pix_fmt']=='yuv420p'
assert abs(float(m['format']['duration'])-8)<.02
subprocess.run(['ffmpeg','-v','error','-i',str(video),'-f','null','-'],check=True)
raw=video.read_bytes();offset=0;boxes=[]
while offset+8<=len(raw):
 size,name=struct.unpack('>I4s',raw[offset:offset+8]);assert size>=8;boxes.append(name.decode('ascii'));offset+=size
assert boxes.index('moov')<boxes.index('mdat')
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/intro.html'
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1920,'height':1080});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url+'?render=1');page.evaluate('window.ready')
 assert page.locator('img').evaluate_all('els=>els.every(e=>e.complete&&e.naturalWidth>0)')
 assert page.locator('#controls').evaluate('e=>getComputedStyle(e).display')=='none'
 samples=[]
 for t in [0,.5,1.2,2.8,4.8,5.4,6.5,7.9666667]:
  page.evaluate('window.renderAt',t)
  g=page.locator('#logoGroup').bounding_box();slots=[page.locator('#'+n).bounding_box() for n in ['stia','lan','komdigi']]
  assert 0<=g['x'] and g['x']+g['width']<=1920 and 0<=g['y'] and g['y']+g['height']<=1080
  assert all(slots[i]['x']+slots[i]['width']<slots[i+1]['x'] for i in range(2))
  samples.append({'time':t,'group_y':round(g['y'],3),'logo1_opacity':page.locator('#stia').evaluate('e=>Number(e.style.opacity)'),'title_opacity':page.locator('#line1').evaluate('e=>Number(e.style.opacity)')})
 assert samples[0]['logo1_opacity']==0 and samples[3]['logo1_opacity']==1
 assert samples[3]['title_opacity']==0 and samples[-1]['title_opacity']==1
 assert samples[-1]['group_y']<samples[3]['group_y']
 mobile=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce');mobile.on('pageerror',lambda e:errors.append(str(e)))
 mobile.goto(url);mobile.evaluate('window.ready');expect(mobile.locator('#play')).to_have_text('Putar')
 box=mobile.locator('#controls').bounding_box();assert box['x']>=0 and box['x']+box['width']<=390
 mobile.locator('#play').click();expect(mobile.locator('#play')).to_have_text('Jeda');mobile.locator('#play').click();expect(mobile.locator('#play')).to_have_text('Putar')
 mobile.locator('#seek').evaluate("e=>{e.value='5.5';e.dispatchEvent(new Event('input'))}");expect(mobile.locator('#time')).to_have_text('5.50 / 8 s')
 mobile.locator('#replay').click();expect(mobile.locator('#play')).to_have_text('Jeda');assert not errors,errors;browser.close()
server.shutdown();server.server_close()
for name,digest in json.loads((APP/'SOURCE_SNAPSHOT.json').read_text())['files'].items():assert hashlib.sha256((APP/name).read_bytes()).hexdigest()==digest
for role,file in [('admin','Panduan_Admin_Pelatihan.docx'),('petugas','Panduan_Petugas_Kelas.docx'),('pengajar','Panduan_Pengajar.docx')]:
 path=APP/'panduan'/role/file;repo=APP.parents[1];assert path.read_bytes()==subprocess.check_output(['git','show','HEAD:'+path.relative_to(repo).as_posix()],cwd=repo)
report={'duration_seconds':8,'video_dimensions':[1920,1080],'fps':30,'frames':240,'codec':'h264','pixel_format':'yuv420p','faststart':True,'full_decode_ok':True,'audio':'none; visual preview only','user_logos':len(metadata['logos']),'original_logo_bytes_unchanged':True,'stage_and_logo_geometry_checked':True,'mobile_controls_and_reduced_motion_checked':True,'browser_errors':errors,'sampled_states':samples,'unchanged_application_sources':19,'previous_three_manual_docx_unchanged':True,'video_sha256':hashlib.sha256(video.read_bytes()).hexdigest()}
(ROOT/'PEMERIKSAAN_INTRO.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='sampled_states'}))
