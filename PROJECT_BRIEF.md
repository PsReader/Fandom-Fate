# Fandom Fate — Refined Design & MVP Brief

## 1. Product summary

**Fandom Fate** is a playful, colorful website where visitors take personality quizzes across fictional fandoms and discover a character match. Its central promise is: **“Your personality. Your fandom. Your character.”** The experience should make choosing a universe exciting while keeping quiz questions clear, accessible, and easy to share.

**Primary audience:** Fans looking for a quick, low-friction personality quiz.

**Primary user journey:** Discover a fandom → start its quiz → answer one question at a time → reveal a character-style result → share it or try again.

## 2. Brand and visual direction

### Chosen direction: Retro Quiz Magazine / Fan-club Zine

The site should feel assembled by a fan with a marker and a stack of old quiz magazines—not like a polished SaaS dashboard. Keep the layouts editorial, the copy conversational, and the decoration intentionally imperfect. The quiz and result screens remain simple and readable.

- **Working name:** Fandom Fate.
- **Tagline:** “Your personality. Your fandom. Your character.”
- **Homepage headline:** “You know the story. Meet your match.”
- **Overall mood:** Warm, witty, handmade, a little nostalgic, and welcoming.
- **Palette:** Warm paper (`#F5F0E4`), ink (`#292638`), brick red (`#C95541`), slate blue (`#536889`), ochre (`#DDB653`), and dusty rose (`#C7828A`). Card surfaces use coordinated low-saturation tints.
- **Surfaces:** Flat paper-color panels with visible ink borders and small, hard offset shadows. Avoid glassmorphism, ambient glows, and gradient-heavy decoration.
- **Fandom cards:** Give the playable card a restrained accent; keep upcoming cards neutral and use text status labels so availability is never shown through color alone.
- **Typography:** Iowan/Palatino/Georgia-style editorial serif headlines, Avenir/Trebuchet/Arial body copy, and occasional Courier-style labels. No remote font dependency.
- **Spacing:** Use a narrow headline measure, generous section breaks, tighter groupings within cards, and slightly irregular editorial rhythm; keep touch controls roomy on mobile.
- **Artwork:** Original flat SVG doodles and print-like motifs. Do not use unlicensed character art, logos, or screenshots.

Use ruled dividers, a few purposeful print-like details, and the open-book mark, bookmark tab, paper-plane detail, and issue label as the visual vocabulary. Avoid repeated stickers or redundant labels. Keep question text clear and the result card screenshot-friendly.

## 3. Information architecture

1. **Home / Explore** — Introduction, calls to action, featured quizzes, and a short explanation of how the experience works.
2. **Fandom selection** — Browse fandoms and see their available quiz types; a fandom may offer more than one independent quiz.
3. **Quiz** — One question at a time, with progress and answer choices.
4. **Result** — A quiz-specific outcome (character, house, pathway, or another category), concise description, traits, and next actions.
5. **About** — A short explanation of the project and an unofficial-fan-content disclaimer.

For the MVP, these can be views within one static front end rather than separate server-rendered pages.

## 4. MVP scope

The first release should include:

- A responsive homepage with a focused hero and one clear primary action: **Explore Fandoms**.
- Eight fandom cards with nine playable quizzes: Harry Potter Character Match and House Sorting, Lord of the Mysteries Pathway Sorting, Lord of the Rings Character Match, plus character matches for Marvel, Disney, Star Wars, Stranger Things, and The Hunger Games. Further quiz formats remain roadmap items and should receive independent statuses.
- Harry Potter, Marvel, Star Wars, and Lord of the Rings each include two harder bonus dilemmas; the other quizzes retain their authored question counts.
- A progress indicator, restart/retake action, and a clear route back to the fandom list.
- A result card with a character match, short description, traits, and share action.
- Share behavior that uses native sharing when available and a copy-text/link fallback otherwise.
- Mobile-friendly layouts and keyboard-accessible controls.

