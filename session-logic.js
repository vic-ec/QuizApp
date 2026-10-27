// Shared, UI-free rules for the live session (used by host.html and the tests).
// The state comes straight from quiz_state; nothing here changes it.
(function (root) {
  // Question status, derived from the existing flags
  // `startsIn` = seconds until question_opened_at (positive while the "Start quiz" countdown runs)
  function questionStatus(st, timeUp, startsIn) {
    if (st.ended) return 'ended';
    if (st.revealed) return 'revealed';
    if (st.locked) return st.question_opened_at ? 'locked' : 'waiting';
    if (startsIn > 0) return 'countdown';
    return timeUp ? 'timeup' : 'open';
  }
  const STATUS_LABEL = { waiting: 'Not opened', countdown: 'Starting…', open: 'Accepting answers', timeup: 'Time up', locked: 'Answers locked', revealed: 'Answers revealed', ended: 'Session ended' };
  // The very first open of question 1 is "Start quiz" (and gets the countdown)
  const isStart = (st) => st.current_question === 1 && !st.question_opened_at && !st.revealed && !st.ended;

  // The one thing the host should do next. `hasKey` = an answer key exists for this question.
  function primaryAction(st, hasKey, timeUp, startsIn) {
    const s = questionStatus(st, timeUp, startsIn), q = st.current_question, last = q >= st.total_questions;
    if (s === 'ended') return { id: 'newround', label: 'Start new round', kind: 'secondary' };
    if (s === 'waiting') return isStart(st) ? { id: 'open', label: 'Start quiz', kind: 'primary', start: true } : { id: 'open', label: 'Open question ' + q, kind: 'primary' };
    if (s === 'countdown') return { id: 'lock', label: 'Starts in ' + Math.ceil(startsIn) + '…', kind: 'primary', disabled: true, countdown: true };
    if (s === 'open') return { id: 'lock', label: 'Lock Q' + q + ' answers', kind: 'primary' };
    if (s === 'timeup' || s === 'locked') {
      if (!hasKey) return { id: 'reveal', label: 'Reveal Q' + q + ' answer', kind: 'primary', disabled: true, reason: 'No answer key for this question' };
      return { id: 'reveal', label: 'Reveal Q' + q + ' answer', kind: 'primary' };
    }
    // revealed
    if (last) return { id: 'endsess', label: 'Finish & show results', kind: 'primary' };
    return { id: 'next', label: 'Next question', kind: 'primary' };
  }

  // Legitimate but secondary actions for the current state
  function secondaryActions(st, hasKey, timeUp, startsIn) {
    const s = questionStatus(st, timeUp, startsIn), out = [];
    if (s === 'countdown') return out;
    if (s === 'open' && hasKey) out.push({ id: 'reveal', label: 'Reveal now' });
    if (s === 'open' || s === 'timeup' || s === 'locked') out.push({ id: 'open', label: s === 'open' ? 'Restart timer' : 'Reopen question' });
    return out;
  }

  // Results after a reveal. `answers` = this question's answers keyed by player; `players` = everyone in the session.
  function resultsSummary(players, answers, correct) {
    const dist = {};
    let answered = 0, right = 0;
    players.forEach(function (p) {
      const a = answers[p]; if (!a) return;
      answered++; dist[a.choice] = (dist[a.choice] || 0) + 1;
      if (a.is_correct === true) right++;
    });
    const total = players.length;
    return { correct: correct, answered: answered, right: right, total: total, pct: total ? Math.round(100 * right / total) : 0, dist: dist };
  }

  const START_COUNTDOWN = 5;   // seconds between "Start quiz" and question 1 opening
  const api = { questionStatus, STATUS_LABEL, primaryAction, secondaryActions, resultsSummary, isStart, START_COUNTDOWN };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SessionLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
