"""Check the editable teacher manual, role evidence and optional local pagination."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile
from lxml import etree

ROOT = Path(__file__).resolve().parent
APP = ROOT.parents[1]
ADMIN_HASH = '92ccd05a94c19f8ea02cf072cbe461b7cf45d29b6c76dc4c0dd577dd498998f0'
parser = argparse.ArgumentParser()
parser.add_argument('--render', help='Temporary local QA PDF; never a deliverable')
opt = parser.parse_args()
content = json.loads((ROOT / 'isi_panduan.json').read_text())
metadata = json.loads((ROOT / 'SUMBER_GAMBAR.json').read_text())
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
word = ROOT / 'Panduan_Pengajar.docx'
with ZipFile(word) as archive:
    for name in archive.namelist():
        if name.endswith('.xml'):
            etree.fromstring(archive.read(name))
    xml = etree.fromstring(archive.read('word/document.xml'))
    text = ' '.join(xml.xpath('//w:t/text()', namespaces=ns))
    paragraphs = len(xml.findall('.//w:p', ns))
    tables = len(xml.findall('.//w:tbl', ns))
    numbered = len(xml.findall('.//w:numPr', ns))
    images = len([name for name in archive.namelist() if name.startswith('word/media/')])
    bookmarks = {node.get('{'+ns['w']+'}name') for node in xml.findall('.//w:bookmarkStart', ns)}
    fields = xml.xpath('//w:instrText/text()', namespaces=ns)
    assert paragraphs > 280 and len(text) > 18000 and tables >= 6 and numbered > 70
    assert {'bab'+str(i) for i in range(1, 7)} <= bookmarks
    assert sum('PAGEREF' in field for field in fields) == 6
    for chapter in content['chapters']:
        assert chapter['title'] in text
        for section in chapter['sections']:
            assert section['title'] in text
            if section.get('image'):
                assert (ROOT / 'assets' / section['image']).exists()
    for excluded in ['104 detik', '1 menit 44', '2,5 menit', '31%', '7dacfb0',
                     'Apps Script', 'urutan kerja Admin', 'urutan kerja Petugas Kelas', '**']:
        assert excluded not in text, excluded
    for expected in ['Pengajar', 'Simpan Halaman', 'empat jam', 'enam aspek',
                     'Nilai gabungan Pengajar–Panitia tidak tersedia pada akses ini',
                     'Perpindahan halaman tidak menyimpan isian secara otomatis',
                     'Muat Ulang saja tidak otomatis mengesahkan kembali nilai lama']:
        assert expected in text, expected

for illustration in metadata['images']:
    assert hashlib.sha256((ROOT / illustration['file']).read_bytes()).hexdigest() == illustration['sha256']
assert metadata['role'] == 'pengajar'
assert len(metadata['permissions_checked']) == 11
assert all(message.startswith('AKSES_DITOLAK:') for message in metadata['permissions_checked'].values())
source = json.loads((APP / 'SOURCE_SNAPSHOT.json').read_text())['files']
for name, digest in source.items():
    assert hashlib.sha256((APP / name).read_bytes()).hexdigest() == digest
assert hashlib.sha256((ROOT.parent / 'admin' / 'Panduan_Admin_Pelatihan.docx').read_bytes()).hexdigest() == ADMIN_HASH
assert hashlib.sha256((ROOT.parent / 'petugas' / 'Panduan_Petugas_Kelas.docx').read_bytes()).hexdigest() == '39d08cd351153e93f52d17fac1441439b731b85ddfa075ee7a042155d4d28cdc'
assert not list(ROOT.rglob('*.pdf')), 'Final delivery must remain Word only'
report = {
    'application_source': '7dacfb0', 'format': 'editable .docx',
    'chapters': len(content['chapters']),
    'sections': sum(len(chapter['sections']) for chapter in content['chapters']),
    'figures_used': json.loads((ROOT / 'INDEKS_ISI.json').read_text())['figures'],
    'native_paragraphs': paragraphs, 'native_tables': tables,
    'native_numbered_steps': numbered, 'embedded_image_files': images,
    'screenshots_captured': len(metadata['images']),
    'restricted_methods_and_other_session_denied': len(metadata['permissions_checked']),
    'production_source_hashes_unchanged': len(source),
    'accepted_admin_docx_unchanged': True, 'previous_petugas_docx_unchanged': True,
    'docx_sha256': hashlib.sha256(word.read_bytes()).hexdigest(),
    'excludes_performance_history': True,
}
if opt.render:
    import fitz
    pdf = fitz.open(opt.render)
    assert len(pdf) == 24
    pages = {}
    for index, chapter in enumerate(content['chapters'], 1):
        target = re.sub(r'\s+', ' ', f'{index:02d} {chapter["title"]}')
        for page in list(pdf)[2:]:
            if target in re.sub(r'\s+', ' ', page.get_text()):
                pages[str(index)] = page.number + 1
                break
    assert pages == json.loads((ROOT / 'halaman_bab.json').read_text())
    assert 'urutan kerja Pengajar' in pdf[1].get_text()
    for page in pdf:
        assert len(page.get_text().strip()) > 180
        for block in page.get_text('blocks'):
            assert block[0] >= -1 and block[1] >= -1
            assert block[2] <= page.rect.width + 1 and block[3] <= page.rect.height + 1
    report['local_render'] = {
        'engine': 'LibreOffice, QA only; no PDF delivered', 'pages': len(pdf),
        'chapter_page_references_match': True,
        'no_blank_pages_or_out_of_page_text': True,
    }
(ROOT / 'HASIL_PEMERIKSAAN.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(report, ensure_ascii=False))
