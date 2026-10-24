# QuizApp

Live multiple-choice quiz for teaching sessions. Candidates answer on their phones; the host opens each question, a timer runs, answers are scored by speed, and the host reveals the answer and tracks a live leaderboard. Question content (images, options, reveal animations) lives in whatever slide deck you present — this app only handles answers and scoring.

## Pages
- `index.html` — candidate page: join with your name, tap A–D, submit
- `host.html` — host control panel (PIN protected): open / lock / reveal / next, timer, scoring mode, quiz title, answer key, new session, end session, QR join code
- `board.html` — full-screen leaderboard for a projector

## Backend
Supabase (`config.js`). All writes go through PIN-checked database functions; the answer key is never sent to candidates until revealed. Tables: `quiz_state`, `players`, `answers`, `answer_key`, `host_config`.

## Scoring
Speed mode: first correct answer 100 pts, then 90, 80 … (minimum 50). Flat mode: 100 per correct answer. Wrong or no answer: 0.

## Per-question flow
Show the question in your deck → **Open question** (timer starts) → candidates submit → **Reveal** → advance deck → **Next**.
