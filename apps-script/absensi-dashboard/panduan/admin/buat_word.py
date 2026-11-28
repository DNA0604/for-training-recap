"""Build an editable Admin user manual. Screenshots are illustrations, all instructions remain Word text."""
import json,re
from pathlib import Path
from docx import Document
from docx.shared import Cm,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT,WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image
ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/'isi_panduan.json').read_text())
PAGES=json.loads((ROOT/'halaman_bab.json').read_text()) if (ROOT/'halaman_bab.json').exists() else {}
NAVY='203960';MUTED='5B6C82';PALE='F1F5FA';WHITE='FFFFFF'
doc=Document();section=doc.sections[0];section.page_width=Cm(21);section.page_height=Cm(29.7);section.top_margin=Cm(1.8);section.bottom_margin=Cm(1.7);section.left_margin=Cm(1.9);section.right_margin=Cm(1.9);section.header_distance=Cm(.65);section.footer_distance=Cm(.65);section.different_first_page_header_footer=True
for n in ['Normal','Body Text','List Paragraph','Caption']:
 st=doc.styles[n];st.font.name='Arial';st.font.size=Pt(10.5);st.font.color.rgb=RGBColor.from_string(NAVY)
 st.paragraph_format.line_spacing=1.12;st.paragraph_format.space_after=Pt(5)
 lang=OxmlElement('w:lang');lang.set(qn('w:val'),'id-ID');st.element.get_or_add_rPr().append(lang)
for n,size in [('Title',31),('Heading 1',18),('Heading 2',13.5),('Heading 3',11.5)]:
 st=doc.styles[n];st.font.name='Arial';st.font.size=Pt(size);st.font.color.rgb=RGBColor.from_string(NAVY);st.font.bold=True;st.paragraph_format.keep_with_next=True;st.paragraph_format.space_before=Pt(0);st.paragraph_format.space_after=Pt(8)
doc.styles['Caption'].font.size=Pt(8);doc.styles['Caption'].font.color.rgb=RGBColor.from_string(MUTED);doc.styles['Caption'].paragraph_format.space_after=Pt(7)
doc.core_properties.title=DATA['title'];doc.core_properties.subject='Panduan penggunaan Monitoring Pelatihan Pegawai untuk Admin Pelatihan';doc.core_properties.author='Dokumentasi Aplikasi Pelatihan';doc.core_properties.keywords='Admin Pelatihan, panduan, Komdigi';doc.core_properties.comments='Teks, judul, daftar dan tabel dapat disunting di Microsoft Word. Gambar merupakan ilustrasi antarmuka.'
settings=doc.settings.element;update=OxmlElement('w:updateFields');update.set(qn('w:val'),'true');settings.append(update)
# Native decimal numbering, restarted for every instruction block.
numbering=doc.part.numbering_part.element
abstract=OxmlElement('w:abstractNum');abstract.set(qn('w:abstractNumId'),'92');lvl=OxmlElement('w:lvl');lvl.set(qn('w:ilvl'),'0')
for tag,val in [('start','1'),('numFmt','decimal'),('lvlText','%1.'),('lvlJc','left')]:
 e=OxmlElement('w:'+tag);e.set(qn('w:val'),val);lvl.append(e)
ppr=OxmlElement('w:pPr');ind=OxmlElement('w:ind');ind.set(qn('w:left'),'340');ind.set(qn('w:hanging'),'300');ppr.append(ind);lvl.append(ppr);abstract.append(lvl);numbering.append(abstract);next_num=100

def rich(p,text,size=None,color=None):
 for i,part in enumerate(re.split(r'\*\*(.*?)\*\*',text)):
  r=p.add_run(part);r.bold=True if i%2 else None
  if size:r.font.size=Pt(size)
  if color:r.font.color.rgb=RGBColor.from_string(color)
 return p

def para(text='',style=None,size=None,color=None):return rich(doc.add_paragraph(style=style),text,size,color)

def field(p,instruction,cached='1'):
 r=p.add_run();begin=OxmlElement('w:fldChar');begin.set(qn('w:fldCharType'),'begin');r._r.append(begin)
 r=p.add_run();code=OxmlElement('w:instrText');code.set(qn('xml:space'),'preserve');code.text=instruction;r._r.append(code)
 r=p.add_run();sep=OxmlElement('w:fldChar');sep.set(qn('w:fldCharType'),'separate');r._r.append(sep);p.add_run(str(cached))
 r=p.add_run();end=OxmlElement('w:fldChar');end.set(qn('w:fldCharType'),'end');r._r.append(end)

