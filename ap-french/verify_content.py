"""Structural and content integrity checks; no third-party dependencies."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,xml.etree.ElementTree as ET
p=Path(__file__).resolve().parent
units=json.loads((p/'units.json').read_text());lessons=json.loads((p/'lessons.json').read_text())
assert len(units)==6 and len(lessons)==42
for u in units:
    own=[l for l in lessons if l['unit']==u['id']]
    assert [l['id'] for l in own]==u['lessonIds']
    assert len(own)==7 and sum(l.get('kind')=='listening' for l in own)==1
    for l in own:
        assert len(l['questions'])==2 and len(l['vocab'])==4
        for q in l['questions']:
            assert len(q['options'])==4 and q['explain']==q['options'][q['answer']]
html=(p/'index.html').read_text()
assert not re.search(r'__[A-Z_]+__',html)
assert 'ap-french-practice-v1' in html and 'ap-biology-practice-v1' not in html
assert not re.search(r'<script[^>]+src=',html)
class Check(HTMLParser):
    def __init__(self):super().__init__();self.stack=[];self.ids=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
    def handle_endtag(self,tag):assert self.stack and self.stack.pop()==tag,tag
c=Check();c.feed(html);assert not c.stack
ET.parse(p/'favicon.svg')
print('PASS: six units, 42 lessons, 84 checks, isolated namespace, balanced HTML, unique IDs, favicon XML and embedded assets.')
