# Advanced Calculus Studio

Open `index.html` directly in a modern browser. It is a single, self-contained HTML file with no external fonts, scripts or network requests. Share the HTML file itself. A Slack preview may not execute it; download and open it in a browser.

## Reading, guided examples and portable progress

- All 23 lessons now typeset their key equations with native MathML: proper fractions, summations, integrals, roots, subscripts and derivatives. Conditions stay visible, with the original plain-text equation available in a disclosure. No network renderer is needed.
- Worked examples initially show the setup/first move. Reveal one subsequent step at a time, show all steps, or start again. Reveal state is session-only and does not affect completed practice checks.
- **Export progress** downloads a JSON backup containing the tutorial format/version, export time and completed-check flags. It contains no name or entered answers.
- **Import progress** validates the complete file, then merges known completed checks; it never clears existing completed checks. Unknown lesson keys are skipped and reported. Invalid formats, nonboolean flags and files larger than 1 MB are rejected before mutation. Storage failures are reported so the student can export before closing.
- The original `beyond-bc-practice-v1` storage key and question IDs are unchanged. Local-file storage can vary by browser and path: export from the old location/browser before moving, then import at the new location/browser. An already inaccessible old file's storage cannot be recovered automatically by this page.

## Scope

Prepared for a Bellevue High School MAH802 student who said the current unit is **sequences and series**. The expanded tutorial contains **23 lessons and 46 practice checks**. Lessons 1–8 retain sequences, series and Taylor/power series. Lessons 9–10 cover parametric and polar calculus; lessons 11–15 cover vectors, dot/cross products, lines/planes, vector-valued motion, arc length and curvature; lessons 16–22 cover surfaces, limits, partials, tangent planes, the chain rule, gradients and extrema. Lesson 23 adds Lagrange multipliers as an optional extension to confirm with the teacher. Every lesson includes an original worked example, a common mistake, an additional paper problem with reasoning, and two practice checks with hints and solutions.

Six interactive labs compare terms versus partial sums, Taylor polynomials versus their functions, surface slices/tangent lines, parametric/polar curves with velocity direction, vector products/projection, and gradient directions on contours. Student answers and completion stay local to the browser when localStorage is available; no account or external write occurs. The app still works when storage is blocked, but progress will not persist.

The broader course map is a suggested progression, not the teacher's syllabus. The original previews have been developed into full lessons, with their existing IDs and answer keys preserved to keep old deep links and saved progress valid. This remains a supplemental course guide rather than a complete yearlong syllabus or textbook. The current unit takes priority; the student can start at lesson 1 or choose another lesson from the navigation.

## Source grounding

The user supplied the district MAH802 description. Direct access to the district page and the two archived Bellevue College catalog URLs failed. Accessible Bellevue College department pages corroborate the course scope:

- https://www.bellevuecollege.edu/math/math153/
- https://www.bellevuecollege.edu/math/temporary-course-listing/

Further-reading links point to relevant OpenStax Calculus Volume 2 and Volume 3 sections. All explanations, examples and exercises here are original; no textbook passages or proprietary course materials were reproduced. No assumption is made about the teacher's textbook, pacing, grading or current assignments.

## Build and validation

`template.html` contains the application, `lessons.json` the authored lesson data, `math_notation.py` the key-equation MathML, `progress-tools.js` the backup controls, and `next-labs.html` / `next-labs.js` the added lab markup and logic. Run `python3 build.py` from this directory (or pass its absolute path) to produce the shareable `index.html`. The builder embeds all content and safely escapes script-closing sequences in the lesson JSON.

Run `node validate.cjs` to check all 23 lesson renders, 46 answer definitions, 4,719 Taylor remainder cases, 477 plot renders, preserved progress keys, series/input logic, numerical curve derivatives, vector identities, directional derivatives, line/plane intersections, linearization, optimization and polar area. Additional HTML ID/label/anchor and JavaScript syntax checks are run on the built file. This checks calculations and application logic, not a complete browser/accessibility audit. No Playwright was used, following the user's preference; visual browser QA was not performed.

Validation also covers guided reveal/restart behavior, backup round-tripping, nondestructive merges, unknown keys, malformed and oversized files, unsupported versions, invalid flags and unavailable browser storage. The build's MathML is XML-validated for every lesson.
