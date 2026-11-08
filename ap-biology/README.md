# AP Biology Studio

An independent offline learning toolkit for **AP Biology**, aligned by topic code to College Board's **Course and Exam Description effective Fall 2025**, listed for use in **2026–27**. Framework and clarifications checked **November 8, 2026**.

Open **index.html** in a modern browser. It is a single portable file with embedded lesson data, styles, JavaScript, diagrams and a DNA-themed browser icon. No account, installation or network is required for the learning app. Optional source and further-reading links need internet access.

## Learning toolkit

- Eight units, **60 topic lessons** and **120 automatically checked practice questions**.
- Every lesson includes an original explanation, a key relationship, guided reasoning steps, a common misconception, a written question and model reasoning.
- Eight original conceptual diagrams, with accessible descriptions and captions explaining their limits.
- **✓ Completed** badges after both checks are solved; partial lessons show **1/2**.
- Six interactive models: water potential, enzyme kinetics, one-locus inheritance, population genetics, population growth and chi-square.
- Eight original four-part written-response drills with self-check guides. They are not official AP questions or scoring rubrics and are not automatically graded.
- Unit navigation, a course map, prerequisites, multiple-choice weighting ranges and science-practice habits.
- Separate browser-local progress plus validated backup export/import.

The topic labels in this toolkit are original lesson titles. The numeric codes map to the current official sequence. See [ALIGNMENT.md](ALIGNMENT.md) for the full map. Mapping every numbered topic is introductory coverage, not an exhaustive audit of every essential-knowledge statement or a substitute for a full textbook, teacher instruction or hands-on investigations. Recorded completions are practice records, not mastery certifications or predictions of AP scores.

## Units

| Unit | Course area | Lessons | Official MC weighting range |
|---|---|---:|---|
| 1 | Chemistry of Life | 7 | 8–11% |
| 2 | Cells | 10 | 10–13% |
| 3 | Cellular Energetics | 5 | 12–16% |
| 4 | Cell Communication and Cell Cycle | 6 | 10–15% |
| 5 | Heredity | 5 | 8–11% |
| 6 | Gene Expression and Regulation | 8 | 12–16% |
| 7 | Natural Selection | 12 | 13–20% |
| 8 | Ecology | 7 | 10–15% |

These weighting ranges describe the multiple-choice section. They are not an instruction to ignore lower-weighted units. This toolkit does not contain a full-length exam or claim an AP score conversion.

## Model assumptions

All modeled values and written-drill datasets are original and synthetic. They are not measurements from real investigations.

1. **Osmosis:** water-permeable membrane, nonpenetrating solute, i=1, T=298 K, external pressure potential zero, R=0.0831 L·bar/(mol·K). Controls set initial concentrations and internal pressure; the diagram predicts initial net movement rather than simulating changing volumes.
2. **Enzymes:** optional Michaelis–Menten-style quantitative extension with a competitive-inhibition factor. Vmax is fixed at100 arbitrary rate units. It does not model all enzymes, denaturation or other inhibition mechanisms. This equation is not presented as an AP memorization requirement.
3. **Inheritance:** one diploid locus, equal segregation, independent gamete draws, equal viability and complete dominance for the phenotype summary. Each grid cell is a gamete-draw outcome; repeated allele labels remain separate equiprobable draws.
4. **Alleles:** a deterministic one-generation viability-selection model starts with Hardy–Weinberg proportions, weights by positive relative contributions and normalizes surviving genotypes. Survivor genotype proportions need not remain Hardy–Weinberg proportions. No drift, migration or new mutation is simulated.
5. **Populations:** continuous exponential and logistic models, N₀=20, constant r and K, no stochasticity or delays. Fractional values are mathematical model outputs, not fractional observed organisms.
6. **Chi-square:**100 independent observations in two categories, fixed externally specified probabilities, expected counts all above5, df=1, α=0.05 and approximate critical value3.841. The decision is reject or fail to reject, never proof of a null model or a unique mechanism. This is a goodness-of-fit model, not a test of means.

