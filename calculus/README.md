# Calculus Studio

A unit-by-unit learning companion aligned to **Calculus, 11th edition, Ron Larson and Bruce Edwards**. Open `index.html` directly in a modern browser; it embeds its lesson data, styles, JavaScript and native MathML without network dependencies.

## Coverage and organization

**17 units, 111 lessons, 222 practice checks and six interactive labs.** Preparation and Chapters 1–16 appear in textbook order. All **115 numbered sections** in the textbook contents are mapped to lessons; closely related sections sometimes share a lesson. Each lesson includes an original explanation, a typeset key equation, guided worked steps, a common mistake, a paper problem with reasoning, and two checks with hints and solutions.

The chapter selector shows only the current unit's lessons. The course map provides unit introductions, prerequisites, direct links and progress counts. Each lesson names its matching textbook sections; previous/next navigation crosses unit boundaries in order. Existing lesson hashes remain valid even though their positions have changed.

This is introductory coverage of every chapter, not a reproduction or replacement of the full textbook, its exercise sets, proofs, projects or appendices. Use the textbook and the teacher's assignments for depth and additional practice. See [ALIGNMENT.md](ALIGNMENT.md) for the complete section-to-lesson map.

**Chapter 16 limitation:** the supplied PDF lists four online sections but does not include their body text. Unit 16 contains original lessons on those four topics, with supplementary references to OpenStax and Paul's Online Notes. Its alignment is to the listed topics; it does not claim verification against Larson's unavailable online chapter.

| Unit | Textbook chapter | Lessons |
|---|---|---:|
| P | Preparation for Calculus | 4 |
| 1 | Limits and Their Properties | 5 |
| 2 | Differentiation | 6 |
| 3 | Applications of Differentiation | 9 |
| 4 | Integration | 5 |
| 5 | Logarithmic, Exponential, and Other Transcendental Functions | 9 |
| 6 | Differential Equations | 4 |
| 7 | Applications of Integration | 7 |
| 8 | Integration Techniques and Improper Integrals | 8 |
| 9 | Infinite Series | 9 |
| 10 | Conics, Parametric Equations, and Polar Coordinates | 6 |
| 11 | Vectors and the Geometry of Space | 5 |
| 12 | Vector-Valued Functions | 4 |
| 13 | Functions of Several Variables | 10 |
| 14 | Multiple Integration | 8 |
| 15 | Vector Analysis | 8 |
| 16 | Additional Topics in Differential Equations | 4 |

## Progress and offline use

The original `beyond-bc-practice-v1` localStorage key, 23 legacy lesson IDs and 46 legacy questions are preserved. New lessons add new question IDs. Unit counts and whole-course counts measure completed practice checks, not mastery or grades.

Use **Export progress** before moving the file, switching browsers or replacing your copy. Import validates the complete backup before merging known completed checks; it never clears existing completions. Unknown IDs are skipped and reported. Invalid flags, unsupported versions and files over 1 MB are rejected. Backups contain completion flags only, without names or entered answers. Browser storage may vary with file location; export/import is the portable path. The tutorial still runs if storage is blocked, but completion may not persist.

Worked-step reveal state is session-only. The existing six labs cover series/partial sums, Taylor error, surface slices, parametric/polar curves, vector products and gradients. They support selected topics rather than every chapter. Optional further-reading links require internet access; the learning app itself does not.

## Source grounding

Chapter order, chapter names and section numbers follow printed contents pages iii–vii of the user-supplied Larson/Edwards PDF. All new examples, explanations and problems are original. Further reading uses OpenStax Calculus Volumes 1–3, plus these online-topic references:

- https://tutorial.math.lamar.edu/Classes/DE/Exact.aspx
- https://tutorial.math.lamar.edu/Classes/DE/SeriesSolutions.aspx
- https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations
- https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations

The earlier 23 lessons were developed for the supplied MAH802 description. They are retained inside the matching textbook units. Textbook alignment does not establish a school's current pacing, assignments or credit equivalency.

## Build and verification

Run from this directory:

```sh
python3 build.py
node validate.cjs
python3 verify_content.py
```

`lessons.json` contains authored lesson data and precomputed MathML for the new lessons. `units.json` defines chapter order, exact section titles, introductions and prerequisites. `math_notation.py` retains the original 23 MathML definitions. `template.html` contains the app; the builder embeds all data and lab/progress scripts into `index.html`. New MathML was prepared with latex2mathml 3.81.1; that package is **not required to rebuild or open the tutorial**.

Verification covers every lesson render, unit order and filtered navigation, section coverage, answer definitions, legacy progress compatibility, backup validation, 4,719 Taylor-bound cases, 477 lab plot renders, equation XML, HTML structure and offline dependencies. Numerical checks independently evaluate selected integrals, derivatives, flux and differential-equation results. These automated checks are not a full textbook-level proof audit or a visual browser/accessibility audit. No browser automation was used.
