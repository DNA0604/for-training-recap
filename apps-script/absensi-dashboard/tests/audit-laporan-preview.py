"""Offline PDF pagination check; requires PyMuPDF. These PDFs use LibreOffice, not Google."""
import json
from pathlib import Path
import fitz
folder=Path(__file__).resolve().parents[1]/'previews/laporan-template'
for count in [2,13]:
    prefix=folder/f'Laporan-Contoh-{count}-Peserta'
    meta=json.loads(prefix.with_suffix('.json').read_text())
    pdf=fitz.open(prefix.with_suffix('.pdf'))
    assert len(pdf)==meta['pages'],(count,len(pdf),meta['pages'])
    for entry in meta['toc']:
        assert entry['text'] in ' '.join(pdf[entry['page']].get_text().split()),entry
    orientations=set()
    for index,page in enumerate(pdf):
        orientations.add('landscape' if page.rect.width>page.rect.height else 'portrait')
        text=' '.join(page.get_text().split())
        if index:
            assert f'| {index}' in text,(count,index,'footer')
            spans=[s for b in page.get_text('dict')['blocks'] for line in b.get('lines',[]) for s in line['spans']]
            assert any(85<s['bbox'][1]<page.rect.height-70 for s in spans),(count,index,'empty body')
            assert all(s['bbox'][2]<page.rect.width-25 for s in spans),(count,index,'horizontal overflow')
    assert orientations=={'portrait','landscape'}
    page=pdf[2]
    narrative=next(b for b in page.get_text('dict')['blocks'] if any('Program Pelatihan Teknis AI Agent merupakan' in ''.join(s['text'] for s in line['spans']) for line in b.get('lines',[])))
    for line in narrative['lines'][:-1]:
        # Span bounds include trailing spaces; use actual word bounds to measure margins.
        words=[w for w in page.get_text('words') if abs(w[1]-line['bbox'][1])<1]
        assert abs(words[0][0]-70.87)<2,(count,'left narrative edge')
        assert abs(words[-1][2]-(page.rect.width-70.87))<2,(count,'right narrative edge')
    print(f'PASS: {count} participants, {len(pdf)} pages, justified narrative/TOC/footer/mixed orientation/no blank body/overflow; local renderer only')
