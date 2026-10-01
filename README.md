# Fandom Fate

A no-build, static fandom personality quiz website. The visual direction is a handmade retro quiz zine: warm paper, ink borders, cutout-like color blocks, original book doodles, and conversational copy. It uses plain HTML, CSS, and JavaScript with no runtime dependencies or external image/font requests. The complete stylesheet is embedded in `index.html`.

## Run locally

Open `index.html` in a modern browser. If your browser restricts clipboard sharing for `file://` pages, the result screen still shows the result; serve the folder with any static file server to enable secure-context browser features such as Clipboard API.

## What's included

- Responsive home page with a custom zine-cover illustration, eight fandom cards, and a reusable quiz-shelf view for multi-quiz fandoms.
- Seventeen playable quizzes with 182 total questions: Harry Potter Character Match and House Sorting now include two harder bonus dilemmas each; Lord of the Mysteries Pathway Sorting and Lord of the Rings Character Match have ten questions; Marvel and Star Wars have ten questions with bonus dilemmas; Disney, Stranger Things, and The Hunger Games have eight questions.
- Eight fandom cards, all with at least two playable quizzes.
- Each fandom now has a customized theme across its quiz shelf, question screen, and result card: its own palette, editorial label, tagline, motif, and mark.
- Result sharing generates a themed PNG card for native file sharing, download, and social composer fallbacks for X, Facebook, and WhatsApp.
- Fandom-specific synthesized ambience and answer/result sound cues use the Web Audio API, with a visible Sound on/off control and no external audio files.
- The Harry Potter quiz shelf includes both playable Character Match and House Sorting quizzes; the original House Sorting questions and scoring are documented in `MULTI-QUIZ-SHELF-AND-HOUSE-SORTING-DRAFT.md`.
- Lord of the Mysteries is now playable from its **Start quiz** card action; its original ten-question Pathway Sorting draft, starter outcome set, and tie-break logic are documented in `LORD-OF-THE-MYSTERIES-PATHWAY-SORTING-DRAFT.md`.
- Deterministic scoring and a stable tie-break (the first result in `quiz-data.js` wins ties).
- Return-to-fandoms, restart/retake, reduced-motion, keyboard-focus, and share/copy fallback behavior.
- Original open-book brand mark with a bookmark tab, paper-plane detail, issue label, and editorial rules; no third-party assets are required at runtime.

## Customize

Edit the `<style>` block in `index.html` to adjust visuals. Edit `quiz-data.js` to change fandom cards, quiz-shelf labels and statuses, questions, answer mappings, outcome descriptions, and traits. The shelf can list several quiz types per fandom, and the gameplay runtime can select the active quiz definition by quiz ID. All seventeen currently listed quizzes are playable, and each now includes two advanced deep-dive questions.

All descriptions and quiz questions are original. The site uses franchise and character names only to identify fan quiz topics and outcomes; it does not include official character artwork, logos, or source-work quotes. Fandom Fate is an unofficial fan-made concept and is not affiliated with or endorsed by any franchise or rights holder. Review public-facing content and rights considerations before public release.

## Project files

- `index.html` — page structure, views, zine-cover SVG, and embedded stylesheet
- `quiz-data.js` — fandom, question, and result content
- `app.js` — rendering, navigation, scoring, and sharing
- `assets/brand-mark.svg` — original site mark and favicon
- `ideas.md` — visual direction and brand voice
- `PROJECT_BRIEF.md` — product scope and acceptance criteria
- `MULTI-QUIZ-SHELF-AND-HOUSE-SORTING-DRAFT.md` — selector layout, original House Sorting question set, scoring, and tie-break draft
- `LORD-OF-THE-MYSTERIES-PATHWAY-SORTING-DRAFT.md` — selector layout, original Pathway Sorting questions, outcome set, and tie-break draft
- `QUIZ-CONTENT-FACT-CHECK.md` — canon-scope notes and validation checklist for the expanded fandom outcomes and bonus rounds
- `robots.txt` — public crawl policy; add the real sitemap URL after choosing the domain
- `404.html` — static-host not-found fallback
- `HOSTING-AND-SEO-SETUP.md` — upload instructions and the domain-specific Google Search Console checklist
