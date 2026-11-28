// Synthetic backend fixture for the illustrated Petugas manual. Never connects to Google.
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
h.note();h.fill();
const attendanceVersion=h.call(h.staff,'muatKehadiranIndex','SES001').peserta.find(p=>p.id_keikutsertaan==='KST001').versi;
h.call(h.staff,'simpanIzinIndex',{versi:attendanceVersion,id_sesi:'SES001',id_kehadiran:'KHD001',mulai:'2026-10-20T09:00',selesai:'2026-10-20T09:30',alasan:'Keperluan kedinasan selama sesi',dasar:'Pemberitahuan peserta kepada Petugas'});
const call=(name,...args)=>h.call(h.staff,name,...args),responses={},participants={};
for(const [name,args] of [['muatAwalIndex',[]],['muatBerandaIndex',[]],['muatKehadiranIndex',['SES001']],['muatRekapJPProgramIndex',['PRG001']],['muatNilaiPerilakuProgramIndex',['PRG001']],['muatCatatanPerilakuIndex',['SES001']],['muatDaftarIzinIndex',['SES001']],['muatProfilPesertaIndex',[{id_peserta:'PST001',id_program:'PRG001'}]],['muatDaftarVerifikasiSesiPanitia',[]],['muatPengajuanKoreksiPanitia',[]],['muatEvaluasiPanitiaSesi',['SES001']]])responses[name]=call(name,...args);
for(const j of ['','JEN001'])participants[j]=call('muatPesertaProgramIndex','PRG001','',0,j);
const verification={initial:call('muatVerifikasiSesiPanitia','SES001')},lists={initial:call('muatDaftarVerifikasiSesiPanitia')};
const submitted=call('ajukanVerifikasiSesiPanitia',{id_sesi:'SES001',versi:verification.initial.versi,catatan:'Kehadiran dan catatan sesi telah diperiksa. Mohon verifikasi Admin.'});verification.pending=call('muatVerifikasiSesiPanitia','SES001');lists.pending=call('muatDaftarVerifikasiSesiPanitia');
h.call(h.admin,'putuskanVerifikasiSesiPanitia',{id:submitted.id,keputusan:'tolak',alasan:'Lengkapi keterangan peserta yang belum tercatat, lalu ajukan kembali.'});verification.rejected=call('muatVerifikasiSesiPanitia','SES001');lists.rejected=call('muatDaftarVerifikasiSesiPanitia');
const permissions={};for(const [name,args] of [['hitungJPSesiIndex',['SES001']],['muatKelolaProgramIndex',['PRG001']],['muatManajemenAksesPanitia',[]],['muatEvaluasiPengajarSesi',['SES001']],['muatEvaluasiPesertaSesi',['SES001']],['muatBobotNilaiAkhirIndex',['PRG001']]]){try{call(name,...args);permissions[name]='unexpectedly_allowed';}catch(e){permissions[name]=e.message;}}
if(Object.values(permissions).some(v=>v==='unexpectedly_allowed'))throw Error('Admin-only method available to staff');
const scope=responses.muatAwalIndex.data;if(scope.program.some(p=>p.id_program!=='PRG001')||scope.jenjang.some(j=>j.id!=='JEN001'))throw Error('Fixture scope leaked');
const fixture={html:Object.fromEntries(['Beranda','Index','Peserta','Profil'].map(n=>[n,t.c.keluaranAplikasiPanitia_(n,n).content])),loginHtml:t.c.doGet({parameter:{page:'masuk'}}).content,identity:t.c.muatSesiAplikasiPanitia(h.staff.token),session:h.staff,flow:t.startApp(),verificationFlow:t.startVerification(),artwork:t.c.muatIlustrasiLoginPanitia(),responses,participants,verification,lists,permissions};
process.stdout.write(JSON.stringify(plain(fixture)));
