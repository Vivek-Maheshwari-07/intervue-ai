/**
 * API service module — backend communication handler for Intervue AI.
 * Base URL is read from VITE_API_URL environment variable.
 * Aligned with the public Technical Specification contract while supporting dual-mapping.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Start a new interview session.
 * @param {string} sessionId — unique session identifier
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
      candidate: { id: candidateId, candidate_id: candidateId },
      answer: '',
      message: '',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to start interview session' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Submit an answer turn and receive the next question or final feedback.
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
      message: answer,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to submit candidate response' }));
    throw new Error(err.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Health check — verify backend availability.
 * @returns {Promise<object>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend server unreachable');
  return response.json();
}
