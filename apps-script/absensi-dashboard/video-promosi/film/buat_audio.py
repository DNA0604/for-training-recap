"""Compose original instrumental/SFX, normalize and mux without re-encoding video.

Needs Python, numpy, scipy and FFmpeg. Settings/cues: RENCANA_AUDIO.json.
Intermediate float WAVs are written outside the repository, under /tmp.
No sampled recordings, downloaded music, voice model or network request.
"""
import hashlib
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

R = Path(__file__).resolve().parent
PLAN = json.loads((R / 'RENCANA_AUDIO.json').read_text())
TMP = Path('/tmp/dashboard-audio'); TMP.mkdir(exist_ok=True)
OUT = R / 'audio'; OUT.mkdir(exist_ok=True)
SR = PLAN['mix']['sample_rate']; DURATION = PLAN['duration_seconds']
N = int(SR * DURATION); BEAT = 60 / PLAN['music']['tempo_bpm']; BAR = 4 * BEAT
rng = np.random.default_rng(PLAN['music']['seed'])
music = np.zeros((N, 2), np.float32)
fx = np.zeros_like(music)


def hz(note):
    return 440 * 2 ** ((note - 69) / 12)


def add(track, at, signal, gain=1, pan=0):
    """Equal-power pan, trim safely; stereo signals preserve their own field."""
    start = round(at * SR); skip = max(0, -start); start = max(start, 0)
    signal = signal[skip:skip + max(0, N - start)]
    if not len(signal): return
    if signal.ndim == 1:
        signal = np.column_stack((signal * np.cos((pan + 1)*np.pi/4),
                                  signal * np.sin((pan + 1)*np.pi/4)))
    track[start:start + len(signal)] += gain * signal.astype(np.float32)


def envelope(t, attack=.01, release=.1):
    return np.minimum(t/attack, 1).clip(0) * np.minimum((t[-1]-t)/release, 1).clip(0)


def keys(note, duration=2.1, soft=False):
    t = np.arange(round(duration*SR), dtype=np.float32)/SR
    f = hz(note)
    signal = sum((np.sin(2*np.pi*f*h*t + .001*h) * np.exp(-t*(1.3 + .8*h)) / h**1.7)
                 for h in range(1, 6 if soft else 8))
    return signal * envelope(t, .008, .12)


def pad(note, duration, phase):
    t = np.arange(round(duration*SR), dtype=np.float32)/SR
    f = hz(note); stereo = []
    for sign in [-1, 1]:
        sig = np.zeros_like(t)
        for h in range(1, 5):
            sig += np.sin(2*np.pi*f*(1 + sign*.0013)*h*t + phase + h*.23) / h**2.4
        sig *= (.93 + .07*np.sin(2*np.pi*.17*t + phase))
        stereo.append(sig * envelope(t, .8, 1.2))
    return np.column_stack(stereo)


def bass(note, duration):
    t = np.arange(round(duration*SR), dtype=np.float32)/SR
    return (np.sin(2*np.pi*hz(note)*t) + .18*np.sin(4*np.pi*hz(note)*t))*np.exp(-t*1.8)*envelope(t,.014,.12)


def filtered_noise(seconds, low, high):
    t = np.arange(round(seconds*SR), dtype=np.float32)/SR
    noise = rng.normal(0, .7, len(t)).astype(np.float32)
    noise = sosfilt(butter(2, [low, high], btype='bandpass', fs=SR, output='sos'), noise)
    return t, noise


def kick():
    t=np.arange(int(.27*SR), dtype=np.float32)/SR
    phase=2*np.pi*(49*t + 38*.028*(1-np.exp(-t/.028)))
    return np.sin(phase)*np.exp(-t*18)*envelope(t,.004,.04)


def rim():
    t, noise=filtered_noise(.16, 800, 4300)
    tone=np.sin(2*np.pi*930*t)+.3*np.sin(2*np.pi*1470*t)
    return (.14*tone + .7*noise)*np.exp(-t*36)*envelope(t,.002,.02)


def hat():
    t, noise=filtered_noise(.11, 3800, 9500)
    return noise*np.exp(-t*60)*envelope(t,.002,.015)


def intensity(t):
    # Crossfade the arrangement, so section changes do not click.
    points=[(0,.2),(7,.3),(12,.6),(31,.64),(37,.8),(90,.8),(98,.95),
            (129,.95),(137,.72),(169,.72),(178,.95),(204,.95),
            (213,.58),(230,.58),(237,.78),(243,.65),(248,0)]
    return float(np.interp(t,*zip(*points)))


