import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionHarness} from './support/sesi-harness.mjs';

test('public login artwork ignores caller input and cannot read configuration, identity or sheets',()=>{
 const {t}=sessionHarness();
 const deny=()=>{throw Error('Artwork must not access application services');};
 for(const name of ['SpreadsheetApp','PropertiesService','CacheService','Session','UrlFetchApp','DriveApp'])t.c[name]=new Proxy({},{get:deny});
 const artwork=t.c.muatIlustrasiLoginPanitia({url:'https://example.invalid',id_program:'SECRET-PROGRAM',token:'untrusted'});
 assert.deepEqual(Object.keys(artwork),['foto']);
 assert.match(artwork.foto,/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/);
 assert.ok(artwork.foto.length<500000);
 const bytes=Buffer.from(artwork.foto.split(',')[1],'base64');
 assert.equal(bytes.readUInt16BE(0),0xffd8);assert.equal(bytes.readUInt16BE(bytes.length-2),0xffd9);
});

test('protected HTML excludes the large photo and the operational gateway still rejects decorative RPCs',()=>{
 const {t,staff,call}=sessionHarness(),photo=t.c.muatIlustrasiLoginPanitia().foto;
 for(const page of ['Beranda','Index','Peserta','Profil','Pengelolaan','ManajemenAkses']){
  const html=t.c.keluaranAplikasiPanitia_(page,page).content;
  assert.ok(!html.includes(photo));assert.ok(!html.includes(staff.token));
 }
 assert.throws(()=>call(staff,'muatIlustrasiLoginPanitia'),/tidak tersedia|tidak diizinkan/i);
});
