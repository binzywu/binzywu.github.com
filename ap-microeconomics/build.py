"""Build the self-contained AP Microeconomics toolkit using only Python's standard library."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
lessons=json.loads((root/'lessons.json').read_text());units=json.loads((root/'units.json').read_text());frqs=json.loads((root/'frq.json').read_text())
assert len(lessons)==24 and len({l['id'] for l in lessons})==24
assert [u['id'] for u in units]==list(map(str,range(1,7)))
for u in units:
 assert u['lessonIds']==[l['id'] for l in lessons if l['unit']==u['id']]
 assert set(u['sections'])=={s for l in lessons if l['unit']==u['id'] for s in l['sections']}
assert [f['unit'] for f in frqs]==[u['id'] for u in units]
def data(x):return json.dumps(x,ensure_ascii=False).replace('</','<\\/')
page=(root/'template.html').read_text()
for marker,content in {'__UNIT_DATA__':data(units),'__LESSON_DATA__':data(lessons),'__FRQ_DATA__':data(frqs),'__LABS__':(root/'labs.html').read_text(),'__LAB_SCRIPT__':(root/'labs.js').read_text(),'__PROGRESS_TOOLS__':(root/'progress-tools.js').read_text()}.items():
 assert page.count(marker)==1,marker
 page=page.replace(marker,content)
(root/'index.html').write_text(page)
print(f'Built {len(units)} units, {len(lessons)} lessons, {sum(len(l["questions"]) for l in lessons)} checks, {len(frqs)} written-response drills and 3 models.')
