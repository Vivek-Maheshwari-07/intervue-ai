import { useState, useCallback } from 'react';
import { startInterview, submitAnswer } from '../services/api';

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useInterview() {
  const [sessionId, setSessionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'starting' | 'active' | 'submitting' | 'completed' | 'error'
  const [error, setError] = useState(null);

  // Question & Session details
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [topicsCovered, setTopicsCovered] = useState(0);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Adaptive Signal
  const [adaptiveSignal, setAdaptiveSignal] = useState(null);

  // Final Assessment Feedback
  const [feedback, setFeedback] = useState(null);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState('');

  // Start interview session
  const startSession = useCallback(async (targetCandidateId) => {
    const trimmedId = (targetCandidateId || '').trim();
    if (!trimmedId) {
      setError('Please select or enter a valid Candidate ID.');
      return;
    }

    const newSessionId = generateSessionId();
    setCandidateId(trimmedId);
    setSessionId(newSessionId);
    setStatus('starting');
    setError(null);
    setFeedback(null);
    setAdaptiveSignal(null);

    try {
      const data = await startInterview(newSessionId, trimmedId);

      setCurrentQuestion(data.question || '');
      // Infer topic from response or history
      const hist = data.conversationHistory || [];
      const lastTurn = hist.length > 0 ? hist[hist.length - 1] : null;
      setCurrentTopic(lastTurn?.topic || 'General Technical');

      setQuestionNumber(data.questionNumber || 1);
      setTotalQuestions(data.totalQuestions || 8);
      setTopicsCovered(data.topicsCovered || 0);
      setCoveredTopics(data.coveredTopics || []);
      setConversationHistory(hist);
      setStatus('active');
    } catch (err) {
      setError(err.message || 'Could not initiate session with AI Interviewer.');
      setStatus('error');
    }
  }, []);

  // Submit candidate answer
  const sendAnswer = useCallback(async (answerText) => {
    const trimmed = (answerText || '').trim();
    if (!trimmed || !sessionId || !candidateId) return;

    setLastSubmittedAnswer(trimmed);
    setStatus('submitting');
    setError(null);

    try {
      const data = await submitAnswer(sessionId, candidateId, trimmed);

      if (data.adaptiveSignal) {
        setAdaptiveSignal(data.adaptiveSignal);
      }

      if (data.status === 'completed') {
        setFeedback(data.feedback || {});
        setQuestionNumber(data.questionNumber || questionNumber);
        setTopicsCovered(data.topicsCovered || topicsCovered);
        setCoveredTopics(data.coveredTopics || coveredTopics);
        setConversationHistory(data.conversationHistory || conversationHistory);
        setStatus('completed');
      } else {
        setCurrentQuestion(data.question || '');
        const hist = data.conversationHistory || [];
        const lastTurn = hist.length > 0 ? hist[hist.length - 1] : null;
        setCurrentTopic(lastTurn?.topic || 'General Technical');

        setQuestionNumber(data.questionNumber || questionNumber + 1);
        setTotalQuestions(data.totalQuestions || 8);
        setTopicsCovered(data.topicsCovered || topicsCovered);
        setCoveredTopics(data.coveredTopics || coveredTopics);
        setConversationHistory(hist);
        setStatus('active');
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate response. Please check backend connection.');
      setStatus('error');
    }
  }, [sessionId, candidateId, questionNumber, totalQuestions, topicsCovered, coveredTopics, conversationHistory]);

  // Retry last failed action
  const retry = useCallback(async () => {
    if (status === 'error' && lastSubmittedAnswer) {
      await sendAnswer(lastSubmittedAnswer);
    } else if (candidateId) {
      await startSession(candidateId);
    }
  }, [status, lastSubmittedAnswer, candidateId, sendAnswer, startSession]);

  // Reset interview
  const resetSession = useCallback(() => {
    setSessionId('');
    setCandidateId('');
    setStatus('idle');
    setError(null);
    setCurrentQuestion('');
    setCurrentTopic('');
    setQuestionNumber(1);
    setTotalQuestions(8);
    setTopicsCovered(0);
    setCoveredTopics([]);
    setConversationHistory([]);
    setFeedback(null);
    setAdaptiveSignal(null);
    setLastSubmittedAnswer('');
  }, []);

  return {
    sessionId,
    candidateId,
    status,
    error,
    currentQuestion,
    currentTopic,
    questionNumber,
    totalQuestions,
    topicsCovered,
    coveredTopics,
    conversationHistory,
    adaptiveSignal,
    feedback,
    isSubmitting: status === 'submitting' || status === 'starting',
    startSession,
    sendAnswer,
    retry,
    resetSession,
  };
}
