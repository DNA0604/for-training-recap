// Synthetic backend fixture for the illustrated Pengajar manual. Never connects to Google.
import {nilaiAkhirHarness} from '../../tests/support/nilai-akhir-harness.mjs';
import {plain} from '../../tests/support/sesi-harness.mjs';
const h=nilaiAkhirHarness(),t=h.t;
t.h.patch('Program','PRG001','id_program',{nama_program:'Pelatihan Teknis AI Agent',kategori_pelatihan:'Teknis',status_program:'selesai'});
t.h.patch('Program','PRG002','id_program',{nama_program:'Pelatihan Kepemimpinan',kategori_pelatihan:'Manajerial'});
t.h.patch('Sesi','SES001','id_sesi',{nama_sesi:'Pengenalan AI Agent'});t.h.patch('Sesi','SES004','id_sesi',{nama_sesi:'Praktik AI Agent'});t.h.patch('Sesi','SES002','id_sesi',{nama_sesi:'Kerja Sama Tim'});t.h.patch('Sesi','SES003','id_sesi',{nama_sesi:'Pengayaan AI Agent'});
t.h.patch('Jenjang','JEN001','id_jenjang',{nama_jenjang:'Dasar'});t.h.patch('Jenjang','JEN003','id_jenjang',{nama_jenjang:'Lanjutan'});
t.h.patch('Peserta','PST001','id_peserta',{nama_pegawai:'Peserta Contoh A',unit_kerja:'Unit Pengembangan'});t.h.patch('Peserta','PST002','id_peserta',{nama_pegawai:'Peserta Contoh B',unit_kerja:'Unit Pelayanan'});
h.append('Program',{...t.h.records('Program')[0],id_program:'PRG003',nama_program:'Program Contoh Cadangan',status_program:'draft'});h.append('Jenjang',{id_jenjang:'JEN004',id_program:'PRG003',nama_jenjang:'Umum'});
for(let i=3;i<=5;i++){h.append('Peserta',{id_peserta:'DOC-P-00'+i,nama_pegawai:'Peserta Contoh '+String.fromCharCode(64+i),nip:'19900101202001'+String(i).padStart(4,'0'),unit_kerja:'Unit Pengembangan'});h.append('Keikutsertaan',{id_keikutsertaan:'DOC-K-00'+i,id_peserta:'DOC-P-00'+i,id_program:'PRG001',id_jenjang:'JEN001',status_keikutsertaan:'terdaftar',unit_kerja_saat_pelatihan:'Unit Pengembangan'});}
h.note();
const call=(name,...args)=>h.call(h.teacher,name,...args),responses={},participants={};
for(const [name,args] of [['muatAwalIndex',[]],['muatBerandaIndex',[]],['muatKehadiranIndex',['SES001']],['muatRekapJPProgramIndex',['PRG001']],['muatNilaiPerilakuProgramIndex',['PRG001']],['muatCatatanPerilakuIndex',['SES001']],['muatDaftarIzinIndex',['SES001']],['muatProfilPesertaIndex',[{id_peserta:'PST001',id_program:'PRG001'}]]])responses[name]=call(name,...args);
for(const j of ['','JEN001'])participants[j]=call('muatPesertaProgramIndex','PRG001','',0,j);
const evaluation={initial:call('muatEvaluasiPesertaSesi','SES001')};
const saved=call('simpanEvaluasiPesertaSesi',h.payload());evaluation.saved=call('muatEvaluasiPesertaSesi','SES001');
const updated=call('simpanEvaluasiPesertaSesi',h.payload({id_permintaan:'manual_teacher_update_000001',nilai:[{id_keikutsertaan:'KST001',versi:evaluation.saved.peserta[0].penilaian.versi,skor:{keaktifan:5,kedisiplinan:5,kerapian:4,kesopanan:5,kreativitas:4,kerja_sama:4},catatan:'Aktif berdiskusi dan membantu kelompok.'}]}));evaluation.updated=call('muatEvaluasiPesertaSesi','SES001');
t.h.patch('Keikutsertaan','KST001','id_keikutsertaan',{unit_kerja_saat_pelatihan:'Unit Pengembangan (diperbarui)'});evaluation.stale=call('muatEvaluasiPesertaSesi','SES001');
for(let i=6;i<=22;i++){h.append('Peserta',{id_peserta:'DOC-P-'+String(i).padStart(3,'0'),nama_pegawai:'Peserta Contoh '+String(i).padStart(2,'0'),nip:'19900101202001'+String(i).padStart(4,'0'),unit_kerja:'Unit Pengembangan'});h.append('Keikutsertaan',{id_keikutsertaan:'DOC-K-'+String(i).padStart(3,'0'),id_peserta:'DOC-P-'+String(i).padStart(3,'0'),id_program:'PRG001',id_jenjang:'JEN001',status_keikutsertaan:'terdaftar',unit_kerja_saat_pelatihan:'Unit Pengembangan'});}
evaluation.many=call('muatEvaluasiPesertaSesi','SES001');
const permissions={};for(const [name,args] of [['hitungJPSesiIndex',['SES001']],['muatKelolaProgramIndex',['PRG001']],['muatManajemenAksesPanitia',[]],['muatEvaluasiPengajarSesi',['SES001']],['muatEvaluasiPanitiaSesi',['SES001']],['muatBobotNilaiAkhirIndex',['PRG001']],['terbitkanQRAbsensiDariGenerator',['SES001','datang',5]],['simpanKoreksiIndex',[{}]],['simpanCatatanPerilakuIndex',[{}]],['muatVerifikasiSesiPanitia',['SES001']],['muatEvaluasiPesertaSesi',['SES004']]]){try{call(name,...args);permissions[name]='unexpectedly_allowed';}catch(e){permissions[name]=e.message;}}
if(Object.values(permissions).some(v=>v==='unexpectedly_allowed'))throw Error('Restricted method available to teacher');
const scope=responses.muatAwalIndex.data;if(scope.program.some(p=>p.id_program!=='PRG001')||scope.jenjang.some(j=>j.id!=='JEN001')||scope.sesi.some(s=>s.id_sesi!=='SES001'))throw Error('Fixture scope leaked');
if(responses.muatRekapJPProgramIndex.nilai_akhir.tersedia!==false)throw Error('Combined grade leaked');
const fixture={html:Object.fromEntries(['Beranda','Index','Peserta','Profil'].map(n=>[n,t.c.keluaranAplikasiPanitia_(n,n).content])),loginHtml:t.c.doGet({parameter:{page:'masuk'}}).content,identity:t.c.muatSesiAplikasiPanitia(h.teacher.token),session:h.teacher,flow:t.startApp(),verificationFlow:t.startVerification(),artwork:t.c.muatIlustrasiLoginPanitia(),responses,participants,evaluation,saved,updated,permissions};
process.stdout.write(JSON.stringify(plain(fixture)));
