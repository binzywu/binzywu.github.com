"""Check topic coverage, diagrams, labels and self-contained delivery."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
import json,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parent
lessons=json.loads((root/'lessons.json').read_text());units=json.loads((root/'units.json').read_text());frqs=json.loads((root/'frq.json').read_text());page=(root/'index.html').read_text()
class CheckHTML(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.refs=[];self.stack=[];self.icons=[];self.labs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='article' and a.get('class')=='lab':self.labs.append(a['id'])
        for k in ['for','aria-controls','aria-labelledby']:
            if k in a:self.refs.extend(a[k].split())
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
        if tag=='script':assert not a.get('src'),'External script'
        if tag=='link':
            assert a.get('rel')!='stylesheet','External stylesheet'
            if a.get('rel')=='icon':self.icons.append(a['href'])
    def handle_endtag(self,tag):
        assert self.stack and self.stack[-1]==tag,(tag,self.stack[-5:])
        self.stack.pop()
h=CheckHTML();h.feed(page)
assert not h.stack,h.stack
assert len(h.ids)==len(set(h.ids)),'Duplicate static HTML IDs'
assert set(h.refs)<=set(h.ids),set(h.refs)-set(h.ids)
assert set(h.labs)=={'osmosis-lab','enzyme-lab','punnett-lab','allele-lab','population-lab','chi-lab'}
assert len(h.icons)==1 and h.icons[0].startswith('data:image/svg+xml,');ET.fromstring(unquote(h.icons[0].split(',',1)[1]))
assert not re.search(r'__[A-Z_]+__',page),'Unexpanded build marker'
assert 'ap-biology-practice-v1' in page and 'ap-biology-progress' in page
assert not re.search(r'larson-single-variable|beyond-bc-practice|drawTaylor|drawTangent|function taylor|Textbook §',page)
assert [u['id'] for u in units]==list(map(str,range(1,9)))
assert [len(u['sections']) for u in units]==[7,10,5,6,5,8,12,7]
assert sum(len(u['sections']) for u in units)==60
for u in units:
    own=[l for l in lessons if l['unit']==u['id']]
    assert own and u['lessonIds']==[l['id'] for l in own]
    assert set(u['sections'])=={s for l in own for s in l['sections']}
    assert set(u['sectionTitles'])==set(u['sections'])
    svg=ET.fromstring(u['diagram']);assert svg.tag.endswith('svg') and svg.attrib.get('aria-label')
    assert u['diagramCaption']
for l in lessons:
    assert len(l['steps'])>=4 and len(l['questions'])==2,l['id']
    if l.get('lab'):assert l['lab'] in h.labs
    assert l['resource'].startswith('https://openstax.org/')
for f in frqs:assert len(f['prompts'])==len(f['criteria'])==4
print('PASS: all 60 topic mappings, eight SVG diagrams, eight written guides, six labs, embedded favicon, HTML structure, labels, unique IDs and offline dependencies.')
