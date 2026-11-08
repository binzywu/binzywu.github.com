"""Build the offline tutorial from authored lesson and lab sources."""
from pathlib import Path
import json
from math_notation import enrich

root = Path(__file__).resolve().parent
lessons = json.loads((root / 'lessons.json').read_text())
enrich(lessons)
units = json.loads((root / 'units.json').read_text())
assert {l['unit'] for l in lessons} == {u['id'] for u in units}
for unit in units:
    assert set(unit['sections']) == {section for lesson in lessons if lesson['unit'] == unit['id'] for section in lesson['sections']}
assert len({lesson['id'] for lesson in lessons}) == len(lessons)
assert [u['id'] for u in units] == ['P'] + list(map(str, range(1, 10)))
assert sum(len(u['sections']) for u in units) == 72
for unit in units:
    assert unit['lessonIds'] == [l['id'] for l in lessons if l['unit'] == unit['id']]
    assert set(unit['sectionTitles']) == set(unit['sections'])
page = (root / 'template.html').read_text()
for marker, content in {
    '__UNIT_DATA__': json.dumps(units, ensure_ascii=False).replace('</', '<\\/'),
    '__LESSON_DATA__': json.dumps(lessons, ensure_ascii=False).replace('</', '<\\/'),
    '__BASICS_LABS__': (root / 'basics-labs.html').read_text(),
    '__BASICS_LAB_SCRIPT__': (root / 'basics-labs.js').read_text(),
    '__NEXT_LABS__': (root / 'next-labs.html').read_text(),
    '__NEXT_LAB_SCRIPT__': (root / 'next-labs.js').read_text(),
    '__PROGRESS_TOOLS__': (root / 'progress-tools.js').read_text(),
}.items():
    assert page.count(marker) == 1, marker
    page = page.replace(marker, content)
(root / 'index.html').write_text(page)
print(f'Built {len(units)} units, {len(lessons)} lessons, {sum(len(x["questions"]) for x in lessons)} checks, 6 labs.')