The initial eight fandom cards and nine playable quizzes are selected for this release. Lord of the Mysteries (LOTM) remains the ten-question Pathway Sorting entry; the expanded catalog also includes a ten-question Lord of the Rings Character Match, plus character-match quizzes for Marvel, Disney, Star Wars, Stranger Things, and The Hunger Games. Harry Potter, Marvel, Star Wars, and Lord of the Rings place their harder bonus dilemmas at the end of the quiz.

## 5. Page requirements

### Home / Explore

- A compact header with a text or original icon logo and navigation links for **Fandoms**, **How it works**, and **About**.
- Hero headline and subtitle from the brand section above, followed by one primary **Explore Fandoms** action.
- Fandom cards show a title, brief description, and availability. Use **Start Quiz** for one playable quiz; when a fandom offers multiple types, use **View Quizzes** to open its selector.
- A short three-step “How it works” section.
- Footer with a brief unofficial-fan-content disclaimer. Treat social links as optional until real destinations are supplied.

### Fandom selection

- Show the six initial cards in a responsive grid. Category filters are optional until the catalog grows enough to justify them.
- Each card includes a title, short description, and quiz availability. When a fandom has multiple quiz types, open a fandom hub listing each type and its status; with one playable quiz, a direct **Start Quiz** action is appropriate.
- Give the playable quiz a visible start action; make coming-soon cards non-deceptive and non-interactive or clearly labeled.
- Support long titles and descriptions without clipping or breaking the layout.

### Quiz

- Display the fandom name, question number (for example, “3 of 8”), and a progress bar.
- Present exactly one short question at a time.
- Use large, clearly labelled answer controls. Stack them on narrow screens; use a balanced grid on wider screens where it improves scanning.
- Make keyboard focus visible and ensure controls are operable by keyboard and touch.
- After selection, provide brief visual feedback before advancing. Respect reduced-motion preferences.
- Provide a clear way to restart or return to fandom selection without accidentally losing progress.

### Result

- Lead with quiz-type-appropriate copy (“You are…”, “Your house is…”, “Your Pathway is…”) and a prominent outcome.
- Include a short personality description and a small set of trait labels.
- Provide **Share My Result** and **Try Again** actions, plus a clear **Explore Fandoms** route back to the list.
- Use an original illustration, abstract motif, or text-led design—never assume licensed character imagery is available.
- Use the Web Share API when available; otherwise provide a copy-link or copy-result-text fallback with clear success feedback.
- Keep the main result content self-contained and screenshot-friendly; avoid dense navigation inside the result card.

A character-match percentage or comparison chart is optional, not a core MVP requirement. If used, define exactly what it measures (for example, a normalized match score based on quiz answers); do not present scores as statistical certainty or show unexplained percentages that may confuse users.

## 6. Quiz content and scoring

Keep quiz content separate from presentation code. The future catalog should model `fandoms[]` as parent entries, each owning a `quizzes[]` collection of independent quiz types. Each quiz entry should define:

- Stable quiz ID, parent fandom ID, display title, quiz type (for example, character match, house sorting, or pathway affinity), and availability status
- Short description and category
- Accent color and original visual treatment (optional)
- Question list and answer options
- Scoring or outcome mapping
- Outcome definitions: outcome type and name (character, house, pathway, or other), description, traits, and optional original artwork reference

Each answer contributes points toward one or more outcomes. The highest score determines the result. Ties must follow a deterministic, documented rule so repeated attempts do not produce surprising changes. Write original questions and result descriptions; do not reproduce substantial passages or character quotes from source works without appropriate rights.

## 7. Interaction and behavior

- **Explore Fandoms** opens the fandom list.
- If a fandom has one playable quiz, it may launch directly; when a fandom offers multiple types, open a quiz selector for that fandom. The current one-quiz release omits a random-quiz action; if one is ever added, it must choose only from playable quizzes.
- Quiz progress updates after each accepted answer.
- The same answer set produces the same outcome.
- **Try Again** resets answers for the current fandom. The result-view back link returns to the fandom selection view.
- Use short, restrained transitions. Provide an equivalent non-animated experience when `prefers-reduced-motion` is enabled.

## 8. MVP technical scope

