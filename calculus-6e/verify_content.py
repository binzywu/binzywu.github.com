"""Validate the built toolkit's content mapping, equations and offline structure."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
import hashlib,json,re,xml.etree.ElementTree as ET
from math_notation import enrich
root=Path(__file__).resolve().parent
lessons=json.loads((root/'lessons.json').read_text());units=json.loads((root/'units.json').read_text());page=(root/'index.html').read_text()
class DocumentCheck(HTMLParser):
    def __init__(self):super().__init__();self.ids=[];self.refs=[];self.stack=[];self.icons=[];self.labs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='article' and a.get('class')=='lab':self.labs.append(a['id'])
        for key in ['for','aria-controls','aria-labelledby']:
            if key in a:self.refs.extend(a[key].split())
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
        if tag=='script':assert not a.get('src'),'External script'
        if tag=='link':
            assert a.get('rel')!='stylesheet','External stylesheet'
            if a.get('rel')=='icon':self.icons.append(a['href'])
    def handle_endtag(self,tag):
        assert self.stack and self.stack[-1]==tag,(tag,self.stack[-5:])
        self.stack.pop()
h=DocumentCheck();h.feed(page)
assert not h.stack,h.stack
assert len(h.ids)==len(set(h.ids)),'Duplicate IDs'
assert set(h.refs)<=set(h.ids),set(h.refs)-set(h.ids)
assert set(h.labs)=={'model-lab','tangent-lab','accumulation-lab','series-lab','taylor-lab','parametric-lab'}
assert len(h.icons)==1 and h.icons[0].startswith('data:image/svg+xml,');ET.fromstring(unquote(h.icons[0].split(',',1)[1]))
assert not re.search(r'__[A-Z_]+__',page),'Unexpanded build marker'
assert 'larson-single-variable-6e-practice-v1' in page and 'larson-single-variable-6e-progress' in page
assert '9780395885789' in page
assert not re.search(r'Ninth Edition|Chapters 1–10|larson-single-variable-9e|drawEuler|drawSlice|drawGradient|drawVectors',page)
enrich(lessons)
for l in lessons:
    ET.fromstring('<root>'+l['formulaMathML']+'</root>')
    assert l['sections'] and all(s in units[['P','1','2','3','4','5','6','7','8','9'].index(l['unit'])]['sectionTitles'] for s in l['sections'])
    if l.get('lab'):assert l['lab'] in h.labs
assert [u['id'] for u in units]==['P']+list(map(str,range(1,10)))
assert sum(len(u['sections']) for u in units)==72
for u in units:
    own=[l for l in lessons if l['unit']==u['id']]
    assert set(u['sections'])=={s for l in own for s in l['sections']}
    assert u['lessonIds']==[l['id'] for l in own]
    assert set(u['sections'])==set(u['sectionTitles'])
print(f'PASS: 72 section mappings, {len(lessons)} XML-valid equations, six lab links, embedded favicon, balanced HTML, unique IDs, valid labels, and offline dependencies.')

adapted_ids=['alternating', 'analytic-limits', 'antiderivatives', 'area-sums', 'basic-derivatives', 'between-curves', 'calculus-preview', 'centroids', 'concavity', 'conics', 'continuity', 'curve-sketching', 'definite-integrals', 'derivative-definition', 'exponential-calculus', 'first-derivative-test', 'fluid-force', 'ftc', 'functions-domain', 'graphs-models', 'growth-decay', 'hyperbolic', 'implicit', 'improper-integrals', 'infinite-limits', 'integration-strategy', 'interval-extrema', 'inverse-functions', 'inverse-trig-derivatives', 'inverse-trig-integrals', 'length-revolution', 'lhopital', 'limits-infinity', 'linear-models', 'log-derivative', 'log-integrals', 'mean-value', 'newton', 'numerical-integration', 'numerical-limits', 'other-bases', 'parametric', 'parametric-integrals', 'partial-fractions', 'partial-sums', 'parts', 'polar', 'polar-conics', 'polar-length', 'positive-tests', 'power', 'product-quotient', 'ratio-root', 'related-rates', 'separable-logistic', 'sequences', 'series-tools', 'shells', 'single-chain', 'single-differentials', 'single-optimization', 'substitution', 'tables-techniques', 'taylor', 'taylor-equality', 'trig-integrals', 'trig-substitution', 'washers', 'work']
question_map={l['id']:l['questions'] for l in lessons}
encoded=json.dumps([(key,question_map[key]) for key in adapted_ids],sort_keys=True,ensure_ascii=False).encode()
assert hashlib.sha256(encoded).hexdigest()=='4c55eda45b9441e39ccfddca73ce77907f24a0129a66d98927c8dc8c8755750e'
print('PASS: all 69 adapted lesson quiz definitions preserved exactly.')
