"""Package the editable offline player, exact logo/UI assets and composed mix."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

R=Path(__file__).resolve().parent
files=[R/p for p in ['player.html','film.js','timeline-data.js','TIMELINE.json',
    'CUES.json','Teks_Penjelas_Indonesia.srt','SUMBER_UI.json','SUMBER_LAPORAN.json',
    'PEMERIKSAAN_FILM.json','PEMERIKSAAN_AUDIO.json','RENCANA_AUDIO.json',
    'CATATAN_AUDIO.json','buat_audio.py','serve_preview.py','README.md','audio/Musik_dan_Efek.m4a']]
files+=list((R/'assets').glob('*.png'))
files+=[R.parent/'intro/Pratinjau_Judul.png',*sorted((R.parent/'intro/assets').glob('*.png'))]
with ZipFile(R/'Paket_Sumber_Film.zip','w',compression=ZIP_DEFLATED,compresslevel=6) as out:
    for file in files:out.write(file,file.relative_to(R.parent))
with ZipFile(R/'Paket_Sumber_Film.zip') as archive:
    assert archive.testzip() is None
print('Paket offline dengan soundtrack dan aset asli:',(R/'Paket_Sumber_Film.zip').stat().st_size,'bytes')
