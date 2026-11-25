"""Validate editable DOCX structure, current illustration hashes and optional local pagination."""
import argparse,hashlib,json,re
from pathlib import Path
from zipfile import ZipFile
from lxml import etree
ROOT=Path(__file__).resolve().parent;APP=ROOT.parents[1]
args=argparse.ArgumentParser();args.add_argument('--render');opt=args.parse_args()
content=json.loads((ROOT/'isi_panduan.json').read_text());metadata=json.loads((ROOT/'SUMBER_GAMBAR.json').read_text());ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
word=ROOT/'Panduan_Admin_Pelatihan.docx'
with ZipFile(word) as z:
 for name in z.namelist():
  if name.endswith('.xml'):etree.fromstring(z.read(name))
 xml=etree.fromstring(z.read('word/document.xml'));text=' '.join(xml.xpath('//w:t/text()',namespaces=ns))
 paragraphs=len(xml.findall('.//w:p',ns));tables=len(xml.findall('.//w:tbl',ns));numbered=len(xml.findall('.//w:numPr',ns));images=len([n for n in z.namelist() if n.startswith('word/media/')]);bookmarks={n.get('{'+ns['w']+'}name') for n in xml.findall('.//w:bookmarkStart',ns)}
 assert paragraphs>300 and len(text)>30000 and tables>=8 and numbered>100
 assert {'bab'+str(i) for i in range(1,13)}<=bookmarks
 for ch in content['chapters']:
  assert ch['title'] in text
  for sec in ch['sections']:
   assert sec['title'] in text
   if sec.get('image'):assert (ROOT/'assets'/sec['image']).exists()
 for excluded in ['104 detik','1 menit 44','2,5 menit','31%','7dacfb0','Apps Script']:
  assert excluded not in text,excluded
 assert '**' not in text
for image in metadata['images']:assert hashlib.sha256((ROOT/image['file']).read_bytes()).hexdigest()==image['sha256']
for name,digest in json.loads((APP/'SOURCE_SNAPSHOT.json').read_text())['files'].items():assert hashlib.sha256((APP/name).read_bytes()).hexdigest()==digest
report={'application_source':'7dacfb0','format':'editable .docx','chapters':len(content['chapters']),'sections':sum(len(c['sections']) for c in content['chapters']),'figures_used':json.loads((ROOT/'INDEKS_ISI.json').read_text())['figures'],'native_paragraphs':paragraphs,'native_tables':tables,'native_numbered_steps':numbered,'embedded_image_files':images,'screenshots_captured':len(metadata['images']),'production_source_hashes_unchanged':19,'docx_sha256':hashlib.sha256(word.read_bytes()).hexdigest(),'excludes_performance_history':True}
if opt.render:
 import fitz
 pdf=fitz.open(opt.render);pages={}
 assert len(pdf)==46
 for i,ch in enumerate(content['chapters'],1):
  target=re.sub(r'\s+',' ',f'{i:02d} {ch["title"]}')
  for page in list(pdf)[2:]:
   if target in re.sub(r'\s+',' ',page.get_text()):pages[str(i)]=page.number+1;break
 assert pages==json.loads((ROOT/'halaman_bab.json').read_text())
 for page in pdf:
  assert len(page.get_text().strip())>180
  for block in page.get_text('blocks'):
   assert block[0]>=-1 and block[1]>=-1 and block[2]<=page.rect.width+1 and block[3]<=page.rect.height+1
 report['local_render']={'engine':'LibreOffice, QA only; no PDF delivered','pages':len(pdf),'chapter_page_references_match':True,'no_blank_pages_or_out_of_page_text':True}
(ROOT/'HASIL_PEMERIKSAAN.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
