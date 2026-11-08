# Single Variable Studio — Sixth Edition

An offline learning toolkit aligned to **Calculus of a Single Variable, 6th edition**, by Ron Larson, Robert P. Hostetler and Bruce H. Edwards, **ISBN 9780395885789**. This targets the standard edition, not an Early Transcendental Functions variant.

Open **index.html** in a modern browser. It is a self-contained file: lessons, MathML, JavaScript, styles and an integral-symbol browser icon are embedded. Sharing the HTML file is enough to run the app. Optional further-reading links require internet access.

## What is included

- Preparation and Chapters 1–9 in sixth-edition order.
- **73 lessons covering the 72 numbered section topics**, with **146 practice checks**.
- Original explanations, guided worked steps, common mistakes, paper problems and solutions.
- A chapter selector, course map, prerequisites, and textbook section titles on every lesson.
- **✓ Completed** badges when both checks are solved and **1/2** for partial progress.
- Six interactive labs: model fitting and residuals, tangent/secant slopes, numerical integration, series and partial sums, Taylor approximation and error, and parametric/polar curves.
- Independent local progress and transactional backup export/import.

§P.4 has three lessons for linear, quadratic and periodic models. Some closely related series and curve sections share a lesson. See [ALIGNMENT.md](ALIGNMENT.md) for the complete section map.

## Edition-specific organization

| Unit | Sixth-edition chapter | Lessons |
|---|---|---:|
| P | Preparation for Calculus | 6 |
| 1 | Limits and Their Properties | 5 |
| 2 | Differentiation | 6 |
| 3 | Applications of Differentiation | 10 |
| 4 | Integration | 6 |
| 5 | Logarithmic, Exponential, and Other Transcendental Functions | 10 |
| 6 | Applications of Integration | 7 |
| 7 | Integration Techniques, L’Hôpital’s Rule, and Improper Integrals | 8 |
| 8 | Infinite Series | 9 |
| 9 | Conics, Parametric Equations, and Polar Coordinates | 6 |

Key sixth-edition placements include business/economics at §3.10, numerical integration at §4.6, growth/decay at §5.6, separation of variables at §5.7, integration applications in Chapter 6, L’Hôpital’s rule at §7.7, series in Chapter 8, and parametric/polar curves in Chapter 9. There is no separate differential-equations chapter in this edition's main chapter sequence.

## Source grounding and limits

The chapter/section map follows the [published contents for ISBN 9780395885789](https://stpaulsepiscopal.ecampus.com/calculus-single-variable-6th-larson-ron/bk/9780395885789), cross-checked where available against the [Naval Postgraduate School's contemporary sixth-edition syllabus](https://www.oc.nps.edu/ma1117/syllabus.html). The full sixth-edition text was not supplied or inspected. The map verifies the listed topics and sequence; it does not establish exact correspondence with every exercise, example or subsection.

Explanations and exercises here are original. Relevant original lessons from the earlier Calculus Studio were adapted to the sixth-edition order. Modeling examples and the business/economics lesson were authored for this toolkit. Further-reading links point to OpenStax. This is introductory chapter coverage, not a replacement for the textbook's full depth, proof appendices, projects, exercise sets or integration tables. The study plan includes a short trigonometry aid corresponding to Appendix A.3, not a reproduction of that appendix. The teacher's assignments take precedence.

The periodic-model lab fits sine/cosine coefficients using an assumed period of 12; it does not estimate an unknown period. The datasets are synthetic. The numerical integration lab shows actual errors for functions with known exact integrals; these are not general certified bounds for arbitrary integrands. Numerical answers use a tolerance of 0.0001.

## Saved progress

This toolkit uses **larson-single-variable-6e-practice-v1** in localStorage. It does not read or modify the existing 11th-edition toolkit's progress. Backups identify themselves as **larson-single-variable-6e-progress**, version 1. Backups from other toolkits/editions are rejected to prevent accidental mixing.

Use **Export progress** before moving the file or switching browsers. Import validates the entire backup before merging known completed checks. It never clears existing completions; unknown IDs are skipped and reported. Unsupported formats, invalid flags, invalid JSON and files larger than 1 MB are rejected. The backup contains completion flags only, not names or entered answers. Completion counts practice checks, not mastery or grades.

Local-file storage behavior varies by browser and path. If storage is blocked, the app still runs, but you should export before closing. Worked-step reveal state is session-only. Browser storage cannot recover an inaccessible old file automatically.

## Build and verify

Only standard Python 3 and Node.js are required; no package installation or network access is needed.

```sh
python3 build.py
node validate.cjs
python3 verify_content.py
```

Source files:

- **lessons.json** — original lesson content, equations, section mappings and quizzes.
- **units.json** — textbook chapter order, section titles, introductions and prerequisites.
- **template.html** — the app and original series/Taylor labs.
- **basics-labs.html / basics-labs.js** — fitting, tangent and numerical integration labs.
- **next-labs.html / next-labs.js** — the parametric/polar lab.
- **progress-tools.js** — independent progress backup controls.
- **math_notation.py** — retained native MathML definitions; other equations are stored with their lessons.
- **index.html** — generated portable app.

Validation checks all 73 lesson renders and all 146 quiz submissions, chapter/section mapping, chapter navigation, completion badges and persisted reloads, storage independence, malformed/foreign/oversized backup rejection, merge preservation, and unavailable-storage behavior. Lab checks cover least-squares results, singular fits, residuals, profit optimization, tangent limits, integration rules, 4,719 Taylor error-bound cases and 285 SVG lab renders. Content checks cover equation XML, balanced HTML, unique IDs, accessible label targets, embedded favicon and offline dependencies. Existing adapted quiz content is checked against a fixed digest.

No visual browser or accessibility audit was performed. This automated validation does not amount to a textbook-level proof audit.
