# EC X-ray Quiz

Live multiple-choice quiz for teaching sessions. Candidates answer on their phones; the host locks, reveals and tracks scores in real time. Images and reveal animations stay in the Canva deck.

## Pages
- `index.html` — candidate page (join with group name, tap A–D)
- `host.html` — host control panel (PIN protected): lock / reveal / next, submission ticks, leaderboard, QR join code, answer key, new session
- `board.html` — full-screen leaderboard for a projector

## Backend
Supabase project "EC Xray Quiz" (`config.js`). All writes go through PIN-checked database functions; the answer key is never sent to candidates until revealed.

## Per-question flow
Candidates answer → **Lock** → advance Canva to the answer → **Reveal** → **Next**.
