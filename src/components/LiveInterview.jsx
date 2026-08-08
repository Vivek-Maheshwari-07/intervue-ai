import React, { useState, useCallback } from 'react';
import {
  Radio,
  Play,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { startInterview, submitAnswer } from '../services/api';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import AnswerInput from './AnswerInput';
import ChatWindow from './ChatWindow';
import Feedback from './Feedback';

function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function LiveInterview() {
  // Interview state
  const [phase, setPhase] = useState('start'); // 'start' | 'interview' | 'completed'
  const [candidateId, setCandidateId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Current question state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(8);
  const [topicsCovered, setTopicsCovered] = useState(0);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Feedback state
  const [feedback, setFeedback] = useState(null);
  const [finalQuestionCount, setFinalQuestionCount] = useState(0);

  const handleStartInterview = useCallback(async () => {
    const trimmedId = candidateId.trim();
    if (!trimmedId) {
      setError('Please enter a Candidate ID.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const newSessionId = generateSessionId();

    try {
      const data = await startInterview(newSessionId, trimmedId);

      setSessionId(newSessionId);
      setCurrentQuestion(data.question || '');
      setCurrentTopic('');
      setQuestionNumber(data.questionNumber || 1);
      setTopicsCovered(data.topicsCovered || 0);
      setCoveredTopics(data.coveredTopics || []);
      setConversationHistory(data.conversationHistory || []);
      setPhase('interview');
    } catch (err) {
      setError(err.message || 'Failed to start interview. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  const handleSubmitAnswer = useCallback(async (answer) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await submitAnswer(sessionId, candidateId.trim(), answer);

      if (data.status === 'completed') {
        setFeedback(data.feedback);
        setFinalQuestionCount(data.questionNumber || questionNumber);
        setTopicsCovered(data.topicsCovered || topicsCovered);
        setCoveredTopics(data.coveredTopics || coveredTopics);
        setConversationHistory(data.conversationHistory || conversationHistory);
        setPhase('completed');
      } else {
        setCurrentQuestion(data.question || '');
        setQuestionNumber(data.questionNumber || questionNumber + 1);
        setTopicsCovered(data.topicsCovered || topicsCovered);
        setCoveredTopics(data.coveredTopics || coveredTopics);
        setConversationHistory(data.conversationHistory || conversationHistory);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, candidateId, questionNumber, topicsCovered, coveredTopics, conversationHistory]);

  const handleRestart = () => {
    setPhase('start');
    setCandidateId('');
    setSessionId('');
    setCurrentQuestion('');
    setCurrentTopic('');
    setQuestionNumber(1);
    setTopicsCovered(0);
    setCoveredTopics([]);
    setConversationHistory([]);
    setFeedback(null);
    setFinalQuestionCount(0);
    setError(null);
  };

  // ── Start Screen ──────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className="space-y-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-10 border border-slate-800">
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <Radio className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Adaptive Interview</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Live Interview Session
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Start a real-time interview powered by AI. Answer {totalQuestions} questions across
                multiple topics and receive comprehensive feedback.
              </p>
            </div>

            {/* Start Form */}
            <div className="max-w-sm mx-auto space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="candidate-id" className="text-xs font-semibold text-slate-300 block">
                  Candidate ID
                </label>
                <input
                  id="candidate-id"
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartInterview()}
                  placeholder="e.g. candidate-001 or your name"
                  className="w-full bg-[#070b14] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/60 placeholder:text-slate-600 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleStartInterview}
                disabled={isLoading || !candidateId.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Starting…</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Begin Interview</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: '8+ Questions', desc: 'Adaptive questions from AI', color: 'cyan' },
            { title: '4+ Topics', desc: 'Broad curriculum coverage', color: 'purple' },
            { title: 'AI Feedback', desc: 'Strengths, gaps & next steps', color: 'emerald' },
          ].map((card, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-slate-800 text-center space-y-1">
              <div className={`text-lg font-extrabold text-${card.color}-400`}>{card.title}</div>
              <div className="text-[11px] text-slate-400">{card.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Completed Screen ──────────────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <div className="space-y-6">
        <Feedback
          feedback={feedback}
          questionCount={finalQuestionCount}
          topicsCovered={topicsCovered}
          coveredTopics={coveredTopics}
        />

        {/* Conversation review */}
        <ChatWindow conversationHistory={conversationHistory} />

        {/* Restart */}
        <div className="text-center">
          <button
            onClick={handleRestart}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 shadow-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Interview Screen ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressBar
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        topicsCovered={topicsCovered}
        coveredTopics={coveredTopics}
      />

      {/* Current Question */}
      <QuestionCard
        question={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        topic={currentTopic}
      />

      {/* Answer Input */}
      <AnswerInput
        onSubmit={handleSubmitAnswer}
        isLoading={isLoading}
        disabled={!currentQuestion}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat History */}
      {conversationHistory.length > 2 && (
        <ChatWindow conversationHistory={conversationHistory.slice(0, -1)} />
      )}
    </div>
  );
}
