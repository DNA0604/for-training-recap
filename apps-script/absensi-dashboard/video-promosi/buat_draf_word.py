"""Build an editable review document for the written script/storyboard; no film production."""
import json
from pathlib import Path
from docx import Document
from docx.shared import Cm,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
R=Path(__file__).resolve().parent
D=json.loads((R/'NASKAH_STORYBOARD.json').read_text())
doc=Document();sec=doc.sections[0];sec.page_width=Cm(21);sec.page_height=Cm(29.7)
sec.top_margin=Cm(1.8);sec.bottom_margin=Cm(1.8);sec.left_margin=Cm(1.9);sec.right_margin=Cm(1.9)
sec.header_distance=Cm(.7);sec.footer_distance=Cm(.7)
for name in ['Normal','Body Text','Caption']:
 s=doc.styles[name];s.font.name='Arial';s.font.size=Pt(10.5);s.font.color.rgb=RGBColor.from_string('203960');s.paragraph_format.space_after=Pt(6);s.paragraph_format.line_spacing=1.12
for name,size in [('Title',25),('Heading 1',18),('Heading 2',12)]:
 s=doc.styles[name];s.font.name='Arial';s.font.size=Pt(size);s.font.color.rgb=RGBColor.from_string('203960');s.font.bold=True;s.paragraph_format.space_after=Pt(8)
 s.paragraph_format.keep_with_next=True
header=sec.header.paragraphs[0];header.add_run('Monitoring Pelatihan Pegawai • Draf video promosi').font.size=Pt(8)
footer=sec.footer.paragraphs[0];footer.add_run('Draf 0.1 • 13 November 2026  |  ')
r=footer.add_run();f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),'PAGE');r._r.addnext(f)
for run in footer.runs:run.font.size=Pt(8)
doc.core_properties.title='Draf Naskah dan Storyboard Video Promosi';doc.core_properties.subject=D['title'];doc.core_properties.author='Dokumentasi Monitoring Pelatihan Pegawai'
def tc(n):return f'{n//60:02d}:{n%60:02d}'
def p(text,style=None):return doc.add_paragraph(text,style)
def table(headers,rows,widths=None):
 t=doc.add_table(rows=1,cols=len(headers));t.style='Table Grid';t.alignment=WD_TABLE_ALIGNMENT.CENTER
 for c,txt in zip(t.rows[0].cells,headers):
  c.text=txt;shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'203960');c._tc.get_or_add_tcPr().append(shade)
  for run in c.paragraphs[0].runs:run.font.color.rgb=RGBColor(255,255,255);run.font.bold=True
 repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
 for row in rows:
  tr=t.add_row();e=OxmlElement('w:cantSplit');tr._tr.get_or_add_trPr().append(e)
  for c,txt in zip(tr.cells,row):c.text=txt
 for row in t.rows:
  for cell in row.cells:
   for par in cell.paragraphs:
    par.paragraph_format.space_after=Pt(5);par.paragraph_format.space_before=Pt(3)
    for run in par.runs:run.font.size=Pt(9)
 if widths:
  t.autofit=False
  for col,width in zip(t.columns,widths):col.width=Cm(width)
 p('')
logo=R.parent/'panduan/contoh/assets/logo-komdigi.png'
if logo.exists():doc.add_paragraph().add_run().add_picture(str(logo),width=Cm(1.8))
p('Draf Naskah dan Storyboard', 'Title');p(D['title'],'Heading 1');p('Versi '+D['version']+' • '+D['date']);p(D['status'])
p('Dasar konsep','Heading 2');p('Penonton: '+D['audience'])
for goal in D['goals']:p(goal,style='List Bullet')
p(D['tone']);p(D['visual']);p('Durasi kerja: sekitar 4 menit, dalam rentang 3–5 menit yang diminta.');p(D['format_note'])
p('Status dokumen','Heading 2');p('Storyboard ini masih berupa uraian visual dan interaksi. Belum ada animatic, rekaman suara, musik terpilih atau video final.')
doc.add_page_break();p('Alur dan contoh yang digunakan','Heading 1')
table(['Waktu','Bagian'],[(tc(s['start'])+'–'+tc(s['end']),s['title']) for s in D['scenes']],[3,13.8])
p('Kasus yang konsisten','Heading 2');p(' → '.join([D['case']['program'],D['case']['level'],D['case']['session']]))
for person in D['case']['participants']:p(person,'List Bullet')
p(D['case']['continuity']);p('Ritme dan suara','Heading 2');p(D['sound_note'])
words=sum(s['narration_words'] for s in D['scenes'])
p(f'Narasi berjumlah sekitar {words} kata. Pada 120–130 kata per menit, perkiraan pembacaan 193–210 detik; sisa alokasi untuk jeda, tampilan UI dan transisi. Waktu adegan akan diselaraskan setelah rekaman percobaan.')
for s in D['scenes']:
 doc.add_page_break();p(f'{s["number"]:02d}. {s["title"]}','Heading 1');p(f'{tc(s["start"])}–{tc(s["end"])} • {s["duration_seconds"]} detik • {s["narration_words"]} kata narasi')
 p(s['purpose']);p('Narasi','Heading 2');p(s['narration']);p('Urutan visual dan teks layar','Heading 2')
 table(['Waktu','Visual dan interaksi','Teks layar'],[(tc(sh['start'])+'–'+tc(sh['end']),sh['visual'],sh['screen_text']) for sh in s['shots']],[2.1,9.8,4.9])
 p('Transisi','Heading 2');p(s['transition']);p('Catatan produksi — tidak dibacakan','Heading 2');p(s['production_note'])
doc.save(R/'Draf_Naskah_Storyboard.docx');print('Built editable script/storyboard Word:',len(D['scenes']),'scenes')
