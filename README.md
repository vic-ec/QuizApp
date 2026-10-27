# QuizApp

Live multiple-choice quiz for teaching sessions. Candidates answer on their phones; the host opens each question, a timer runs, answers are scored by speed, and the host reveals the answer and tracks a live leaderboard. Question content (images, options, reveal animations) lives in whatever slide deck you present — this app only handles answers and scoring.

## Pages
- `index.html` — landing page: Join a quiz / Host login
- `play/index.html` — candidate page: join with your name and avatar, tap A–D, submit
- `host.html` — host app (PIN protected): **My quizzes** (create / edit / play saved quizzes with name, question count, timer, scoring and answer key), **Live session** (open / lock / reveal / next, candidates table that doubles as the leaderboard, new round, end session, floating remote) and **Settings** (PIN)
- `join.html` — full-screen QR code and link for a second display, so the host page stays private
- `board.html` — full-screen leaderboard for a projector

## Backend
Supabase (`config.js`). All writes go through PIN-checked database functions; the answer key is never sent to candidates until revealed. Tables: `quizzes` (saved quizzes incl. answer key), `quiz_state` (the one live session), `players`, `answers`, `host_config`.

## Scoring
Speed mode: first correct answer gets the top score, each later correct answer gets *step* fewer, never below the minimum (default 100, −5, min 10). Flat mode: a fixed score per correct answer (default 100). The rule is stored in `quiz_state` and edited in **Settings → Scoring rule**; candidates see it on the join screen. Ties are broken by the lower total answer time on correct answers. Wrong or no answer: 0.

## Per-question flow
Show the question in your deck → **Open question** (timer starts) → candidates submit → **Reveal** → advance deck → **Next**.