def shade(cell,color):
 tcpr=cell._tc.get_or_add_tcPr();e=OxmlElement('w:shd');e.set(qn('w:fill'),color);tcpr.append(e)

def table(headers,rows):
 t=doc.add_table(rows=1,cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.style='Table Grid'
 for cell,text in zip(t.rows[0].cells,headers):
  shade(cell,NAVY);p=cell.paragraphs[0];rich(p,text,9.5,WHITE);p.runs[0].bold=True
 repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
 for i,row in enumerate(rows):
  cells=t.add_row().cells
  for cell,text in zip(cells,row):
   if i%2==0:shade(cell,'F6F8FB')
   p=cell.paragraphs[0];p.paragraph_format.space_after=Pt(4);p.paragraph_format.space_before=Pt(3);rich(p,text,9.5)
  trpr=t.rows[-1]._tr.get_or_add_trPr();e=OxmlElement('w:cantSplit');trpr.append(e)
 doc.add_paragraph().paragraph_format.space_after=Pt(0)
 return t

def steps(items):
 global next_num
 if not items:return
 num=OxmlElement('w:num');num.set(qn('w:numId'),str(next_num));aid=OxmlElement('w:abstractNumId');aid.set(qn('w:val'),'92');num.append(aid);override=OxmlElement('w:lvlOverride');override.set(qn('w:ilvl'),'0');start=OxmlElement('w:startOverride');start.set(qn('w:val'),'1');override.append(start);num.append(override);numbering.append(num)
 for item in items:
  p=doc.add_paragraph(style='List Paragraph');rich(p,item);pp=p._p.get_or_add_pPr();np=OxmlElement('w:numPr');lv=OxmlElement('w:ilvl');lv.set(qn('w:val'),'0');ni=OxmlElement('w:numId');ni.set(qn('w:val'),str(next_num));np.append(lv);np.append(ni);pp.append(np)
 next_num+=1

def note(label,text):
 if not text:return
 p=para('**'+label+'** '+text,size=9.5);pp=p._p.get_or_add_pPr();sh=OxmlElement('w:shd');sh.set(qn('w:fill'),PALE);pp.append(sh);p.paragraph_format.space_before=Pt(5);p.paragraph_format.space_after=Pt(6)

def add_image(filename,number,caption,has_table=False):
 path=ROOT/'assets'/filename
 if not path.exists():raise FileNotFoundError(path)
 w,h=Image.open(path).size;maxw=16.7;maxh=14.0 if has_table else 16.0;scale=min(maxw/w,maxh/h);width=w*scale;height=h*scale
 p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True;p.paragraph_format.space_before=Pt(3);p.paragraph_format.space_after=Pt(3)
 pic=p.add_run().add_picture(str(path),width=Cm(width),height=Cm(height));pic._inline.docPr.set('descr',caption)
 p=para(f'Gambar {number}. {caption}',style='Caption');p.alignment=WD_ALIGN_PARAGRAPH.CENTER

# Header/footer use native Word elements, not flattened artwork.
header=section.header.paragraphs[0];header.paragraph_format.space_after=Pt(0);r=header.add_run();r.add_picture(str(ROOT.parent/'contoh/assets/logo-komdigi.png'),width=Cm(.65));rich(header,'  Pusat Pengembangan Aparatur Komdigi',8.5);header.add_run('  |  Admin Pelatihan').font.size=Pt(8)
footer=section.footer.paragraphs[0];footer.paragraph_format.space_after=Pt(0);rich(footer,'Monitoring Pelatihan Pegawai  •  Versi '+DATA['version']+'\t',8,MUTED);footer.paragraph_format.tab_stops.add_tab_stop(Cm(14.4),WD_ALIGN_PARAGRAPH.RIGHT);field(footer,' PAGE ');footer.add_run(' / ');field(footer,' NUMPAGES ')
# Cover.
p=doc.add_paragraph();p.paragraph_format.space_before=Pt(38);p.add_run().add_picture(str(ROOT.parent/'contoh/assets/logo-komdigi.png'),width=Cm(2.5))
para('PUSAT PENGEMBANGAN APARATUR KOMDIGI',size=10,color=MUTED)
p=para('Panduan\nAdmin Pelatihan',style='Title');p.paragraph_format.space_before=Pt(46);p.paragraph_format.space_after=Pt(15)
para('Monitoring Pelatihan Pegawai',size=16)
para('Petunjuk penggunaan bergambar untuk persiapan program,\npelaksanaan sesi, evaluasi dan rekap hasil.',size=11.5,color=MUTED)
p=para('Versi '+DATA['version']+'  •  '+DATA['date'],size=11);p.paragraph_format.space_before=Pt(54)
para('Dokumen Word yang dapat disunting',size=10,color=MUTED)
doc.add_page_break()
# Native editable table of contents with bookmark references and cached page numbers.
para('Daftar isi',style='Heading 1')
para('Panduan ini disusun menurut urutan kerja Admin. Nama menu dan tombol dicetak tebal. Data pada gambar merupakan contoh; jumlah, nama dan hasil pada aplikasi Anda mengikuti program yang dipilih.',size=10.5)
t=doc.add_table(rows=0,cols=2);t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False;t.columns[0].width=Cm(15.1);t.columns[1].width=Cm(1.5)
for i,ch in enumerate(DATA['chapters'],1):
 cells=t.add_row().cells;left=cells[0].paragraphs[0];rich(left,f'{i:02d}  {ch["title"]}',10.5);left.paragraph_format.space_after=Pt(10)
 right=cells[1].paragraphs[0];right.alignment=WD_ALIGN_PARAGRAPH.RIGHT;field(right,' PAGEREF bab'+str(i)+' \\h ',PAGES.get(str(i),'—'))
para('Cara membaca petunjuk',style='Heading 2')
para('Baca tujuan dan kondisi awal, ikuti langkah bernomor, lalu cocokkan dengan gambar dan hasil yang diharapkan. Beberapa gambar memperlihatkan bagian formulir; gulir layar bila isian atau tombol berikutnya belum terlihat.')
note('Acuan akses.', 'Panduan ini untuk Admin Pelatihan. Petugas Kelas dan Pengajar mempunyai cakupan serta formulir yang berbeda. Penanda angka yang ditambahkan pada gambar merupakan penunjuk panduan, bukan tombol aplikasi.')
figure=0;mapping=[]
for chapter_id,ch in enumerate(DATA['chapters'],1):
 for section_id,sec in enumerate(ch['sections'],1):
  doc.add_page_break()
  if section_id==1:
   p=para(f'{chapter_id:02d}  {ch["title"]}',style='Heading 1');start=OxmlElement('w:bookmarkStart');start.set(qn('w:id'),str(chapter_id));start.set(qn('w:name'),'bab'+str(chapter_id));p._p.insert(1 if p._p.pPr is not None else 0,start);end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),str(chapter_id));p._p.append(end)
  para(f'{chapter_id}.{section_id}  {sec["title"]}',style='Heading 2')
  para(sec['intro'])
  if sec.get('layout')=='menu':
   t=doc.add_table(rows=1,cols=2);t.autofit=False;t.columns[0].width=Cm(4.8);t.columns[1].width=Cm(11.6)
   p=t.cell(0,0).paragraphs[0];p.add_run().add_picture(str(ROOT/'assets'/sec['image']),height=Cm(18.2));figure+=1
   p=t.cell(0,1).paragraphs[0];rich(p,'Menu utama',11)
   for item in sec['steps']:rich(t.cell(0,1).add_paragraph(),item)
   para(f'Gambar {figure}. Menu navigasi Admin Pelatihan.',style='Caption')
  else:
   steps(sec['steps'])
   if sec.get('image'):
    figure+=1;caption=next((x['caption'] for x in json.loads((ROOT/'SUMBER_GAMBAR.json').read_text())['images'] if x['file']=='assets/'+sec['image']),sec['title'])
    add_image(sec['image'],figure,caption,bool(sec.get('table')))
  if sec.get('table'):table(sec['table']['headers'],sec['table']['rows'])
  note('Hasil yang diharapkan.',sec['result']);note('Perhatikan.',sec['note'])
  mapping.append({'chapter':chapter_id,'section':section_id,'title':sec['title'],'image':sec.get('image')})
doc.save(ROOT/'Panduan_Admin_Pelatihan.docx')
(ROOT/'INDEKS_ISI.json').write_text(json.dumps({'chapters':len(DATA['chapters']),'sections':len(mapping),'figures':figure,'items':mapping},ensure_ascii=False,indent=2)+'\n')
print('Built editable DOCX:',len(DATA['chapters']),'chapters,',len(mapping),'sections,',figure,'figures')
