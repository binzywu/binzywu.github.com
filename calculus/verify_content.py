"""Check textbook coverage, preserved question identities, and offline document structure."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re,xml.etree.ElementTree as ET,hashlib
root=Path(__file__).resolve().parent
lessons=json.loads((root/'lessons.json').read_text())
units=json.loads((root/'units.json').read_text())
page=(root/'index.html').read_text()
class CheckHTML(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.refs=[];self.stack=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        for key in ['for','aria-controls','aria-labelledby']:
            if key in a:self.refs.extend(a[key].split())
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
        if tag=='script':assert not a.get('src'),'External script breaks offline behavior'
        if tag=='link':assert a.get('rel')!='stylesheet','External stylesheet breaks offline behavior'
    def handle_endtag(self,tag):
        assert self.stack and self.stack[-1]==tag,(tag,self.stack[-5:])
        self.stack.pop()
h=CheckHTML();h.feed(page);assert not h.stack,h.stack
assert len(h.ids)==len(set(h.ids)),'Duplicate HTML IDs'
assert set(h.refs)<=set(h.ids),(set(h.refs)-set(h.ids))
assert not re.search(r'__(LESSON_DATA|UNIT_DATA|NEXT_LABS|NEXT_LAB_SCRIPT|PROGRESS_TOOLS)__',page)
from math_notation import enrich
enrich(lessons)
for l in lessons:
    xml='<root>'+l['formulaMathML']+'</root>'
    ET.fromstring(xml)
    assert len(l['steps'])>=4,l['id']
    for q in l['questions']:
        if not q.get('options'):assert isinstance(q['answer'],(int,float)),l['id']
        assert q['hint'] and q['explain'],l['id']
assert [u['id'] for u in units]==['P']+list(map(str,range(1,17)))
assert sum(len(u['sections']) for u in units)==115
for u in units:
    own=[l for l in lessons if l['unit']==u['id']]
    assert set(u['sections'])=={s for l in own for s in l['sections']}
    assert u['lessonIds']==[l['id'] for l in own]
assert 'beyond-bc-practice-v1' in page
assert 'beyond-bc-progress' in page
print(f'PASS: {len(units)} ordered units, 115 covered sections, {len(lessons)} XML-valid lesson equations, unique HTML IDs, valid accessibility references, balanced HTML, offline scripts.')

legacy_ids=['sequences', 'partial-sums', 'positive-tests', 'ratio-root', 'alternating', 'power', 'taylor', 'series-tools', 'parametric', 'polar', 'vector-basics', 'dot-cross', 'lines-planes', 'vectors-preview', 'arc-curvature', 'surfaces', 'multivariable-limits', 'partials-preview', 'tangent-plane', 'chain-rule', 'gradient', 'optimization', 'lagrange']
legacy=[next(l for l in lessons if l['id']==key) for key in legacy_ids]
assert hashlib.sha256(json.dumps([(l['id'],l['questions']) for l in legacy],sort_keys=True,ensure_ascii=False).encode()).hexdigest()=='0c64e061359739019ebcc11d04e80c29197daa7c5a87f908c70f5f4b5a7e3aa5'
print('PASS: all 23 original lesson identities and 46 original questions preserved exactly.')
