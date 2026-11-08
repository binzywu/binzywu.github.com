"""Structural validation of the built offline toolkit using the standard library."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent
meta=json.loads((root/'course.json').read_text());units=json.loads((root/'units.json').read_text());lessons=json.loads((root/'lessons.json').read_text())
assert len(units)==meta['units'] and len(lessons)==meta['lessons']
assert len(set(l['id'] for l in lessons))==len(lessons)
for u in units:
    own=[l for l in lessons if l['unit']==u['id']]
    assert len(own)==4 and u['lessonIds']==[l['id'] for l in own]
    ET.fromstring(u['diagram'])
    for l in own:
        assert len(l['questions'])==2 and len(l['steps'])>=4
        assert len(set(l['questions'][0]['options']))==4
        for ref in l['sections']:assert ref in u['sections']
html=(root/'index.html').read_text()
assert not re.search(r'__[A-Z_]+__',html)
assert not re.search(r'<script[^>]+src=',html)
assert meta['slug']+'-practice-v1' in html
class Check(HTMLParser):
    def __init__(self):super().__init__();self.stack=[];self.ids=set();self.labels=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
        if tag=='label' and 'for' in a:self.labels.append(a['for'])
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
    def handle_endtag(self,tag):assert self.stack and self.stack.pop()==tag,tag
c=Check();c.feed(html);assert not c.stack
for label in c.labels:assert label in c.ids,label
ET.parse(root/'favicon.svg')
print('PASS: balanced HTML, unique static IDs, input labels, embedded scripts, unit diagram XML, favicon and content structure.')
