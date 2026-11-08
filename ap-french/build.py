"""Build the self-contained AP French toolkit using Python's standard library."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
html=(ROOT/'template.html').read_text()
for marker,file in [('__LABS__','studio.html'),('__LAB_SCRIPT__','studio.js'),('__PROGRESS_TOOLS__','progress-tools.js')]:
    html=html.replace(marker,(ROOT/file).read_text())
for marker,file in [('__FRQ_DATA__','frq.json'),('__UNIT_DATA__','units.json'),('__LESSON_DATA__','lessons.json')]:
    data=json.dumps(json.loads((ROOT/file).read_text()),ensure_ascii=False).replace('<','\\u003c')
    html=html.replace(marker,data)
(ROOT/'index.html').write_text(html)
print('Built index.html')
