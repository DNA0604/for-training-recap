// Synthetic backend fixture for the illustrated Admin manual. Never connects to Google.
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
const call=(name,...args)=>h.call(h.admin,name,...args),responses={},edit={},participants={};
for(const [name,args] of [['muatAwalIndex',[]],['muatBerandaIndex',[]],['muatKehadiranIndex',['SES001']],['muatRekapJPProgramIndex',['PRG001']],['muatNilaiPerilakuProgramIndex',['PRG001']],['muatCatatanPerilakuIndex',['SES001']],['muatDaftarIzinIndex',['SES001']],['muatProfilPesertaIndex',[{id_peserta:'PST001',id_program:'PRG001'}]],['muatKelolaProgramIndex',['PRG001']],['muatRingkasanPesertaIndex',['PRG001']],['muatKelolaPengajar',[]],['muatManajemenAksesPanitia',[]],['muatPenghapusanTertundaIndex',[]],['muatDaftarVerifikasiSesiPanitia',[]],['muatPengajuanKoreksiPanitia',[]],['muatVerifikasiSesiPanitia',['SES001']],['muatEvaluasiPanitiaSesi',['SES001']],['muatEvaluasiPesertaSesi',['SES001']],['muatEvaluasiPengajarSesi',['SES001']],['muatStatusRekapPenilaian',[]],['muatBobotNilaiAkhirIndex',['PRG001']],['muatPratinjauLaporanProgram',['PRG001']],['muatMasterPesertaHapusIndex',['',0]]]){
 try{responses[name]=call(name,...args);}catch(e){throw Error(name+': '+e.message);}
}
for(const j of ['','JEN001','JEN003'])participants[j]=call('muatPesertaProgramIndex','PRG001','',0,j);
for(const [type,id] of [['Program','PRG001'],['Sesi','SES001'],['Peserta','PST001']])edit[type]=call('muatEditDataIndex',type,id);
edit['Program|PRG003']=call('muatEditDataIndex','Program','PRG003');
const rows=[{nip:'200001012024011001',nama_pegawai:'Peserta Impor Satu',unit_kerja:'Unit Pengembangan'},{nip:'200001022024011002',nama_pegawai:'Peserta Impor Dua',unit_kerja:'Unit Pengembangan'}];
responses.pratinjauImporPesertaIndex=call('pratinjauImporPesertaIndex','PRG001',rows,'JEN001');
const deletion=call('pratinjauHapusDataIndex','Program','PRG003');
const correction=h.legacy(h.staff,h.correction());responses.muatPengajuanKoreksiPanitia=call('muatPengajuanKoreksiPanitia');
const v=h.call(h.staff,'muatVerifikasiSesiPanitia','SES001');h.call(h.staff,'ajukanVerifikasiSesiPanitia',{id_sesi:'SES001',versi:v.versi,catatan:'Sesi telah diperiksa petugas kelas'});responses.muatVerifikasiSesiPanitia=call('muatVerifikasiSesiPanitia','SES001');responses.muatDaftarVerifikasiSesiPanitia=call('muatDaftarVerifikasiSesiPanitia');
const fixture={html:Object.fromEntries(['Beranda','Index','Pengelolaan','Peserta','Profil','ManajemenAkses'].map(n=>[n,t.c.keluaranAplikasiPanitia_(n,n).content])),loginHtml:t.c.doGet({parameter:{page:'masuk'}}).content,identity:t.c.muatSesiAplikasiPanitia(h.admin.token),session:h.admin,flow:t.startApp(),verificationFlow:t.startVerification(),artwork:t.c.muatIlustrasiLoginPanitia(),responses,participants,edit,deletion,rows,rubrics:{teacher:t.c.aspekEvaluasi_()}};
process.stdout.write(JSON.stringify(plain(fixture)));
