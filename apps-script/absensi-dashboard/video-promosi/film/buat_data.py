"""Generate the offline player data from editable timeline, captions and source manifests."""
from pathlib import Path
import json
R=Path(__file__).resolve().parent
intro=(R.parent/'intro/intro.html').read_text().replace('<head>','<head><base href="../intro/">',1).replace("new URLSearchParams(location.search).has('render')",'true')
(R/'timeline-data.js').write_text('window.FILM='+(R/'TIMELINE.json').read_text()+';\nwindow.CUES='+(R/'CUES.json').read_text()+';\nwindow.FILM_SOURCE='+(R/'SUMBER_UI.json').read_text()+';\nwindow.INTRO_DOCUMENT='+json.dumps(intro,ensure_ascii=False)+';\n')
print('Built offline timeline data with derived intro document; original intro files unchanged.')