# Two-bar harmonic rhythm; inversions keep the upper parts close together.
chords=[([54,57,61,64,69],38),([52,57,59,64,68],33),
        ([54,57,59,62,66],35),([50,55,59,62,66],31)]
for section, at in enumerate(np.arange(0, 240, 2*BAR)):
    notes, root=chords[section%4]
    for j,note in enumerate(notes):
        add(music,float(at),pad(note,2*BAR+1.4,j*.8),.0135*intensity(at))
    # Understated 8th-note ostinato, with rests and alternating registers.
    pattern=[0,2,3,1,4,2,1,3,0,2,4,3,1,2,3,2]
    for step, index in enumerate(pattern):
        st=float(at + step*BEAT/2)
        if st<8 or (section%4==2 and step in [3,7,11,15]): continue
        velocity=.043*(.83+.17*(step%4==0))*intensity(st)
        add(music,st,keys(notes[index]+12,1.7),velocity,(-.38 if step%2==0 else .38))
    # Melody changes in register and rests between phrases (never speech-like).
    if at>=12 and section%4 in [0,2]:
        motif=([81,78,76,78] if section%4==0 else [78,74,73,74])
        if 133<=at<173: motif=motif[:2]
        for j,note in enumerate(motif):
            add(music,float(at+BEAT*(.5+j*1.5)),keys(note,2.6,True),.030*intensity(at),.08)
    for beat in [0,2,4,6]:
        st=float(at+beat*BEAT)
        if st>=14:
            add(music,st,bass(root+(12 if beat==6 and section%2 else 0),1.1),.085*intensity(st))

# Restrained groove; no rhythm at the logo opening or closing cadence.
kd,rm,hh=kick(),rim(),hat()
for bar in range(4,96):
    at=bar*BAR
    density=intensity(at)
    if at<32 or 208<=at<233:
        for beat in [0,2]:add(music,at+beat*BEAT,kd,.038*density)
        if bar%2==0:add(music,at+3*BEAT,hh,.013*density,.25)
        continue
    for beat in [0,2]:add(music,at+beat*BEAT,kd,.065*density)
    for beat in [1,3]:add(music,at+beat*BEAT,rm,.040*density,-.08)
    for step in range(8):
        add(music,at+step*BEAT/2,hh,.018*density*(.75 if step%2 else 1),.24 if step%2 else -.24)

# Final tonic and soft descending notes resolve the score before fade-out.
for j,note in enumerate([50,57,61,66,69]):
    add(music,240,pad(note,8,j*.8),.015)
for at,note in [(240.1,81),(241.35,78),(242.6,76),(243.85,74)]:
    add(music,at,keys(note,3.7,True),.027,.08)
add(music,240,bass(38,4.0),.065)

# Short stereo room/tempo echoes, each lower than the direct signal.
dry=music.copy()
for delay,gain in [(BEAT*.75,.13),(BEAT*1.5,.065),(.071,.045)]:
    n=round(delay*SR); music[n:]+=dry[:-n,::-1]*gain
del dry


def effect(kind):
    if kind=='whoosh':
        t,n=filtered_noise(.65,500,5700)
        env=np.sin(np.pi*t/.65)**2 * (.6+.4*t/.65)
        n*=env
        # Very gentle left-to-right motion.
        p=np.linspace(-.45,.45,len(t))
        return .14*np.column_stack((n*np.cos((p+1)*np.pi/4),n*np.sin((p+1)*np.pi/4)))
    if kind=='tap':
        t,n=filtered_noise(.115,600,4200)
        return .14*(.8*n+.22*np.sin(2*np.pi*720*t))*np.exp(-t*48)*envelope(t,.002,.015)
    notes={'logo':[74,78,81], 'success':[78,81], 'shimmer':[81,85]}[kind]
    length=2.0 if kind=='logo' else 1.3
    result=np.zeros((round(length*SR),2),np.float32)
    for i,note in enumerate(notes):
        sig=keys(note,length-i*.12,True)*.072
        start=round(i*.12*SR); pan=-.18+i*.18
        result[start:start+len(sig),0]+=sig*np.cos((pan+1)*np.pi/4)
        result[start:start+len(sig),1]+=sig*np.sin((pan+1)*np.pi/4)
    return result


