# AP French Studio

An independent learning toolkit in its own `ap-french` directory. Open `index.html` directly in a modern browser. No install, account, server or external library is required for text practice.

- Six unit themes from the Fall 2026 AP French Language and Culture framework.
- 42 original lessons: 36 reading passages and six listening scripts, with 84 comprehension and communication checks.
- 168 contextual vocabulary cards, optional French device speech, speaking/essay rehearsal timer, authentic-source notebook and six production drills.
- Unit navigation, persistent completed-lesson badges, and transactional progress export/import.

## Course scope

This supports the redesigned **2026–27 course / May 2027 exam**. It is an introductory practice companion, not comprehensive exam preparation, an official course or a replacement for sustained authentic reading, listening and interaction. Studio lesson numbers are local organization, not official AP topic codes. See `ALIGNMENT.md` for sources and limitations.

All embedded passages, scripts, prompts, explanations and guides are original, fictional practice material. They do not establish cultural facts. Each unit links to a real French-language source for further investigation. No released AP questions or song lyrics are reproduced.

## Audio, drafts and progress

Optional audio uses the browser's `speechSynthesis` API, with a French voice selected explicitly. Availability and offline support depend on the device; some voices need internet. The studio prefers device voices and never substitutes an English voice. Listening scripts have transcript fallbacks. This is synthetic speech, not authentic native audio. External media links need internet.

No microphone or recording is used. Written responses and source notes remain in the open tab only; copy them before closing or reloading. They are not graded or included in backups. Browser spell-check behavior is controlled by the device.

Only completed-check flags are stored, under `ap-french-practice-v1`. Exported backups use `ap-french-progress`, version 1. Import validates the entire file before merging true flags; it never erases completed checks. Other subject backups are rejected. Storage can be blocked or treated differently for local files; export before moving the folder or changing browsers. Quiz completion is a record of practice, not demonstrated language proficiency.

## Build and verify

```sh
python3 build.py
node validate.cjs
python3 verify_content.py
```

Source files: `template.html`, `studio.html`, `studio.js`, `progress-tools.js`, `lessons.json`, `units.json`, `frq.json`, and `favicon.svg`. `index.html` contains the compiled app and data; keep the favicon beside it.

Validation exercises all quiz submissions, navigation, completion markers, isolated storage, malformed/foreign backup rejection, vocabulary cycling, speech fallback and simulated French voice playback, timer lifecycle, script syntax, and static content structure. It does not perform visual browser QA or verify actual device audio playback.

AP is a College Board trademark. This independent toolkit is not affiliated with or endorsed by College Board.
