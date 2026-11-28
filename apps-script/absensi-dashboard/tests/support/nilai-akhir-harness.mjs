import assert from 'node:assert/strict';
import {rekapHarness} from './rekap-evaluasi-harness.mjs';
export function nilaiAkhirHarness(h=rekapHarness()){
 h.t.h.patch('Sesi','SES004','id_sesi',{nama_sesi:'Praktik lanjutan',jam_selesai:'12:00'});h.append('Kehadiran',{...h.t.h.records('Kehadiran').find(r=>r.id_kehadiran==='KHD001'),id_kehadiran:'KHD004',id_sesi:'SES004',waktu_pulang:h.t.h.date('2026-10-20T12:00:00')});let serial=0;
 function teacher(sid='SES001',score=5){const actor=sid==='SES001'?h.teacher:h.teacher2,v=h.call(actor,'muatEvaluasiPesertaSesi',sid);return h.call(actor,'simpanEvaluasiPesertaSesi',{id_sesi:sid,versi_sumber:v.versi_sumber,id_permintaan:'akhir_teacher_'+String(++serial).padStart(9,'0'),nilai:[{id_keikutsertaan:'KST001',versi:v.peserta[0].penilaian?.versi||'',skor:Object.fromEntries(v.aspek.map((a,i)=>[a.id,Array.isArray(score)?score[i]:score])),catatan:'Penilaian sesi'}]});}
 function staff(sid='SES001',score=4){const v=h.call(h.staff,'muatEvaluasiPanitiaSesi',sid);return h.call(h.staff,'simpanEvaluasiPanitiaSesi',{id_sesi:sid,rubrik:v.rubrik,versi_sumber:v.versi_sumber,id_permintaan:'akhir_staff_'+String(++serial).padStart(9,'0'),nilai:[{id_keikutsertaan:'KST001',versi:v.peserta[0].penilaian?.versi||'',skor:Object.fromEntries(v.aspek.map((a,i)=>[a.id,Array.isArray(score)?score[i]:score])),catatan:'Penilaian Panitia'}]});}
 const result=(actor=h.admin)=>h.call(actor,'muatRekapJPProgramIndex','PRG001');
 const row=(actor=h.admin)=>{const r=result(actor);assert.equal(r.nilai_akhir.sukses,true,r.nilai_akhir.pesan);return r.peserta.find(p=>p.id_keikutsertaan==='KST001').nilai_akhir;};
 const fill=()=>{teacher('SES001',5);staff('SES001',4);teacher('SES004',3);staff('SES004',5);};
 function absent(status='sakit',sid='SES004'){h.t.h.patch('Kehadiran',sid==='SES004'?'KHD004':'KHD001','id_kehadiran',{waktu_datang:'',waktu_pulang:'',waktu_datang_terverifikasi:'',waktu_pulang_terverifikasi:'',metode_input:'manual_status_v1',status_kehadiran:'manual_'+status,status_validasi:'terverifikasi'});}
 const weights=()=>h.call(h.admin,'muatBobotNilaiAkhirIndex','PRG001');
 const saveWeights=(patch={})=>h.call(h.admin,'simpanBobotNilaiAkhirIndex',{id_program:'PRG001',pengajar:70,panitia:30,versi:weights().aturan.versi,alasan:'Ketentuan program uji',id_permintaan:'akhir_weights_request_000001',...patch});
 return {...h,gradeTeacher:teacher,gradePanitia:staff,result,row,fill,absent,weights,saveWeights};
}
