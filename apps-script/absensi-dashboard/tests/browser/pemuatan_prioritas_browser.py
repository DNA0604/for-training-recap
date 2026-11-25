"""Actual injected pages with independently held location, primary data and attendance responses."""
import json,subprocess
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];REPO=ROOT.parents[1]
script=r"""import {loadingHarness} from './apps-script/absensi-dashboard/tests/support/pemuatan-audit-harness.mjs';const h=loadingHarness(22),t=h.t,responses={};for(const [name,args] of [['muatAwalIndex',[]],['muatKehadiranIndex',['SES001']],['muatKelolaProgramIndex',['PRG001']],['muatRingkasanPesertaIndex',['PRG001']],['muatKelolaPengajar',[]],['muatPenghapusanTertundaIndex',[]],['muatDaftarVerifikasiSesiPanitia',[]],['muatPengajuanKoreksiPanitia',[]]])responses[name]=h.call(h.admin,name,...args);const participants=Object.fromEntries(['','JEN001','JEN003'].map(j=>[j,h.call(h.admin,'muatPesertaProgramIndex','PRG001','',0,j)]));process.stdout.write(JSON.stringify({html:Object.fromEntries(['Index','Peserta','Pengelolaan'].map(n=>[n,t.c.keluaranAplikasiPanitia_(n,n).content])),login:h.admin,identity:t.c.muatSesiAplikasiPanitia(h.admin.token),responses,participants}));"""
f=json.loads(subprocess.check_output(['node','--input-type=module','-e',script],cwd=REPO,text=True))
MOCK=r'''
window.calls=[];window.locations=[];window.primary=[];window.attendance=[];
window.holdLocation=true;window.holdPrimary=true;window.holdAttendance=true;window.attendanceFailure=false;
sessionStorage.setItem(F.login.storage_key,F.login.token);
function value(name,arg){
 if(name==='muatSesiAplikasiPanitia')return F.identity;
 if(name==='panggilBacaanDashboardPanitia')return {sukses:true,hasil:arg.permintaan.map(p=>({sukses:true,data:value('panggilAplikasiPanitia',p)}))};
 if(name!=='panggilAplikasiPanitia')throw Error('Unexpected native request '+name);
 const rpc=arg.nama;if(rpc==='muatKehadiranIndex'&&attendanceFailure)throw Error('Kehadiran belum dapat dimuat');
 if(rpc==='muatPesertaProgramIndex')return F.participants[arg.args[3]||''];
 if(!(rpc in F.responses))throw Error('Unexpected application request '+rpc);
 return F.responses[rpc];
}
function bridge(ok,bad){return new Proxy({},{get(t,name){if(name==='withSuccessHandler')return fn=>bridge(fn,bad);if(name==='withFailureHandler')return fn=>bridge(ok,fn);return arg=>{
 calls.push({name,arg,at:performance.now()});const work=()=>{try{ok?.(value(name,arg));}catch(e){bad?.(e);}};
 if(name==='panggilAplikasiPanitia'&&arg.nama==='muatAwalIndex'&&holdPrimary)primary.push(work);
 else if(name==='panggilAplikasiPanitia'&&arg.nama==='muatKehadiranIndex'&&holdAttendance)attendance.push(work);
 else setTimeout(work,0);
};}});}
window.google={script:{run:bridge(),history:{replace(){}},host:{close(){}},url:{getLocation(fn){const work=()=>fn({parameter:window.params});if(holdLocation)locations.push(work);else setTimeout(work,0);}}}};
window.releaseLocation=()=>{holdLocation=false;locations.splice(0).forEach(fn=>fn());};
window.releasePrimary=()=>{holdPrimary=false;primary.splice(0).forEach(fn=>fn());};
window.releaseAttendance=()=>{holdAttendance=false;attendance.splice(0).forEach(fn=>fn());};
'''
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def page_for(host,width=1440,query='program=PRG001&jenjang=JEN001&sesi=SES001'):
  page=browser.new_page(viewport={'width':width,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  params={k:v[0] for k,v in parse_qs(query).items()}
  page.clock.install()
  page.add_init_script('window.F='+json.dumps(f)+';window.params='+json.dumps(params)+';'+MOCK)
  page.route('**/*',lambda route:route.fulfill(status=200,content_type='text/html',body=f['html'][host]) if route.request.resource_type=='document' else route.abort())
  page.goto('https://script.google.com/macros/s/COPY/exec?'+query,wait_until='domcontentloaded');return page,errors
 for host in ['Peserta','Pengelolaan','Index']:
  for width in [1440,390]:
   page,errors=page_for(host,width);page.wait_for_function('primary.length===1');assert page.evaluate('locations.length>0')
   # URL parameters have arrived while the spreadsheet response is deliberately still pending.
   page.evaluate('releaseLocation()');assert page.evaluate('primary.length===1')
   page.evaluate('releasePrimary()')
   if host=='Peserta':
    expect(page.locator('#participantsBody tr')).to_have_count(22)
    expect(page.locator('#participantJenjang')).to_have_value('JEN001')
    requests=page.evaluate("calls.filter(c=>c.arg?.nama==='muatPesertaProgramIndex')")
    assert len(requests)==1 and requests[0]['arg']['args'][3]=='JEN001',requests
    # Explicit reload and search are fresh requests, not a reused page cache.
    page.locator('#refreshParticipants').click();page.wait_for_function("calls.filter(c=>c.arg?.nama==='muatPesertaProgramIndex').length===2")
   elif host=='Pengelolaan':
    expect(page.locator('#sessionJenjang')).to_have_value('JEN001');expect(page.locator('#summaryParticipantBody tr')).to_have_count(10)
    assert page.evaluate("calls.filter(c=>c.arg?.nama==='muatKelolaProgramIndex').length")==1
   else:
    page.wait_for_function('attendance.length===1')
    assert not page.evaluate("calls.some(c=>c.name==='panggilBacaanDashboardPanitia'||c.arg?.nama==='muatPengajuanKoreksiPanitia')")
    page.evaluate('releaseAttendance()');expect(page.locator('#total')).to_have_text('22')
    page.wait_for_function("calls.some(c=>c.name==='panggilBacaanDashboardPanitia')")
    expect(page.locator('#message')).to_contain_text('Data dimuat pukul')
   assert not errors,errors;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');page.close()
 # Supplementary history remains available even with no session or a failed attendance request.
 for query,failed in [('',False),('program=PRG001&jenjang=JEN001&sesi=SES001',True)]:
  page,errors=page_for('Index',query=query);page.wait_for_function('primary.length===1');page.evaluate('releaseLocation();releasePrimary()')
  if failed:
   page.wait_for_function('attendance.length===1');page.evaluate('attendanceFailure=true;releaseAttendance()');expect(page.locator('#message')).to_contain_text('Kehadiran belum dapat dimuat')
  page.wait_for_function("calls.some(c=>c.name==='panggilBacaanDashboardPanitia')")
  if not failed:assert not page.evaluate("calls.some(c=>c.arg?.nama==='muatKehadiranIndex')")
  assert not errors,errors;page.close()
 # Slow location replies still retain direct session context; unavailable location does not hide history.
 page,errors=page_for('Index');page.wait_for_function('primary.length===1');page.evaluate('releasePrimary()');page.clock.fast_forward(800)
 page.wait_for_function("calls.some(c=>c.name==='panggilBacaanDashboardPanitia')")
 page.evaluate('releaseLocation()');page.wait_for_function('attendance.length===1');page.evaluate('releaseAttendance()');expect(page.locator('#total')).to_have_text('22');expect(page.locator('#sesi')).to_have_value('SES001');assert not errors,errors;page.close()
 # Unknown level falls back to the same program-wide list; a direct program change resets the old filter.
 page,errors=page_for('Peserta',query='program=PRG001&jenjang=UNKNOWN');page.wait_for_function('primary.length===1');page.evaluate('releaseLocation();releasePrimary()');expect(page.locator('#participantJenjang')).to_have_value('')
 assert page.evaluate("calls.filter(c=>c.arg?.nama==='muatPesertaProgramIndex').length")==1
 assert not errors,errors;page.close();browser.close()
print('PASS: parallel URL/program preparation at desktop/mobile, one correct-level participant load, fresh reload, primary Monitoring ahead of history, failed/no-session fallback, unchanged ten-person management summary; Google services mocked.')
