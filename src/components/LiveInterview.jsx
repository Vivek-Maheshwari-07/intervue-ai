import React, { useState, useCallback } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

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
  const [phase, setPhase] = useState('start'); // 'start' | 'interview' | 'completed'
  const [candidateId, setCandidateId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(8);
  const [topicsCovered, setTopicsCovered] = useState(0);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

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
      setError(err.message || 'Failed to start interview.');
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

  if (phase === 'start') {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#92928C] uppercase tracking-wider">Session Setup</span>
            <h1 className="text-xl font-semibold text-[#1C1C1A]">Live Interview Session</h1>
            <p className="text-xs text-[#6B6B66]">Enter candidate ID to begin multi-turn evaluation.</p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label htmlFor="live-candidate-id" className="text-xs font-semibold text-[#6B6B66] block mb-1">
                Candidate ID
              </label>
              <input
                id="live-candidate-id"
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartInterview()}
                placeholder="e.g. candidate-001 or person-3"
                className="w-full bg-[#FCFCFA] border border-[#E4E2DB] rounded-md px-3 py-2 text-xs text-[#1C1C1A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-[#FCECEC] border border-[#F8CACA] text-[#B54747] text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStartInterview}
              disabled={isLoading || !candidateId.trim()}
              className="w-full py-2.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? 'Starting Session…' : 'Begin Interview Session →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div className="space-y-6">
        <Feedback
          feedback={feedback}
          questionCount={finalQuestionCount}
          topicsCovered={topicsCovered}
          coveredTopics={coveredTopics}
        />

        <ChatWindow conversationHistory={conversationHistory} />

        <div className="text-center">
          <button
            onClick={handleRestart}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs bg-[#FFFFFF] border border-[#E4E2DB] text-[#1C1C1A] hover:bg-[#F7F6F2] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6B6B66]" />
            <span>Start New Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ProgressBar
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        topicsCovered={topicsCovered}
        coveredTopics={coveredTopics}
      />

      <QuestionCard
        question={currentQuestion}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        topic={currentTopic}
      />

      <AnswerInput
        onSubmit={handleSubmitAnswer}
        isLoading={isLoading}
        disabled={!currentQuestion}
      />

      {error && (
        <div className="p-3 rounded-md bg-[#FCECEC] border border-[#F8CACA] text-[#B54747] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {conversationHistory.length > 2 && (
        <ChatWindow conversationHistory={conversationHistory.slice(0, -1)} />
      )}
    </div>
  );
}
