import fs from 'node:fs';import vm from 'node:vm';import {execFileSync} from 'node:child_process';
import {rekapHarness,plain} from './rekap-evaluasi-harness.mjs';export {plain};
export function reportHarness(){
 const h=rekapHarness(),c=h.t.c;vm.runInContext(fs.readFileSync(new URL('../../LaporanTampilan.gs',import.meta.url),'utf8'),c,{filename:'LaporanTampilan.gs'});
 const blob=(data,mime='',name='')=>{const bytes=Buffer.isBuffer(data)?data:typeof data==='string'?Buffer.from(data):Buffer.from(data||[]);return {getBytes:()=>Array.from(bytes),getDataAsString:(encoding='UTF-8')=>bytes.toString(encoding==='ISO-8859-1'?'latin1':'utf8'),getName:()=>name,setName(n){name=n;return this;},setContentType(t){mime=t;return this;}};};
 c.Utilities.newBlob=blob;c.Utilities.base64Decode=s=>Array.from(Buffer.from(s,'base64'));c.Utilities.base64Encode=b=>Buffer.from(b).toString('base64');
 c.Utilities.zip=(files,name)=>blob(execFileSync('python',['-c',`import json,sys,zipfile,io,base64
b=io.BytesIO()
with zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:
 for n,v in json.load(sys.stdin):z.writestr(n,base64.b64decode(v))
sys.stdout.buffer.write(b.getvalue())`],{input:JSON.stringify(files.map(f=>[f.getName(),Buffer.from(f.getBytes()).toString('base64')])),maxBuffer:16*1024*1024}),'application/zip',name);
 const run=fn=>{const old=c.konteksSesiPanitia_;c.konteksSesiPanitia_=Object.assign(c.bacaSesiPanitia_(h.admin.token),{token:h.admin.token,method:'buatPDFLaporanProgram',args:['PRG001']});try{return fn();}finally{c.konteksSesiPanitia_=old;}};
 const report=()=>run(()=>c.dataLaporanProgram_('PRG001'));
 return {...h,blob,report,run,renderer:c};
}