- Static front end using HTML, CSS, and client-side JavaScript.
- No accounts, database, or server-side quiz processing in the first version.
- Store quiz definitions as local data files or equivalent static data.
- Keep answers in the current browser session; do not add persistent quiz history or favorites in the MVP.
- Local storage for favorites or completed-quiz history is a possible later enhancement, not a release requirement.
- Make sharing degrade gracefully when browser sharing features are unavailable.
- Do not include social destinations, external analytics, or third-party integrations until they are chosen and configured.

## 9. Accessibility and responsive behavior

- Maintain readable text contrast on dark surfaces.
- Use semantic headings, buttons, links, and form controls.
- Ensure all functionality is keyboard accessible, with an obvious focus indicator.
- Give controls generous touch targets and clear selected/disabled states.
- Do not encode question meaning, progress, or results through color alone.
- Respect reduced-motion settings; animation must not be required to understand state changes.
- Check layouts at narrow mobile, tablet, and desktop widths.
- Ensure long labels, translated text, and zoomed text do not overflow or become inaccessible.

## 10. Acceptance criteria

The MVP is ready for review when:

1. The homepage communicates the Fandom Fate concept and offers one clear route to the fandom list.
2. Six fandom cards are visible; one leads to a complete playable quiz and the others are clearly marked unavailable/coming soon.
3. The playable quiz contains 8–10 questions and 4–6 possible outcomes.
4. Quiz progress, answer selection, restart, retake, and return-to-selection behave predictably.
5. Different answer combinations can produce the intended different results; ties follow a stable rule.
6. Sharing works where supported and has a usable fallback elsewhere.
7. Home, selection, quiz, and result views remain usable at mobile and desktop sizes.
8. Buttons and links have clear hover, focus, active, and disabled states where applicable.
9. The experience remains understandable with keyboard navigation, reduced motion, and without color-dependent cues.
10. Long fandom names and result descriptions do not break the layout.
11. No unlicensed official character images, logos, screenshots, or substantial copied text are included.

## 11. Planned expansion: multiple quizzes per fandom

The next catalog step is to let a fandom host several independent quiz formats—not to make every quiz another character match. Proposed examples:

- **Harry Potter:** the current “Which character are you?” quiz, plus a future “Which Hogwarts house are you?” quiz.
- **Lord of the Mysteries (LOTM):** a future “Which Pathway are you?” quiz.

Each quiz should have its own title, type, questions, scoring, outcome vocabulary, and availability status. A fandom can contain both live and in-development quizzes. The local prototype now includes the reusable quiz shelf and quiz selection by ID: Harry Potter shows playable Character Match and House Sorting quizzes, and Lord of the Mysteries is listed as a playable fandom with its Pathway Sorting quiz. The gameplay runtime keeps each quiz definition independent while sharing the question, scoring, result, and sharing views.

## 12. Later enhancements

After the multi-quiz catalog, consider daily featured quizzes, cross-fandom profiles, favorites, result history, user-created quizzes, theme switching, sound effects, animated result reveals, leaderboards, durable share URLs, fan-art galleries, and community voting.

## 13. Current implementation choices

1. The current catalog has seven fandom cards and eight playable quizzes: Harry Potter opens a quiz shelf with Character Match and House Sorting; Lord of the Mysteries has Pathway Sorting; Marvel, Disney, Star Wars, Stranger Things, and The Hunger Games each have a playable Character Match quiz.
2. The character-match quizzes have eight questions and five outcomes each; Harry Potter retains six outcomes, House Sorting has four Houses, and Pathway Sorting has eight Pathways. Scoring and deterministic tie-breaking are in `quiz-data.js`.
3. `fandoms[].quizzes[]` currently supplies the selector's per-type labels, descriptions, and statuses. The gameplay runtime still loads one `data.quiz` object; when adding another playable quiz, move its questions, scoring, and outcomes into an independent quiz entry.
4. The homepage uses one primary **Explore Fandoms** action. A random-quiz action remains intentionally omitted; the catalog now has several explicitly selectable quizzes.
5. Result sharing uses browser sharing when available and a copy-text fallback; no durable result URLs are generated.
6. No social destinations, accounts, analytics, database, or persistent quiz history are included.
7. The site remains an unofficial fan-made concept with original copy and artwork and a visible rights disclaimer.
