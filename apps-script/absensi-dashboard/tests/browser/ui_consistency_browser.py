"""UI geometry/close behavior against real injected pages; reuse existing mocked service fixtures."""
import ast,json,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];REPO=ROOT.parents[1]
tree=ast.parse((ROOT/'tests/browser/sesi_akses_browser.py').read_text())
assign=lambda name:next(n.value for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id==name for t in n.targets))
f=json.loads(subprocess.check_output(['node','--input-type=module','-e',ast.literal_eval(assign('script'))],cwd=REPO,text=True));mock=ast.literal_eval(assign('MOCK').func.value).replace('FIXTURE',json.dumps(f))
out=Path('/tmp/ui-consistency-preview');out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 def open_page(name,route,role='admin',width=1361,query=''):
  page=b.new_page(viewport={'width':width,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script(mock+"window.__role="+json.dumps(role)+";sessionStorage.setItem(window.__f.storageKey,window.__f.sessions[window.__role].token);")
  page.route('**/*',lambda r:r.fulfill(status=200,content_type='text/html',body=f['html'][name]) if r.request.resource_type=='document' else r.abort());page.goto('https://script.google.com/macros/s/COPY/exec?page='+route+query);expect(page.locator('#panitiaAuth')).not_to_be_visible();page.mouse.move(width-20,120);page.wait_for_timeout(700);return page,errors
 total=0
 for width in [1361,390]:
  for name,route in [('Beranda','beranda'),('Peserta','peserta'),('Index','monitoring'),('Pengelolaan','pengelolaan'),('Profil','profil'),('ManajemenAkses','akses')]:
   page,errors=open_page(name,route,width=width,query='' if name=='Peserta' else '&program=PRG001&jenjang=JEN001&sesi=SES001&keikutsertaan=KST001')
   # Every rendered popup has exactly one accessible 44 px header icon, including dynamically mounted ones.
   for ident in page.locator('dialog').evaluate_all('els=>els.map(e=>e.id)'):
    dialog=page.locator('#'+ident);expect(dialog.locator('.modal-close')).to_have_count(1);x=dialog.locator('.modal-close');assert x.get_attribute('aria-label');assert x.get_attribute('type')=='button'
    page.evaluate('id=>document.getElementById(id).showModal()',ident);box=x.bounding_box();assert box and abs(box['width']-44)<.1 and abs(box['height']-44)<.1,(name,ident,box);icon=x.locator('svg').bounding_box();assert icon and icon['width']==20 and icon['height']==20
    assert dialog.evaluate('(d)=>{const b=d.querySelector(".modal-close").getBoundingClientRect(),r=d.getBoundingClientRect();return b.x>=r.x&&b.right<=r.right&&b.y>=r.y&&b.bottom<=r.bottom;}')
    page.evaluate('id=>document.getElementById(id).close()',ident);total+=1
   gaps=page.locator('.creation-actions,.creation-card-actions,.verification-actions,.evaluasi-actions,.access-workspace .actions,.session-actions').evaluate_all("els=>els.filter(e=>e.getBoundingClientRect().width>0).map(e=>getComputedStyle(e).gap)");assert all(g=='12px' for g in gaps),(name,gaps)
   if name=='Pengelolaan':
    gap=page.evaluate("()=>{const a=document.querySelector('#jenjangPanel'),b=a.nextElementSibling;return b.getBoundingClientRect().top-a.getBoundingClientRect().bottom;}");assert abs(gap-12)<1
   if name=='Peserta':
    expect(page.locator('#participantJenjang')).to_be_disabled();assert page.locator('#program').bounding_box()['y']<page.locator('#participantJenjang').bounding_box()['y'];expect(page.locator('#participantJenjang option')).to_have_text('Pilih program terlebih dahulu')
    page.screenshot(path=str(out/f'Peserta-Program-Jenjang-{width}.png'),full_page=True)
    page.locator('#program').select_option('PRG001');expect(page.locator('#participantJenjang')).to_be_enabled();expect(page.locator('#participantJenjang')).to_have_value('');page.locator('#participantJenjang').select_option('JEN003');page.locator('#program').select_option('PRG002');expect(page.locator('#participantJenjang')).to_have_value('JEN002');page.locator('#program').select_option('');expect(page.locator('#participantJenjang')).to_be_disabled();expect(page.locator('#participantJenjang')).to_have_value('')
    page.locator('#program').select_option('PRG001');page.locator('#openSingleParticipant').click();page.locator('#singleName').fill('Isian belum disimpan');before=page.evaluate('window.__calls.length');page.locator('#singleParticipantDialog .modal-close').click();expect(page.locator('#singleParticipantDialog')).not_to_be_visible();assert page.evaluate('window.__calls.length')==before
   assert not errors,errors;page.close()
 # New header relays preserve cancellation/no-write semantics and mirror existing disabled state.
 page,errors=open_page('Index','monitoring',query='&program=PRG001&jenjang=JEN001&sesi=SES001')
 page.locator('#quickBehavior').click();expect(page.locator('#behaviorDialog')).to_be_visible();
 before=page.evaluate('window.__calls.length');page.locator('#closeBehavior').click();expect(page.locator('#behaviorDialog')).not_to_be_visible();assert page.evaluate('window.__calls.length')==before
 page.locator('#quickBehavior').click();page.evaluate("document.querySelector('#cancelBehavior').disabled=true");expect(page.locator('#closeBehavior')).to_be_disabled();page.evaluate("document.querySelector('#closeBehavior').click()");expect(page.locator('#behaviorDialog')).to_be_visible();page.evaluate("document.querySelector('#cancelBehavior').disabled=false");expect(page.locator('#closeBehavior')).to_be_enabled();page.locator('#closeBehavior').click()
 page.locator('#openPresensi').click();page.locator('#quickLeave').click();expect(page.locator('#editDialog')).to_be_visible();before=page.evaluate('window.__calls.length');page.locator('#closeEdit').click();expect(page.locator('#editDialog')).not_to_be_visible();assert page.evaluate('window.__calls.length')==before
 # Long heading/mobile and long modal scroll leave the X reachable in the header.
 page.set_viewport_size({'width':390,'height':850});page.locator('#quickBehavior').click();page.locator('#behaviorDialog h2').evaluate("e=>e.textContent='Catat Sikap dan Perilaku dengan Judul Panjang untuk Pengujian'");page.locator('#behaviorDialog').evaluate('d=>d.scrollTop=d.scrollHeight');r=page.locator('#closeBehavior').bounding_box();d=page.locator('#behaviorDialog').bounding_box();assert r and d and r['y']>=d['y'] and r['y']+44<=d['y']+d['height'];page.screenshot(path=str(out/'Modal-X-Scroll-Mobile.png'));page.locator('#closeBehavior').click();assert not errors,errors;page.close()
 # Real deletion preview/confirmation path: X acts as Batal and makes no deletion RPC.
 page,errors=open_page('Index','monitoring',query='&program=PRG001&jenjang=JEN001&sesi=SES001');page.locator('#tabNilai').click();page.locator('#newIndicatorForm').click();page.locator('#indicatorManageSelect').select_option('IND002');expect(page.locator('#indicatorDeleteInfo')).to_contain_text('belum dirujuk');page.locator('#indicatorReason').fill('Batalkan penghapusan melalui X');page.locator('#indicatorDeleteAgree').check();page.locator('#deleteIndicator').click();expect(page.locator('#indicatorDeleteConfirmDialog')).to_be_visible();expect(page.locator('#cancelIndicatorDelete')).to_be_focused();before=page.evaluate('window.__calls.length');page.locator('#closeIndicatorDelete').click();expect(page.locator('#indicatorDeleteConfirmDialog')).not_to_be_visible();expect(page.locator('#indicatorReason')).to_have_value('Batalkan penghapusan melalui X');assert page.evaluate('window.__calls.length')==before;assert not page.evaluate("window.__calls.some(c=>c.arg?.nama==='hapusDataIndex')");page.locator('#closeIndicatorDialog').click();assert not errors,errors
 page.close();b.close()
print(f'PASS: {total} modal occurrences desktop/mobile have one 44x44 X/20px icon, action/card 12px spacing, Program→Jenjang states and switching, header cancellation/disabled mirror/no-write, long heading/sticky scroll; actual injected HTML and Google fixtures mocked.')
