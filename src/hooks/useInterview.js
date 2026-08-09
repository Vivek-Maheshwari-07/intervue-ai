import { useState, useCallback } from 'react';
import { startInterview, submitAnswer } from '../services/api';

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useInterview() {
  const [sessionId, setSessionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'starting' | 'active' | 'submitting' | 'completed' | 'error'
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  // Question & Session details
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [topicsCovered, setTopicsCovered] = useState(0);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [coveredDays, setCoveredDays] = useState([]);
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
    setLoadingMessage('Starting your personalized AI technical interview...');
    setError(null);
    setFeedback(null);
    setAdaptiveSignal(null);

    try {
      const data = await startInterview(newSessionId, trimmedId);

      const firstQ = data.reply || data.question || '';
      setCurrentQuestion(firstQ);

      const hist = data.conversationHistory || [];
      const lastTurn = hist.length > 0 ? hist[hist.length - 1] : null;
      setCurrentTopic(data.topic || lastTurn?.topic || 'General Technical');

      setQuestionNumber(data.questionNumber || data.question_count || 1);
      setTotalQuestions(data.totalQuestions || 8);
      setTopicsCovered(data.topicsCovered || data.covered_topics_count || 0);
      setCoveredTopics(data.coveredTopics || data.covered_topics || []);
      setCoveredDays(data.coveredDays || data.covered_days || []);
      setConversationHistory(hist);
      setStatus('active');
    } catch (err) {
      setError(err.message || 'Could not initiate session with AI Interviewer.');
      setStatus('error');
    } finally {
      setLoadingMessage('');
    }
  }, []);

  // Submit candidate answer
  const sendAnswer = useCallback(async (answerText) => {
    const trimmed = (answerText || '').trim();
    if (!trimmed || !sessionId || !candidateId) return;

    setLastSubmittedAnswer(trimmed);
    setStatus('submitting');
    setLoadingMessage('Analyzing your response & generating adaptive follow-up...');
    setError(null);

    try {
      const data = await submitAnswer(sessionId, candidateId, trimmed);

      if (data.adaptiveSignal) {
        setAdaptiveSignal(data.adaptiveSignal);
      }

      const isCompleted = data.done === true || data.status === 'completed';

      if (isCompleted) {
        setFeedback(data.feedback || {});
        setQuestionNumber(data.questionNumber || data.question_count || questionNumber);
        setTopicsCovered(data.topicsCovered || topicsCovered);
        setCoveredTopics(data.coveredTopics || coveredTopics);
        setCoveredDays(data.coveredDays || data.covered_days || coveredDays);
        setConversationHistory(data.conversationHistory || conversationHistory);
        setStatus('completed');
      } else {
        const nextQ = data.reply || data.next_question || data.question || '';
        setCurrentQuestion(nextQ);
        const hist = data.conversationHistory || [];
        const lastTurn = hist.length > 0 ? hist[hist.length - 1] : null;
        setCurrentTopic(data.topic || lastTurn?.topic || currentTopic || 'General Technical');

        setQuestionNumber(data.questionNumber || data.question_count || questionNumber + 1);
        setTotalQuestions(data.totalQuestions || 8);
        setTopicsCovered(data.topicsCovered || data.covered_topics_count || topicsCovered);
        setCoveredTopics(data.coveredTopics || data.covered_topics || coveredTopics);
        setCoveredDays(data.coveredDays || data.covered_days || coveredDays);
        setConversationHistory(hist);
        setStatus('active');
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate response. Please check backend connection.');
      setStatus('error');
    } finally {
      setLoadingMessage('');
    }
  }, [sessionId, candidateId, questionNumber, totalQuestions, topicsCovered, coveredTopics, coveredDays, conversationHistory, currentTopic]);

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
    setLoadingMessage('');
    setError(null);
    setCurrentQuestion('');
    setCurrentTopic('');
    setQuestionNumber(1);
    setTotalQuestions(8);
    setTopicsCovered(0);
    setCoveredTopics([]);
    setCoveredDays([]);
    setConversationHistory([]);
    setFeedback(null);
    setAdaptiveSignal(null);
    setLastSubmittedAnswer('');
  }, []);

  return {
    sessionId,
    candidateId,
    status,
    loadingMessage,
    error,
    currentQuestion,
    currentTopic,
    questionNumber,
    totalQuestions,
    topicsCovered,
    coveredTopics,
    coveredDays,
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