for event in PLAN['effects']:
    # Whoosh attacks lead the cut by 180 ms; other cue times are onsets.
    add(fx,event['time']-(.18 if event['kind']=='whoosh' else 0),
        effect(event['kind']),event['gain'])

t=np.arange(N,dtype=np.float32)/SR
fade=np.sin(np.minimum(t/2.0,1)*np.pi/2)**2
fade*=np.sin(np.clip((DURATION-t)/(DURATION-PLAN['mix']['fade_out_start']),0,1)*np.pi/2)**2
music*=fade[:,None]; fx*=fade[:,None]
# Subsonic cleanup; keep the composed dynamics rather than brickwall limiting.
hp=butter(2,30,btype='highpass',fs=SR,output='sos')
music=sosfilt(hp,music,axis=0).astype(np.float32)
fx=sosfilt(hp,fx,axis=0).astype(np.float32)
mixed=music*PLAN['mix']['music_gain']+fx*PLAN['mix']['effects_gain']
assert np.isfinite(mixed).all() and np.max(np.abs(mixed))<1, 'Source must not clip'
for name,samples in [('musik',music),('efek',fx),('campuran',mixed)]:
    wavfile.write(TMP/(name+'.wav'),SR,samples)


def ffmpeg(*args):
    return subprocess.run(['ffmpeg','-hide_banner','-nostdin','-y',*map(str,args)],
                          check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)


def measure(path):
    proc=ffmpeg('-i',path,'-af','loudnorm=I=-18:TP=-1.8:LRA=9:print_format=json','-f','null','-')
    return json.loads(proc.stderr[proc.stderr.rfind('{'):proc.stderr.rfind('}')+1])


print('Komposisi dan 22 efek selesai; mengukur campuran.',flush=True)
before=measure(TMP/'campuran.wav')
m=PLAN['mix']
normalizer=(f"loudnorm=I={m['target_lufs']}:TP={m['true_peak_limit_dbtp']}:LRA=9:"
            f"measured_I={before['input_i']}:measured_TP={before['input_tp']}:"
            f"measured_LRA={before['input_lra']}:measured_thresh={before['input_thresh']}:"
            f"offset={before['target_offset']}:linear=true:print_format=json")
mixpath=OUT/'Musik_dan_Efek.m4a'
norm=ffmpeg('-i',TMP/'campuran.wav','-af',normalizer,'-ar',SR,'-c:a','aac','-b:a','192k',
            '-t',DURATION,'-movflags','+faststart',mixpath)
normalization=json.loads(norm.stderr[norm.stderr.rfind('{'):norm.stderr.rfind('}')+1])
# Music-only file: match the mixed track's linear gain, so it can be swapped easily.
linear_gain=10**((float(normalization['output_i'])-float(before['input_i']))/20)
for wav,name,bitrate in [('musik','Musik_Instrumental.m4a','160k'),('efek','Efek_Suara.m4a','96k')]:
    ffmpeg('-i',TMP/(wav+'.wav'),'-af',f'volume={linear_gain}',
           '-ar',SR,'-c:a','aac','-b:a',bitrate,'-t',DURATION,'-movflags','+faststart',OUT/name)

source=R/'Pratinjau_Dashboard_Lengkap.mp4'; movie=R/'Video_Dashboard_Musik_Efek.mp4'
ffmpeg('-i',source,'-i',mixpath,'-map','0:v:0','-map','1:a:0','-c','copy',
       '-t',DURATION,'-movflags','+faststart','-metadata',
       'comment=Original procedural instrumental and sound effects. No voiceover.',movie)
report={'version':PLAN['version'],'voiceover':False,
        'music_provenance':PLAN['music']['provenance'],
        'original_score_title':PLAN['music']['title'],'source_peak_dbfs':float(20*np.log10(np.max(np.abs(mixed)))),
        'effects_count':len(PLAN['effects']),'source_measurement':before,
        'normalization':normalization,'encoded_mix_measurement':measure(mixpath),
        'video_mux':'H.264 stream copy; original visual frames unchanged',
        'audio_codec':'AAC stereo 48 kHz, 192 kb/s',
        'files':{p.relative_to(R).as_posix():{'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
                  'bytes':p.stat().st_size} for p in [*sorted(OUT.glob('*.m4a')),movie]}}
(R/'CATATAN_AUDIO.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'movie':str(movie),'duration':DURATION,'audio':report['encoded_mix_measurement'],
                  'bytes':movie.stat().st_size},ensure_ascii=False),flush=True)
