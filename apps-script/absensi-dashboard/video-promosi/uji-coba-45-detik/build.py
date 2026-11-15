#!/usr/bin/env python3
"""Build editable Hyperframes scenes. No application files or backend data are changed."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent
CSS = r'''
@font-face{font-family:Nunito;src:url('assets/fonts/nunito-latin-400-normal.woff2');font-weight:400}
@font-face{font-family:Nunito;src:url('assets/fonts/nunito-latin-700-normal.woff2');font-weight:700}
@font-face{font-family:Nunito;src:url('assets/fonts/nunito-latin-800-normal.woff2');font-weight:800}
@font-face{font-family:Nunito;src:url('assets/fonts/nunito-latin-900-normal.woff2');font-weight:900}
*{box-sizing:border-box;margin:0;padding:0}
#root{position:absolute;inset:0;overflow:hidden;font-family:Nunito,Arial,sans-serif;color:#192e50}
.world{position:absolute;inset:0;overflow:hidden;background:#f0f3f8}
.white{background:#fff}.navy{background:#192e50;color:#fff}
.eyebrow{font-size:28px;font-weight:800;letter-spacing:4px;line-height:1.3}
.headline{font-size:88px;font-weight:900;line-height:1.08;letter-spacing:-3px}
.body{font-size:32px;line-height:1.5;font-weight:400}
.muted{color:#52667f}.cyan{color:#0086b3}.light{color:#c5d5e8}
.abs{position:absolute}.line{display:block}.word{display:inline-block}
.picture{display:block;width:100%;height:auto}
.photo-box{position:absolute;overflow:hidden;background:#fff;border-radius:28px;box-shadow:0 24px 60px #192e5020;border:1px solid #dae2ed}
.browser{position:absolute;overflow:hidden;background:#fff;border-radius:24px;box-shadow:0 28px 64px #192e5026;border:1px solid #d6deeb}
.browser-top{height:46px;display:flex;align-items:center;padding:0 23px;gap:8px;border-bottom:1px solid #e0e7ef;background:#fff}
.dot{width:8px;height:8px;border-radius:50%;background:#c7d2e3}
.browser-name{font-size:16px;color:#52667f;letter-spacing:.3px;margin-left:20px}
.browser-body{position:relative;overflow:hidden;background:#eef2f7}
.source-note{position:absolute;left:100px;bottom:46px;font-size:28px;font-weight:700;color:#52667f;letter-spacing:.25px}
.navy .source-note{color:#c5d5e8}
.cursor{position:absolute;width:58px;height:68px;filter:drop-shadow(0 6px 5px #192e5030);z-index:30;pointer-events:none}
.cursor path{fill:white;stroke:#192e50;stroke-width:2.5;stroke-linejoin:round}
.rule{height:5px;width:80px;background:#0086b3;border-radius:3px}
.quiet-label{font-size:26px;line-height:1.4;font-weight:700}
.pill{display:inline-flex;align-items:center;gap:12px;border:1px solid #d9e3ee;border-radius:30px;padding:13px 22px;background:white;font-size:28px;font-weight:700}
.pill-dot{width:10px;height:10px;border-radius:50%;background:#0086b3}
.chapter{position:absolute;right:96px;top:70px;font-size:20px;font-weight:800;letter-spacing:2px;color:#52667f}
.navy .chapter{color:#c5d5e8}
'''
CURSOR = '<svg viewBox="0 0 44 54" aria-hidden="true"><path d="M5 3L35 30 22 32 16 47 10 44 15 30 3 34Z"/></svg>'

def scene(name, duration, markup, script, css=''):
    markup = re.sub(r'<div class="chapter">.*?</div>', '', markup)
    text = '<template>\n<style>\n' + CSS + '\n' + css + '\n</style>\n'
    text += f'<div id="root" data-composition-id="{name}" data-width="1920" data-height="1080" data-duration="{duration}">\n{markup}\n</div>\n'
    text += '<script>\n(() => {\nconst tl = gsap.timeline({paused:true});\n' + script
    text += f'\nwindow.__timelines = window.__timelines || {{}}; window.__timelines["{name}"] = tl;\n}})();\n</script>\n</template>\n'
    text = '\n'.join(line.rstrip() for line in text.splitlines()) + '\n'
    (ROOT/'compositions'/f'{name}.html').write_text(text)

def browser(name, image, x, y, w, h, label='Monitoring Pelatihan Pegawai'):
    return f'''<div id="{name}" class="browser" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px" data-layout-allow-overflow>
    <div class="browser-top"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span class="browser-name" data-layout-ignore>{label}</span></div>
    <div class="browser-body" style="height:{h-46}px"><img class="picture" src="assets/{image}.png" alt="Tampilan aplikasi {image}" /></div></div>'''

scene('opening',5.5, f'''
<div id="op-world" class="world">
 <div class="chapter">MONITORING PELATIHAN PEGAWAI</div>
 <div id="op-copy" class="abs" style="left:100px;top:178px;z-index:8">
  <div id="op-rule" class="rule" style="margin-bottom:35px"></div>
  <h1 class="headline"><span id="op-many" class="line">Banyak aktivitas.</span><span id="op-one" class="line cyan" style="margin-top:14px">Satu dashboard.</span></h1>
  <p id="op-sub" class="body muted" style="margin-top:36px;max-width:620px">Kelola pelatihan dari awal<br>hingga laporan.</p>
 </div>
 {browser('op-dashboard','beranda',830,185,1260,900)}
 <div id="op-presence" class="photo-box" style="left:935px;top:275px;width:800px;height:470px;z-index:10" data-layout-allow-overflow>
  <img class="picture" src="assets/kehadiran.png" style="width:1000px" alt="Kehadiran peserta" />
 </div>
 <div id="op-notes" class="photo-box" style="left:1200px;top:665px;width:620px;height:260px;z-index:12" data-layout-allow-overflow>
  <img class="picture" src="assets/catatan.png" style="width:1000px" alt="Catatan aktivitas" />
 </div>
 <div class="source-note">Pusat Pengembangan Aparatur Komdigi</div>
</div>''', '''
tl.fromTo('#op-presence',{x:60,y:70,rotation:-4},{x:0,y:0,rotation:-4,duration:.8,ease:'power4.out'},0);
tl.fromTo('#op-notes',{x:100,y:130,rotation:4},{x:0,y:0,rotation:4,duration:1,ease:'power4.out'},.12);
tl.fromTo('#op-rule',{scaleX:0,transformOrigin:'left'},{scaleX:1,duration:.5,ease:'power3.out'},.1);
tl.fromTo('#op-one',{opacity:0,y:36},{opacity:1,y:0,duration:.6,ease:'power4.out'},.6);
tl.fromTo('#op-sub',{opacity:0},{opacity:1,duration:.4},1.1);
tl.fromTo('#op-dashboard',{scale:.84,rotation:4,opacity:0,transformOrigin:'40% 50%'},{scale:1,rotation:0,opacity:1,duration:1,ease:'power3.out'},2.3);
tl.to('#op-presence',{x:-10,y:60,scale:.45,opacity:0,rotation:0,duration:.75,ease:'power3.inOut'},2.45);
tl.to('#op-notes',{x:-220,y:-130,scale:.3,opacity:0,rotation:0,duration:.75,ease:'power3.inOut'},2.6);
tl.to('#op-dashboard',{x:-90,y:0,duration:.8,ease:'power3.inOut'},3.5);
tl.to('#op-world',{opacity:0,duration:.35},5.05);
''')

scene('access',5.5, f'''
<div id="ac-world" class="world white">
 <div class="chapter">01 / AKSES WEBSITE</div>
 <div id="ac-title" class="abs" style="left:100px;top:220px;width:700px">
  <div class="eyebrow muted" style="margin-bottom:32px">AKSES YANG FAMILIAR</div>
  <h1 class="headline">Mulai dengan<br>akun Google.</h1>
  <p class="body muted" style="margin-top:36px">Masuk menggunakan akun<br>yang telah terdaftar.</p>
 </div>
 <div id="ac-panel" class="photo-box" style="left:920px;top:125px;width:830px;height:825px" data-layout-allow-overflow>
  <img class="abs" src="assets/login.png" style="width:1715px;left:-910px;top:-20px" alt="Halaman masuk dengan Google" />
 </div>
 <div id="ac-cursor" class="cursor" style="left:1355px;top:475px" data-layout-ignore>{CURSOR}</div>
 <div id="ac-success" class="pill abs" style="left:1080px;top:860px;z-index:15"><span class="pill-dot"></span>Akses sesuai akun dan peran</div>
 <div class="source-note">Admin Pelatihan · Petugas Kelas · Pengajar</div>
</div>''', '''
tl.fromTo('#ac-world',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.55,ease:'power3.inOut'},0);
tl.fromTo('#ac-title',{x:-50,opacity:0},{x:0,opacity:1,duration:.65,ease:'power4.out'},.3);
tl.fromTo('#ac-panel',{x:150,scale:.9,opacity:0},{x:0,scale:1,opacity:1,duration:.85,ease:'power4.out'},.35);
tl.fromTo('#ac-cursor',{x:550,y:450,opacity:0},{x:0,y:0,opacity:1,duration:.8,ease:'power2.inOut'},1.9);
tl.to('#ac-cursor',{scale:.83,duration:.12,ease:'power2.in'},2.75).to('#ac-cursor',{scale:1,duration:.18,ease:'power2.out'},2.87);
tl.fromTo('#ac-success',{opacity:0,y:30},{opacity:1,y:0,duration:.5,ease:'power4.out'},3.1);
tl.to('#ac-cursor',{opacity:0,duration:.2},3.45);
tl.to('#ac-panel',{scale:1.03,duration:.6,ease:'power2.inOut'},4.6);
tl.to('#ac-world',{opacity:0,duration:.3},5.05);
''')

scene('overview',6.75, f'''
<div id="ov-world" class="world">
 <div class="chapter">02 / SATU PINTU PEMANTAUAN</div>
 <div id="ov-copy" class="abs" style="left:100px;top:90px;z-index:10">
  <h1 class="headline" style="font-size:80px">Semua pelatihan.<br><span class="cyan">Dalam satu pandangan.</span></h1>
 </div>
 {browser('ov-browser','beranda',200,330,1520,1030)}
 <div id="ov-focus" class="abs" style="left:465px;top:681px;width:1220px;height:177px;border:3px solid #0086b3;border-radius:25px;z-index:10;pointer-events:none" data-layout-ignore></div>
 <div id="ov-cursor" class="cursor" style="left:225px;top:500px" data-layout-ignore>{CURSOR}</div>
 <div class="source-note" style="z-index:20">Tampilan aplikasi · Data contoh</div>
</div>''', '''
tl.fromTo('#ov-world',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power3.inOut'},0);
tl.fromTo('#ov-copy',{y:35,opacity:0},{y:0,opacity:1,duration:.6,ease:'power4.out'},.2);
tl.fromTo('#ov-browser',{y:160,rotation:1.8,scale:.9},{y:0,rotation:0,scale:1,duration:.9,ease:'power4.out'},.25);
tl.fromTo('#ov-focus',{opacity:0},{opacity:1,duration:.35},1.75);
tl.to('#ov-focus',{opacity:0,duration:.25},2.7);
tl.to('#ov-copy',{y:-25,opacity:0,duration:.4},3.1);
tl.to('#ov-browser',{scale:1.15,x:-50,y:-240,transformOrigin:'left top',duration:.8,ease:'power3.inOut'},3.1);
tl.fromTo('#ov-cursor',{opacity:0,x:550,y:180},{opacity:1,x:0,y:0,duration:.8,ease:'power2.inOut'},4.35);
tl.to('#ov-cursor',{scale:.8,duration:.12},5.25).to('#ov-cursor',{scale:1,duration:.15},5.37);
tl.to('#ov-world',{opacity:0,duration:.4},6.3);
''')

scene('hours',8, f'''
<div id="jp-world" class="world navy">
 <div class="chapter">03 / HITUNG JAM PELAJARAN</div>
 <div id="jp-copy" class="abs" style="left:100px;top:165px;width:900px">
  <div class="eyebrow light" style="margin-bottom:32px">DARI KEHADIRAN KE REKAP</div>
  <h1 class="headline">Jam pelajaran,<br><span style="color:#55d5ef">terhitung otomatis.</span></h1>
  <p class="body light" style="margin-top:35px">Berdasarkan durasi efektif<br>kehadiran peserta.</p>
 </div>
 <div id="jp-before" class="abs" style="left:1215px;top:265px;text-align:center;width:500px">
  <span style="font-size:162px;font-weight:900;line-height:1">90</span><p style="font-size:32px;margin-top:14px;color:#c5d5e8">menit efektif</p>
 </div>
 <div id="jp-after" class="abs" style="left:1215px;top:240px;text-align:center;width:500px">
  <span id="jp-value" style="font-size:205px;font-weight:900;line-height:1;color:#55d5ef">2</span><span style="font-size:64px;font-weight:800;margin-left:10px">JP</span>
  <p style="font-size:29px;margin-top:12px;color:#c5d5e8">Contoh hasil perhitungan</p>
 </div>
 <div id="jp-control" class="photo-box" style="left:160px;top:715px;width:1600px;height:167px;border-radius:28px" data-layout-allow-overflow>
  <img class="picture" src="assets/hitung-jp.png" alt="Filter pelatihan dan tombol Hitung JP Sesi" />
 </div>
 <div id="jp-cursor" class="cursor" style="left:1655px;top:816px" data-layout-ignore>{CURSOR}</div>
 <div class="source-note">Data contoh · 90 menit efektif = 2 JP</div>
</div>''', '''
tl.fromTo('#jp-world',{clipPath:'circle(0% at 84% 75%)'},{clipPath:'circle(150% at 84% 75%)',duration:.65,ease:'power3.inOut'},0);
tl.fromTo('#jp-copy',{opacity:0,x:-50},{opacity:1,x:0,duration:.7,ease:'power4.out'},.3);
tl.fromTo('#jp-control',{opacity:0,y:110},{opacity:1,y:0,duration:.75,ease:'power4.out'},.8);
tl.fromTo('#jp-before',{opacity:0,scale:.8},{opacity:1,scale:1,duration:.65,ease:'power4.out'},.9);
tl.fromTo('#jp-after',{opacity:0,scale:.7},{opacity:0,scale:.7,duration:.01},0);
tl.fromTo('#jp-cursor',{opacity:0,x:250,y:150},{opacity:1,x:0,y:0,duration:.7,ease:'power2.inOut'},2.2);
tl.to('#jp-cursor',{scale:.8,duration:.12},3.0).to('#jp-cursor',{scale:1,duration:.17},3.12);
tl.to('#jp-before',{opacity:0,y:-65,filter:'blur(10px)',duration:.45,ease:'power3.in'},3.3);
tl.to('#jp-after',{opacity:1,scale:1,duration:.8,ease:'power4.out'},3.65);
tl.to('#jp-cursor',{opacity:0,duration:.3},4.2);
tl.to('#jp-control',{opacity:.45,duration:.5},5.25);
tl.to('#jp-world',{clipPath:'inset(0 0 100% 0)',duration:.45,ease:'power3.inOut'},7.5);
''')

scene('activity',6.75, '''
<div id="at-world" class="world white">
 <div class="chapter">04 / PENCATATAN AKTIVITAS</div>
 <div id="at-copy" class="abs" style="left:100px;top:135px">
  <h1 class="headline">Setiap aktivitas<br><span class="cyan">punya jejak.</span></h1>
  <p class="body muted" style="margin-top:26px">Presensi dan catatan pelatihan lebih tertata.</p>
 </div>
 <div id="at-card" class="photo-box" style="left:100px;top:470px;width:1720px;height:455px" data-layout-allow-overflow>
  <img id="at-shot" class="picture" src="assets/catatan.png" alt="Catatan Sikap dan Perilaku beserta waktu, bukti, dan status" />
 </div>
 <div id="at-proof" class="pill abs" style="left:1250px;top:305px"><span class="pill-dot"></span>Waktu · Bukti · Status</div>
 <div class="source-note">Tampilan aplikasi · Data contoh</div>
</div>''', '''
tl.fromTo('#at-world',{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 0%)',duration:.5,ease:'power3.inOut'},0);
tl.fromTo('#at-copy',{x:-60,opacity:0},{x:0,opacity:1,duration:.7,ease:'power4.out'},.2);
tl.fromTo('#at-card',{scale:.93,y:140,opacity:0},{scale:1,y:0,opacity:1,duration:.8,ease:'power4.out'},.35);
tl.fromTo('#at-proof',{opacity:0,x:50},{opacity:1,x:0,duration:.5,ease:'power4.out'},1.7);
tl.to('#at-shot',{x:-750,y:-750,scale:1.5,transformOrigin:'left top',duration:1.1,ease:'power3.inOut'},2.9);

tl.to('#at-proof',{y:95,duration:.7,ease:'power3.inOut'},3.1);
tl.to('#at-world',{x:-140,opacity:0,duration:.45,ease:'power3.in'},6.3);
''')

scene('report',9.25, f'''
<div id="rp-world" class="world">
 <div class="chapter">05 / LAPORAN PELATIHAN</div>
 <div id="rp-copy" class="abs" style="left:100px;top:150px;z-index:8">
  <h1 class="headline" style="font-size:85px">Laporan rinci.<br><span class="cyan">Terbentuk otomatis.</span></h1>
  <p class="body muted" style="margin-top:30px">Ringkasan, evaluasi,<br>dan lampiran dalam satu dokumen.</p>
 </div>
 <div id="rp-dialog" class="photo-box" style="left:100px;top:535px;width:860px;height:510px" data-layout-allow-overflow>
  <img class="picture" src="assets/laporan-dialog.png" alt="Dialog Laporan Evaluasi Program dengan tombol Buat PDF" />
 </div>
 <div id="rp-cover" class="photo-box" style="left:1200px;top:165px;width:510px;height:721px;border-radius:5px;z-index:10" data-layout-allow-overflow>
  <img class="picture" src="assets/laporan-sampul.png" alt="Sampul laporan pelatihan dari aplikasi" />
 </div>
 <div id="rp-page" class="photo-box" style="left:1340px;top:240px;width:480px;height:679px;border-radius:5px;z-index:9" data-layout-allow-overflow>
  <img class="picture" src="assets/laporan-hasil.png" alt="Laporan dengan rincian evaluasi peserta" />
 </div>
 <div id="rp-cursor" class="cursor" style="left:865px;top:985px" data-layout-ignore>{CURSOR}</div>
 <div id="rp-stamp" class="pill abs" style="left:1110px;top:905px;z-index:20"><span class="pill-dot"></span>Rekap hingga rincian peserta</div>
 <div class="source-note" style="z-index:30">Ilustrasi laporan · Data contoh</div>
</div>''', '''
tl.fromTo('#rp-world',{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.5,ease:'power3.inOut'},0);
tl.fromTo('#rp-copy',{opacity:0,y:30},{opacity:1,y:0,duration:.65,ease:'power4.out'},.3);
tl.fromTo('#rp-dialog',{y:150,opacity:0},{y:0,opacity:1,duration:.75,ease:'power4.out'},.6);
tl.fromTo('#rp-cover',{opacity:0,y:250,rotation:0},{opacity:0,y:250,rotation:0,duration:.01},0);
tl.fromTo('#rp-page',{opacity:0,y:250},{opacity:0,y:250,duration:.01},0);
tl.fromTo('#rp-stamp',{opacity:0},{opacity:0,duration:.01},0);
tl.fromTo('#rp-cursor',{opacity:0,x:300,y:100},{opacity:1,x:0,y:0,duration:.8,ease:'power2.inOut'},1.8);
tl.to('#rp-cursor',{scale:.8,duration:.12},2.65).to('#rp-cursor',{scale:1,duration:.18},2.77);
tl.to('#rp-cover',{opacity:1,y:0,rotation:-6,duration:1,ease:'power4.out'},3.0);
tl.to('#rp-page',{opacity:1,y:0,rotation:8,duration:1,ease:'power4.out'},3.25);
tl.to('#rp-cursor',{opacity:0,duration:.25},3.4);
tl.to('#rp-dialog',{y:125,opacity:0,duration:.6,ease:'power3.in'},4.4);
tl.to('#rp-cover',{x:-140,y:0,rotation:-9,scale:.93,duration:.85,ease:'power3.inOut'},4.75);
tl.to('#rp-page',{x:-200,y:-20,rotation:3,scale:1.05,zIndex:12,duration:.85,ease:'power3.inOut'},4.9);
tl.to('#rp-stamp',{opacity:1,y:-10,duration:.55,ease:'power4.out'},5.7);
tl.to('#rp-world',{opacity:0,duration:.4},8.8);
''')

scene('closing',6.25, '''
<div id="cl-world" class="world white">
 <div id="cl-logo" class="abs" style="left:170px;top:150px;width:180px;height:180px"><img class="picture" src="assets/logo-komdigi.png" alt="Logo Komdigi asli" /></div>
 <div id="cl-brand" class="abs" style="left:395px;top:195px">
  <p style="font-size:34px;font-weight:800">Pusat Pengembangan Aparatur Komdigi</p>
  <p class="muted" style="font-size:28px;margin-top:8px">Monitoring Pelatihan Pegawai</p>
 </div>
 <div id="cl-copy" class="abs" style="left:170px;top:410px">
  <h1 class="headline" style="font-size:106px;line-height:1.08">Satu pintu.<br><span class="cyan">Pelatihan lebih tertata.</span></h1>
 </div>
 <div id="cl-line" class="abs" style="left:170px;top:740px;height:4px;width:1580px;background:#192e50"></div>
 <div id="cl-end" class="abs" style="left:170px;top:805px;display:flex;justify-content:space-between;width:1580px">
  <p style="font-size:33px;font-weight:700">Pantau. Catat. Hitung. Laporkan.</p>
  <p class="muted" style="font-size:28px">Dashboard Pelatihan</p>
 </div>
</div>''', '''
tl.fromTo('#cl-world',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.6,ease:'power3.inOut'},0);
tl.fromTo('#cl-logo',{scale:.7,opacity:0,rotation:-7},{scale:1,opacity:1,rotation:0,duration:.85,ease:'power4.out'},.25);
tl.fromTo('#cl-brand',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.8,ease:'power3.out'},.55);
tl.fromTo('#cl-copy',{y:70,opacity:0},{y:0,opacity:1,duration:.8,ease:'power4.out'},1.05);
tl.fromTo('#cl-line',{scaleX:0,transformOrigin:'left'},{scaleX:1,duration:.8,ease:'power3.inOut'},2.0);
tl.fromTo('#cl-end',{opacity:0},{opacity:1,duration:.5},2.5);
''')

slots=[('opening',0,5.5),('access',5,5.5),('overview',10,6.75),('hours',16.25,8),('activity',23.75,6.75),('report',30,9.25),('closing',38.75,6.25)]
hosts='\n'.join(f'<div id="{n}" class="clip" data-composition-id="{n}" data-composition-src="compositions/{n}.html" data-start="{s}" data-duration="{d}" data-track-index="{i+1}" data-track-kind="graphics" data-width="1920" data-height="1080"></div>' for i,(n,s,d) in enumerate(slots))
sounds=[('click-login',7.83,'click-soft',.8),('click-monitoring',15.33,'click-soft',.8),('click-hours',19.33,'click-soft',.8),('click-pdf',32.73,'click-soft',.8),('move-hours',16.35,'whoosh-short',.30),('move-report',30.1,'whoosh-short',.30),('document-land',33.28,'pop',.4)]
lengths={'click-soft':.365688,'whoosh-short':.574688,'pop':.72}
audio='\n'.join(f'<audio id="{n}" src="assets/sfx/{a}.mp3" data-start="{s}" data-duration="{lengths[a]}" data-volume="{v}" data-track-index="{9 if a=='click-soft' else 10}"></audio>' for n,s,a,v in sounds)
root=f'''<!doctype html>
<html lang="id" data-composition-variables='[{{"id":"color-ground","type":"color","label":"Latar","default":"#f0f3f8"}},{{"id":"color-ink","type":"color","label":"Navy","default":"#192e50"}},{{"id":"color-accent","type":"color","label":"Aksen","default":"#0086b3"}}]'>
<head><meta charset="UTF-8"><meta name="viewport" content="width=1920,height=1080"><title>Satu Pintu · Dashboard Pelatihan</title>
<script src="vendor/gsap.min.js"></script><style>*{{box-sizing:border-box}}html,body{{margin:0;width:1920px;height:1080px;overflow:hidden;background:#f0f3f8}}#root{{position:relative;width:1920px;height:1080px}}.clip{{position:absolute;inset:0}}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="45" data-width="1920" data-height="1080" data-fps="30">
{hosts}
<audio id="music" src="assets/music.m4a" data-start="0" data-duration="45" data-volume=".85" data-track-index="8"></audio>
{audio}
</div><script>window.__timelines=window.__timelines||{{}};const tl=gsap.timeline({{paused:true}});tl.to({{}},{{duration:45}});window.__timelines.main=tl;</script></body></html>'''
(ROOT/'index.html').write_text(root)
(ROOT/'TIMELINE.json').write_text(json.dumps({'duration':45,'fps':30,'size':[1920,1080],'scenes':[{'id':n,'start':s,'duration':d} for n,s,d in slots]},indent=2))
print('Built seven editable scenes · 45 seconds · 1920×1080 · 30 fps')
