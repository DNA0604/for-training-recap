// Reproducible offline audit. Times are Node/mock CPU times, not Google deployment latency.
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {performance} from 'node:perf_hooks';
import {loadingHarness,instrumentLoading,loadingScenarios} from './support/pemuatan-audit-harness.mjs';
const base=process.argv.find(s=>s.startsWith('--base='))?.slice(7)||'177a606',dest=process.argv.find(s=>s.startsWith('--out='))?.slice(6)||'/tmp/pemuatan-audit/comparison.json';
if(!/^[a-f0-9]{7,40}$/.test(base))throw Error('Use a pinned base commit hash.');
const previous=execFileSync('git',['show',base+':apps-script/absensi-dashboard/Code.gs'],{encoding:'utf8'}),current=fs.readFileSync(new URL('../Code.gs',import.meta.url),'utf8'),out=[];
for(const size of [22,100,500]){
 const h=loadingHarness(size),c=h.t.c,spy=instrumentLoading(h),fixed=Date.now();c.Date=new Proxy(Date,{get(target,key){return key==='now'?()=>fixed:Reflect.get(target,key);},construct(target,args){return Reflect.construct(target,args.length?args:[fixed]);}});
 for(const [label,rpc,...args] of loadingScenarios){
  const runs={};for(const [version,source] of [['before',previous],['after',current]]){vm.runInContext(source,c);spy.reset();const start=performance.now(),result=h.call(h.admin,rpc,...args);runs[version]={ms:Math.round(performance.now()-start),calls:spy.snapshot(),bytes:Buffer.byteLength(JSON.stringify(result)),result};}
  assert.deepEqual(runs.after.result,runs.before.result,label+' '+size+' returned changed data');delete runs.before.result;delete runs.after.result;out.push({size,page:label,...runs});console.log(size,label,`${runs.before.ms} → ${runs.after.ms} ms (mock)`,`${runs.before.calls.formatDate||0} → ${runs.after.calls.formatDate||0} date formats`);
 }
}
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify({base,note:'Synthetic local Node/mock CPU timing; not Google latency. Mixed attendance; identical response assertion per comparison.',scenarios:out},null,2));
