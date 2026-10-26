// Shared, UI-free rules for the live session (used by host.html and the tests).
// The state comes straight from quiz_state; nothing here changes it.
(function (root) {
  // Question status, derived from the existing flags
  function questionStatus(st, timeUp) {
    if (st.ended) return 'ended';
    if (st.revealed) return 'revealed';
    if (st.locked) return st.question_opened_at ? 'locked' : 'waiting';
    return timeUp ? 'timeup' : 'open';
  }
  const STATUS_LABEL = { waiting: 'Not opened', open: 'Accepting answers', timeup: 'Time up', locked: 'Answers locked', revealed: 'Answers revealed', ended: 'Session ended' };

  // The one thing the host should do next. `hasKey` = an answer key exists for this question.
  function primaryAction(st, hasKey, timeUp) {
    const s = questionStatus(st, timeUp), last = st.current_question >= st.total_questions;
    if (s === 'ended') return { id: 'newround', label: 'Start new round', kind: 'secondary' };
    if (s === 'waiting') return { id: 'open', label: 'Open question', kind: 'primary' };
    if (s === 'open') return { id: 'lock', label: 'Lock answers', kind: 'primary' };
    if (s === 'timeup' || s === 'locked') {
      if (!hasKey) return { id: 'reveal', label: 'Reveal answer', kind: 'primary', disabled: true, reason: 'No answer key for this question' };
      return { id: 'reveal', label: 'Reveal answer', kind: 'primary' };
    }
    // revealed
    if (last) return { id: 'endsess', label: 'Finish & show results', kind: 'primary' };
    return { id: 'next', label: 'Next question', kind: 'primary' };
  }

  // Legitimate but secondary actions for the current state
  function secondaryActions(st, hasKey, timeUp) {
    const s = questionStatus(st, timeUp), out = [];
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

  const api = { questionStatus, STATUS_LABEL, primaryAction, secondaryActions, resultsSummary };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.SessionLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
