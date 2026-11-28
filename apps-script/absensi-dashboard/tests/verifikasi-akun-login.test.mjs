import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {sessionHarness,plain} from './support/sesi-harness.mjs';
function fresh(role='petugas_kelas'){
 const h=sessionHarness();h.asOwner();h.t.addUser({nama:'Akun Baru',email:'baru@test.invalid',peran:role,id_permintaan:'account_verification_new_user_01'});
 h.t.provider({profile:{email:'baru@test.invalid',sub:'123123123123123123123',name:'Akun Baru'}});h.t.fetches.length=0;return h;
}
const sessions=t=>plain([...t.h.props].filter(([k])=>k.startsWith('SESI-')));
for(const role of ['admin_pelatihan','petugas_kelas','pengajar'])test('verification binds a registered '+role+' without creating or refreshing application sessions',()=>{
 const {t}=fresh(role),flow=t.startVerification(),before=sessions(t),main=plain(t.h.store);
 const r=plain(t.finishApp(flow));assert.deepEqual(r,{sukses:true,tujuan:'verifikasi_akun'});
 assert.equal(t.access.records('Pengguna').find(u=>u.email_google==='baru@test.invalid').google_sub,'123123123123123123123');
 assert.deepEqual(sessions(t),before);assert.deepEqual(plain(t.h.store),main);
 assert.throws(()=>t.finishApp(flow),/kedaluwarsa|dipakai/);
});
test('verification callback uses the same welcome renderer while owner identity diagnostics stay separate',()=>{
 const {t}=fresh(),v=t.startVerification();
 const html=t.c.doGet({parameter:{state:v.state,code:'<script>untrusted',verifikasi_akun:'false'}}).content;
 const cfg=JSON.parse(html.match(/const cfg=(\{.*?\});document\.documentElement/)[1]);
 assert.equal(cfg.page,'Beranda');assert.equal(cfg.callback.verifikasi_akun,true);assert.equal(cfg.callback.code,'<script>untrusted');
 assert.ok(!html.includes('<script>untrusted'));
 for(const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 const proof=t.start();assert.ok(t.c.doGet({parameter:{state:proof.state,code:'proof'}}).content.includes('id="identity"'));
 const app=t.startApp();const appHtml=t.c.doGet({parameter:{state:app.state,code:'app',verifikasi_akun:'true'}}).content;
 const appCfg=JSON.parse(appHtml.match(/const cfg=(\{.*?\});document\.documentElement/)[1]);assert.equal(appCfg.callback.verifikasi_akun,undefined);
});
for(const failure of ['unregistered','inactive','subject','nonce'])test('verification rejects '+failure+' accounts without binding or granting a session',()=>{
 const {t}=fresh(),flow=t.startVerification(),user=t.access.records('Pengguna').find(u=>u.email_google==='baru@test.invalid');
 if(failure==='unregistered')t.provider({profile:{email:'unknown@test.invalid'}});
 if(failure==='inactive')t.access.patch('Pengguna',user.id_pengguna,'id_pengguna',{status:'nonaktif'});
 if(failure==='subject')t.access.patch('Pengguna',user.id_pengguna,'id_pengguna',{google_sub:'DIFFERENT-SUBJECT'});
 if(failure==='nonce')t.provider({claims:{nonce:'unrelated-nonce'}});
 const before=sessions(t);assert.throws(()=>t.finishApp(flow),/belum terdaftar|berbeda|Klaim/);assert.deepEqual(sessions(t),before);
 assert.equal(t.access.records('Pengguna').find(u=>u.email_google==='baru@test.invalid').google_sub,failure==='subject'?'DIFFERENT-SUBJECT':'');
});
test('verification cannot be exchanged as a diagnostic proof or login and requires the originating browser secret',()=>{
 const {t}=fresh(),flow=t.startVerification(),d={state:flow.state,browser_key:flow.browser_key,code:'code'};
 assert.throws(()=>t.c.verifikasiUjiLoginGoogle(d),/Tujuan/);
 assert.throws(()=>t.c.tukarLoginGoogleAkses_(d,'aplikasi'),/Tujuan/);
 assert.throws(()=>t.finishApp(flow,{browser_key:'f'.repeat(64)}),/browser/);
 assert.equal(t.fetches.length,0);assert.deepEqual(plain(t.finishApp(flow)),{sukses:true,tujuan:'verifikasi_akun'});
});
test('verification fails closed if disabled or expired before completion',()=>{
 for(const mode of ['disabled','expired']){
  const h=fresh(),{t}=h,flow=t.startVerification(),before=sessions(t);
  if(mode==='disabled'){t.c.aturLoginAplikasiPanitia({aktif:false,konfirmasi:true});assert.throws(()=>t.startVerification(),/belum aktif/);}
  else{const k='GOOGLE-AKSES|'+flow.state,p=JSON.parse(t.cache.get(k));p.expires=Date.now()-1;t.cache.set(k,JSON.stringify(p));}
  assert.throws(()=>t.finishApp(flow),/belum aktif|kedaluwarsa|browser login tidak cocok/);assert.deepEqual(sessions(t),before);assert.equal(t.fetches.length,0);
 }
});
