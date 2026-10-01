# Fandom Quiz Shelf & Harry Potter House Sorting — Design Draft

**Status:** The reusable quiz-shelf view is now part of the local site prototype. House Sorting is now playable from the Harry Potter quiz shelf using the question set and scoring below.

## 1. Quiz-shelf page layout

### Purpose
A fandom is the parent destination; its quiz types are separate choices underneath it. The same page pattern should work for Harry Potter, a future Lord of the Mysteries (LOTM) page, and other fandoms without changing the overall layout.

### Page hierarchy
1. **Back link and fandom label** — “All fandoms” on the left; the selected fandom and “quiz shelf” on the right.
2. **Page heading** — “Choose your quiz.” Follow with one short line explaining that a fandom can offer different kinds of results.
3. **Quiz-type cards** — one card per quiz, ordered playable first and upcoming second.
4. **Availability** — each card states its status in text. Only a playable quiz gets an action button.

### Wireframe

```text
← All fandoms                                      HARRY POTTER / QUIZ SHELF

HARRY POTTER / QUIZ SHELF
Choose your quiz.
One fandom, a few different ways to find your place in it.

┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ CHARACTER MATCH          READY   │  │ HOUSE SORTING      IN THE WORKS │
│                                  │  │                                  │
│ Who are you in the Wizarding     │  │ Which Hogwarts house are you?   │
│ World?                           │  │                                  │
│ Eight quick choices reveal a    │  │ A values-first sort through how  │
│ character match.                │  │ you think and show up for people.│
│                                  │  │                                  │
│ 8 QUESTIONS        [START QUIZ]  │  │ 8-QUESTION DRAFT                │
└──────────────────────────────────┘  └──────────────────────────────────┘

THE SHORT VERSION / Only quizzes marked ready can be started.
```

### Interaction rules
- A fandom card on the home page uses **View quizzes** when that fandom has multiple quiz types. The current Harry Potter card uses this route.
- A fandom with only one playable quiz may keep a direct **Start quiz** action.
- On the shelf, **Start quiz** launches the selected playable quiz. Upcoming entries show their status and metadata but no disabled or fake action button.
- Back link, Escape, and the site navigation return to the fandom list. Opening the shelf moves keyboard focus to its heading.
- Show quiz type, title, one-sentence description, and short metadata. Avoid percentages, redundant status labels, and extra filters until the catalog actually needs them.
- Use a two-column card grid on wide screens and a single column on narrow screens. Keep the playable card subtly accented and upcoming cards neutral, with status stated in text.
- Reuse the same structure for LOTM; its future card could be **Pathway sorting**, with its own status and questions.

## 2. Harry Potter House Sorting — question draft

### Principles
- Original fan-made wording; no copied quiz questions, official quotes, or franchise artwork.
- Ask about choices and behavior, not which House sounds coolest. All four answer choices should read as reasonable strengths.
- Keep the House mapping hidden during the quiz and do not show a match percentage. Present the result as a playful closest fit, not an official or scientific classification.
- Each of the eight scored questions has exactly one answer for each House. Answer positions rotate in a balanced pattern so no House is repeatedly associated with A, B, C, or D.

### Questions

#### 1. Your team is stuck before a deadline. What do you do first?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Volunteer to make the first attempt, even if the plan is not perfect yet. | Gryffindor |
| B | Check what everyone can take on, then get the whole group moving. | Hufflepuff |
| C | Reframe the problem and suggest an approach nobody has tried. | Ravenclaw |
| D | Set a clear goal and organize the most direct route to it. | Slytherin |

#### 2. A rule makes a process unfair for someone. What is your first move?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Listen to the people affected and work toward a fairer process. | Hufflepuff |
| B | Find out why the rule exists and gather evidence for changing it. | Ravenclaw |
| C | Identify who can change it and make a practical case. | Slytherin |
| D | Name what feels unfair and stand beside the person affected. | Gryffindor |

#### 3. You have an unplanned afternoon in a new place. What sounds best?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Follow a question into a museum, bookshop, or unfamiliar corner. | Ravenclaw |
| B | Choose a personal challenge and plan a route to make the most of it. | Slytherin |
| C | Take an interesting side street and see where it leads. | Gryffindor |
| D | Find a welcoming local spot and get to know the people there. | Hufflepuff |

