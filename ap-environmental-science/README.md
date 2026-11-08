# AP Environmental Science Studio

Open `index.html` directly in a modern browser. Text, practice checks and models work offline; official resource links need internet. No install, account, server or external JavaScript library is required.

## Included

- All 9 unit themes, with four grouped introductory lessons per unit: 36 lessons and 72 checks.
- Original explanations, step-by-step worked examples, hints, solutions and conceptual/numerical practice.
- Three interactive models with stated assumptions, labeled graphs and numerical summaries.
- One original four-part written drill per unit, with a self-check guide.
- Browser icon, unit navigation, persistent completed-lesson badges and progress export/import.
- Links to sibling toolkits without changing their files.

This is a learning companion, not a complete textbook or exhaustive audit of every AP essential-knowledge statement. Topic references provide an introductory map; a grouped lesson may address several topics. Four short lessons per unit cannot replace full course instruction, graph practice and authentic assessment preparation. Field and laboratory investigations remain essential.

## Progress and privacy

Only solved-check flags are saved under `ap-environmental-science-practice-v1`. Backups use `ap-environmental-science-progress`, version 1. Import validates the complete file before merging true flags and never erases known completed checks. Other subjects use different namespaces and incompatible backup formats. Storage may be unavailable or behave differently for local files; export before moving the folder or changing browser.

Written drafts stay in this tab only and are not backed up. Copy them before closing or reloading. Completion records practice, not mastery; there is no official AP score or automatic written-response grade. No account, analytics or answer upload is used.

## Build and verification

```sh
python3 build.py
node validate.cjs
python3 verify_content.py
```

Edit `lessons.json`, `units.json`, `frq.json`, `template.html`, `labs.html`, `labs.js` or `progress-tools.js`, then rebuild. `course.json` records the subject and expected counts. Keep `favicon.svg` alongside the built `index.html`.

Validation checks every lesson and quiz submission, numerical answers independently, all topic references, unit switching and same-hash navigation, saved progress, completion markers, whole-file backup rejection/merging, unavailable storage, model invariants, 27 model renders, HTML structure and SVG syntax. No visual browser QA or real-world model calibration is claimed.

See `ALIGNMENT.md` for the source map and limits. Work is local and uncommitted unless publication is separately requested.
