"""Build the offline tutorial from authored lesson and lab sources."""
from pathlib import Path
import json
from math_notation import enrich

root = Path(__file__).resolve().parent
lessons = json.loads((root / 'lessons.json').read_text())
enrich(lessons)
assert len({lesson['id'] for lesson in lessons}) == len(lessons)
page = (root / 'template.html').read_text()
for marker, content in {
    '__LESSON_DATA__': json.dumps(lessons, ensure_ascii=False).replace('</', '<\\/'),
    '__NEXT_LABS__': (root / 'next-labs.html').read_text(),
    '__NEXT_LAB_SCRIPT__': (root / 'next-labs.js').read_text(),
    '__PROGRESS_TOOLS__': (root / 'progress-tools.js').read_text(),
}.items():
    assert page.count(marker) == 1, marker
    page = page.replace(marker, content)
(root / 'index.html').write_text(page)
print(f'Built {len(lessons)} lessons, {sum(len(x["questions"]) for x in lessons)} checks, 6 labs.')
