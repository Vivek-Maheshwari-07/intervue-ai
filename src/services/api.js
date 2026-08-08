/**
 * API service module — all backend communication goes through here.
 * Base URL is read from VITE_API_URL environment variable.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Start a new interview session by sending an empty answer.
 * @param {string} sessionId  — unique session identifier
 * @param {string} candidateId — candidate identifier
 * @returns {Promise<object>} — interview response with first question
 */
export async function startInterview(sessionId, candidateId) {
  const response = await fetch(`${API_BASE}/api/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      candidateId,
      answer: '',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to start interview' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Submit an answer and receive the next question or final feedback.
 * @param {string} sessionId
 * @param {string} candidateId
 * @param {string} answer
 * @returns {Promise<object>}
 */
export async function submitAnswer(sessionId, candidateId, answer) {
  const response = await fetch(`${API_BASE}/api/interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      candidateId,
      answer,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to submit answer' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Health check — verify backend is reachable.
 * @returns {Promise<object>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend unreachable');
  return response.json();
}
