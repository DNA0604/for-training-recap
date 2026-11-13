"""Check encoded audio, untouched video bitstream, fades, mix and player controls."""
import functools
import hashlib
import http.server
import json
import subprocess
import threading
from pathlib import Path

import numpy as np
from playwright.sync_api import sync_playwright, expect
from serve_preview import MediaHandler

R=Path(__file__).resolve().parent
movie=R/'Video_Dashboard_Musik_Efek.mp4'
visual=R/'Pratinjau_Dashboard_Lengkap.mp4'


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format',
                       '-show_streams','-of','json',str(path)]))


def video_hash(path):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-map','0:v:0',
                   '-c','copy','-f','hash','-hash','sha256','-'],text=True).strip()


assert hashlib.sha256(visual.read_bytes()).hexdigest()=='81a0f7511bb030645ca5d106e8abb34f3459a1024d0af61e40f0beba2919cbce'
meta=probe(movie); video=next(s for s in meta['streams'] if s['codec_type']=='video')
audio=next(s for s in meta['streams'] if s['codec_type']=='audio')
assert len(meta['streams'])==2
assert video['codec_name']=='h264' and int(video['nb_frames'])==7440
assert (video['width'],video['height'],video['r_frame_rate'])==(1920,1080,'30/1')
assert audio['codec_name']=='aac' and audio['sample_rate']=='48000' and audio['channels']==2
assert abs(float(meta['format']['duration'])-248)<.03
assert abs(float(audio['duration'])-248)<.03
source_hash=video_hash(visual); assert video_hash(movie)==source_hash
subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True)

proc=subprocess.run(['ffmpeg','-hide_banner','-i',str(movie),'-vn','-af',
    'loudnorm=I=-18:TP=-1.8:LRA=9:print_format=json','-f','null','-'],
    check=True,capture_output=True,text=True)
levels=json.loads(proc.stderr[proc.stderr.rfind('{'):proc.stderr.rfind('}')+1])
assert abs(float(levels['input_i'])+18)<.5,levels
assert float(levels['input_tp'])<=-1.3,levels
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vn','-t','248',
    '-ar','48000','-ac','2','-f','f32le','-'])
samples=np.frombuffer(raw,np.float32).reshape(-1,2)
assert np.isfinite(samples).all() and float(np.max(np.abs(samples)))<1
assert len(samples)>=int(247.99*48000)
def rms(a):return float(20*np.log10(max(1e-12,float(np.sqrt(np.mean(a*a))))))
windows=[rms(samples[i*48000:(i+1)*48000]) for i in range(4,244)]
assert min(windows)>-45, min(windows)
assert rms(samples[-12000:])<rms(samples[-144000:-120000])-18,'Closing fade must reach near silence'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass


server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(MediaHandler,directory=str(R.parent)))
threading.Thread(target=server.serve_forever,daemon=True).start()
errors=[]; checks=[]
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        for mobile in [False,True]:
            page=browser.new_page(viewport={'width':390 if mobile else 1920,'height':844 if mobile else 1080},
                                  reduced_motion='reduce' if mobile else 'no-preference')
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}/film/player.html')
            page.evaluate('window.ready')
            page.wait_for_function("document.getElementById('soundtrack').readyState>=2")
            assert not page.evaluate('window.filmState().playing')
            page.locator('#chapter').select_option('93')
            page.locator('#play').click()
            page.wait_for_function("!document.getElementById('soundtrack').paused")
            page.wait_for_timeout(400)
            delta=page.evaluate("Math.abs(window.filmState().current-document.getElementById('soundtrack').currentTime)")
            assert delta<.3,delta
            page.locator('#soundToggle').click()
            assert page.evaluate("document.getElementById('soundtrack').muted")
            expect(page.locator('#soundToggle')).to_have_attribute('aria-pressed','true')
            page.locator('#play').click()
            assert page.evaluate("document.getElementById('soundtrack').paused")
            page.locator('#chapter').select_option('173')
            assert abs(page.evaluate("document.getElementById('soundtrack').currentTime")-173)<.05
            page.locator('#soundToggle').click()
            assert not page.evaluate("document.getElementById('soundtrack').muted")
            page.locator('#replay').click()
            assert page.evaluate('window.filmState().current')<2
            page.evaluate('window.stopFilm()')
            checks.append({'mobile':mobile,'sync_delta_seconds':delta,'play_pause_seek_mute_replay':True})
            page.close()
        browser.close()
finally:
    server.shutdown();server.server_close()
assert not errors,errors
report={'duration_seconds':float(meta['format']['duration']),'voiceover':False,
        'video_bitstream_identical_to_accepted_visual_movie':True,
        'video_stream_sha256':source_hash,'video_frames':7440,'full_av_decode_ok':True,
        'audio':{'codec':'aac','sample_rate':48000,'channels':2,
                 'integrated_lufs':float(levels['input_i']),'true_peak_dbtp':float(levels['input_tp']),
                 'loudness_range_lu':float(levels['input_lra']),
                 'sample_peak_dbfs':float(20*np.log10(np.max(np.abs(samples)))),
                 'no_sample_clipping':True,'no_unintended_silent_seconds':True,
                 'closing_fade_verified':True},
        'player_checks':checks,'browser_errors':errors,
        'movie_sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),
        'listening_review':'Pemeriksaan teknis lokal; penilaian rasa musik/volume oleh pengguna tetap diperlukan.'}
(R/'PEMERIKSAAN_AUDIO.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