#### 4. A friend trusts you with a risky idea. How do you help?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Turn the idea into steps, resources, and a clear target. | Slytherin |
| B | Encourage them not to let fear make the decision for them. | Gryffindor |
| C | Help them build support and think through who else is affected. | Hufflepuff |
| D | Ask what they hope to learn and what assumptions they want to test. | Ravenclaw |

#### 5. A puzzle has no instructions and everyone has a different theory. What is your instinct?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Try the boldest theory and learn from what happens. | Gryffindor |
| B | Make sure each idea is heard, then combine the useful parts. | Hufflepuff |
| C | Study the clues for a pattern that explains the puzzle. | Ravenclaw |
| D | Choose the experiment most likely to move the group forward. | Slytherin |

#### 6. A plan falls apart halfway through. What is your next move?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Check who needs help and rebalance the responsibilities. | Hufflepuff |
| B | Step back, work out what changed, and rethink the approach. | Ravenclaw |
| C | Find an alternative route that still reaches the goal. | Slytherin |
| D | Make a quick call and get everyone moving again. | Gryffindor |

#### 7. Which compliment would mean the most to you?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | “You ask questions that reveal connections other people miss.” | Ravenclaw |
| B | “You turn a difficult goal into real progress.” | Slytherin |
| C | “You stand up when something important is at stake.” | Gryffindor |
| D | “People know they can count on you.” | Hufflepuff |

#### 8. What lasting difference would you most like to make in a group you care about?
| Choice | Player-facing answer | Hidden House mapping |
| --- | --- | --- |
| A | Turn a bold shared goal from an idea into a reality. | Slytherin |
| B | Help people find the courage to speak up when it matters. | Gryffindor |
| C | Make the group fairer, kinder, and easier to rely on. | Hufflepuff |
| D | Leave people with new ideas and better questions. | Ravenclaw |

## 3. Sorting logic

### Main score
Initialize each House score to zero. For each of the eight answers, add **1 point** to the mapped House. The House with the highest score is the result if it is the sole leader. Each answer is one vote; no House receives a hidden global advantage.

```text
scores = {Gryffindor: 0, Hufflepuff: 0, Ravenclaw: 0, Slytherin: 0}
for answer in answers:
    scores[answer.house] += 1
leaders = houses whose score equals max(scores)
if leaders has one house:
    return that house
else:
    ask the tie-break question using only leaders
    return the house mapped to the selected tie-break answer
```

### Adaptive tie-break
If two or more Houses share the top score, ask one additional question: **“When two good choices pull you in different directions, what would you most want people to count on you for?”** Show only the options belonging to the tied Houses, in a neutral order:

| Hidden House mapping | Tie-break answer |
| --- | --- |
| Gryffindor | Facing the difficult moment with courage. |
| Hufflepuff | Helping people feel supported and included. |
| Ravenclaw | Finding a new perspective that changes the question. |
| Slytherin | Turning a clear ambition into a plan and following through. |

The player chooses one value, which resolves the tie directly; it does not add a second round of points. If there is no tie, do not show this extra question. Label the quiz as **8 questions** and disclose in the intro that a short follow-up appears only for a tie.

### Outcome voice
- **Gryffindor — Courage & initiative:** willing to act when people or principles need defending; courage does not mean being fearless.
- **Hufflepuff — Fairness & follow-through:** helps people feel valued and builds trust through steady effort.
- **Ravenclaw — Curiosity & originality:** asks useful questions, sees patterns, and makes room for fresh ideas.
- **Slytherin — Ambition & resourcefulness:** keeps a goal in view and adapts the route to make meaningful progress; ambition is not framed as selfishness.

## 4. Implementation notes

The House Sorting card is now marked **Ready** in the selector. Its questions and House-result definitions are stored as an independent `house-sorting` entry under `additionalQuizzes` in `quiz-data.js`. It uses the shared quiz engine and deterministic authored-result order for ties; the existing character-match quiz remains unchanged.