The written drills provide a place to draft explanations and compare with original criteria. Draft text remains only in the current open tab and is not saved or included in progress backups. Copy it before closing or reloading.

## Progress portability

Storage key: **ap-biology-practice-v1**. Backup format: **ap-biology-progress**, version1. Calculus progress is not read or modified. Other toolkit backup formats are rejected so courses cannot be accidentally mixed.

Export before moving the file, changing browsers or replacing a copy. Import validates the entire backup before merging known true completion flags. It never clears an existing completed check. Unknown IDs are skipped and reported. Invalid JSON, wrong formats, unsupported versions, nonboolean flags and files larger than1 MB are rejected before mutation. Backups contain completion flags, not entered answers or names.

Local-file storage behavior depends on browser and path. The app still runs when storage is blocked, but progress may not survive closing; export to retain it. Revealed worked-step state is session-only. A correct check remains completed after an incorrect retry.

## Source grounding

Course mapping and current status:

- [AP Biology course page](https://apcentral.collegeboard.org/courses/ap-biology)
- [Course and Exam Description, effective Fall2025](https://apcentral.collegeboard.org/media/pdf/ap-biology-course-and-exam-description.pdf)
- [Course at a Glance](https://apcentral.collegeboard.org/media/pdf/ap-biology-course-at-a-glance.pdf)
- [Clarifications and Corrections, including June2026 updates](https://apcentral.collegeboard.org/media/pdf/ap-biology-ced-clarifications-and-corrections.pdf)
- [CED to use for2026–27](https://apcentral.collegeboard.org/courses/how-ap-develops-courses-and-exams/course-changes-overview)
- [Current exam information](https://apcentral.collegeboard.org/courses/ap-biology/exam)
- [Released official questions and scoring materials](https://apcentral.collegeboard.org/courses/ap-biology/exam/past-exam-questions)

Scientific background and optional reading:

- [OpenStax Biology2e](https://openstax.org/details/books/biology-2e)
- [Passive transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport)
- [Enzymes](https://openstax.org/books/biology-2e/pages/6-5-enzymes)
- [Population evolution](https://openstax.org/books/biology-2e/pages/19-1-population-evolution)
- [Goodness-of-fit tests](https://openstax.org/books/introductory-statistics-2e/pages/11-2-goodness-of-fit-test)

Descriptions, examples, diagrams and questions are original; restricted AP Classroom content and official exam questions were not reproduced. Optional reading links are supporting textbook chapters, not a claim that one chapter exhaustively covers each mapped AP topic. AP® is a College Board trademark; this toolkit is not affiliated with or endorsed by College Board.

## Build and validation

Only standard Python3 and Node.js are required:

```sh
python3 build.py
node validate.cjs
python3 verify_content.py
```

- **lessons.json:** original explanations, checks and topic mappings.
- **units.json:** sequence, introductions, weighting ranges and original SVG diagrams.
- **frq.json:** original written drills and criteria.
- **template.html:** navigation, lesson renderer, local practice logic and styling.
- **labs.html / labs.js:** interactive model interfaces and calculations.
- **progress-tools.js:** independent progress backups.
- **index.html:** generated portable app.

Checks cover all60 lesson renders and120 quiz submissions, correct/incorrect retries, unit filtering, completion badges and reloads, guided reveals, same-lesson navigation, course-map transitions, independent storage, transactional backup validation and blocked storage. All17 numerical quiz answers are independently recalculated. Model tests exercise water-potential signs, enzyme saturation/inhibition, all nine genotype crosses, frequency normalization, population-model invariants and chi-square calculations;111 SVG lab renders are checked for invalid values. Structural checks cover60 topic mappings, eight diagram XML documents, eight written guides, labels, unique static IDs, HTML structure, an embedded icon and offline dependencies.

This is automated validation, not a comprehensive scientific peer review. Visual browser and accessibility audits were not performed.
