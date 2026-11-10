// Offline service-call counts and response equality; this does not measure Google latency.
import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {loadingHarness,instrumentLoading,loadingScenarios} from './support/pemuatan-audit-harness.mjs';
const base=process.argv.find(s=>s.startsWith('--base='))?.slice(7)||'511f9df',dest=process.argv.find(s=>s.startsWith('--out='))?.slice(6)||'/tmp/pemuatan-prioritas/comparison.json';
if(!/^[a-f0-9]{7,40}$/.test(base))throw Error('Use a pinned base commit hash.');
const previous=execFileSync('git',['show',base+':apps-script/absensi-dashboard/Akses.gs'],{encoding:'utf8'}),current=fs.readFileSync(new URL('../Akses.gs',import.meta.url),'utf8'),scenarios=[];
for(const size of [22,100,500]){
 const h=loadingHarness(size),c=h.t.c,spy=instrumentLoading(h),fixed=Date.now();c.Date=new Proxy(Date,{get:(t,k)=>k==='now'?()=>fixed:Reflect.get(t,k),construct:(t,a)=>Reflect.construct(t,a.length?a:[fixed])});
 for(const [label,rpc,...args] of [...loadingScenarios,['participant_summary','muatRingkasanPesertaIndex','PRG001']]){
  const runs={};for(const [version,source] of [['before',previous],['after',current]]){vm.runInContext(source,c);spy.reset();const start=performance.now(),result=h.call(h.admin,rpc,...args);runs[version]={ms:Math.round(performance.now()-start),calls:spy.snapshot(),result};}
  assert.deepEqual(runs.after.result,runs.before.result,`${label} ${size}`);delete runs.before.result;delete runs.after.result;scenarios.push({size,label,...runs});
 }
}
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify({base,note:'Synthetic source-call counts and Node CPU milliseconds; not Google latency. All complete responses compared.',scenarios},null,2));
console.log('PASS: '+scenarios.length+' complete before/after responses identical');
