import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  AlertCircle, 
  RotateCcw, 
  Loader2, 
  BookOpen, 
  TrendingUp, 
  User, 
  MessageSquare
} from 'lucide-react';

import Feedback from './Feedback';

const CURRICULUM_DAYS = [
  { day: 'Day 08', topic: 'Prompt Engineering' },
  { day: 'Day 12', topic: 'RAG Architecture' },
  { day: 'Day 17', topic: 'Vector Databases' },
  { day: 'Day 22', topic: 'Agentic AI' },
  { day: 'Day 26', topic: 'MCP' },
];

export default function AIInterviewer({
  candidates,
  interviewState,
  onStartInterview,
}) {
  const {
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
    feedback,
    isSubmitting,
    startSession,
    sendAnswer,
    retry,
    resetSession,
  } = interviewState;

  const [answerText, setAnswerText] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateId || candidates[0]?.id || 'person-3');

  useEffect(() => {
    if (candidateId) {
      setSelectedCandidateId(candidateId);
    }
  }, [candidateId]);

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleStart = () => {
    startSession(selectedCandidateId);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!answerText.trim() || isSubmitting) return;
    sendAnswer(answerText);
    setAnswerText('');
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const isFollowUp = conversationHistory.length > 2 && questionNumber > 1;

  // Render Completed / Final Assessment Report
  if (status === 'completed' && feedback) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Feedback
          feedback={feedback}
          questionCount={questionNumber}
          topicsCovered={topicsCovered}
          coveredTopics={coveredTopics}
        />

        {/* Conversation Transcript Review */}
        {conversationHistory.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E4E2DB] p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
              Interview Transcript & Evaluation Record
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {conversationHistory.map((msg, idx) => {
                const isAI = msg.role === 'interviewer';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                      isAI
                        ? 'bg-[#FCFCFA] border-[#E4E2DB] text-[#1C1C1A]'
                        : 'bg-[#EEF0FF] border-[#D9E0FF] text-[#1C1C1A] ml-6'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#92928C] mb-1">
                      <span className="font-semibold uppercase">
                        {isAI ? 'AI Interviewer' : 'Candidate'}
                      </span>
                      {msg.topic && <span>{msg.topic}</span>}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={resetSession}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs bg-[#FFFFFF] border border-[#E4E2DB] text-[#1C1C1A] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6B6B66]" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Setup / Start State
  if (status === 'idle') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-[#FFFFFF] rounded-xl p-6 md:p-8 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#4F46E5] font-medium uppercase tracking-wider">
              Technical Interview Room
            </span>
            <h1 className="text-2xl font-semibold text-[#1C1C1A]">
              Personalized AI Technical Interviewer
            </h1>
            <p className="text-xs text-[#6B6B66] leading-relaxed max-w-xl">
              Conduct a multi-turn technical interview. The AI interviewer assesses system design reasoning, 
              asks context-aware follow-ups, and provides structured evaluation feedback.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E4E2DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-[#92928C] block uppercase tracking-wider">
                Target Interviewee
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="bg-[#FCFCFA] border border-[#E4E2DB] text-[#1C1C1A] text-xs font-medium rounded-md px-3 py-2 focus:outline-none focus:border-[#4F46E5]"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.role} ({c.responsibility}% Ownership)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>Start Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Interview Screen (Screen 2 Editorial Room)
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DB]">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-sm text-[#1C1C1A] font-mono">
            INTERVUE
          </span>
          <span className="text-xs text-[#92928C]">|</span>
          <span className="text-xs text-[#6B6B66]">
            Interviewee: <strong>{activeCandidate.name}</strong> ({activeCandidate.id})
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-[#6B6B66]">
            Question <strong className="text-[#1C1C1A]">0{questionNumber}</strong> / 08+
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#EAF5EF] text-[#2F7D5A] text-[11px] font-medium border border-[#D1EADE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A]" />
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Compact Progress & Curriculum */}
        <div className="md:col-span-1 space-y-6">
          {/* Question Progress */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-semibold text-[#92928C] uppercase tracking-wider">
              Interview Progress
            </div>

            <div className="space-y-1 text-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((qNum) => {
                const isDone = qNum < questionNumber;
                const isCurrent = qNum === questionNumber;

                return (
                  <div
                    key={qNum}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs ${
                      isCurrent
                        ? 'bg-[#EEF0FF] text-[#4F46E5] font-semibold border border-[#D9E0FF]'
                        : isDone
                        ? 'text-[#2F7D5A]'
                        : 'text-[#92928C]'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                      <span>Question 0{qNum}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curriculum Coverage */}
          <div className="space-y-2 pt-4 border-t border-[#E4E2DB]">
            <div className="text-[11px] font-mono font-semibold text-[#92928C] uppercase tracking-wider">
              Curriculum Coverage
            </div>

            <div className="space-y-1.5 text-xs">
              {CURRICULUM_DAYS.map((c, i) => {
                const isCovered = coveredTopics.some(t => t.toLowerCase().includes(c.topic.toLowerCase().split(' ')[0]));
                const isCurrentTopic = currentTopic.toLowerCase().includes(c.topic.toLowerCase().split(' ')[0]);

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-2.5 py-1 rounded-md text-xs ${
                      isCurrentTopic
                        ? 'text-[#4F46E5] font-semibold bg-[#EEF0FF]'
                        : isCovered
                        ? 'text-[#2F7D5A]'
                        : 'text-[#92928C]'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{isCovered ? '✓' : isCurrentTopic ? '●' : '○'}</span>
                      <span>{c.topic}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Workspace: Editorial Interview Presentation */}
        <div className="md:col-span-3 space-y-6">

          {/* Question Card (Editorial Presentation) */}
          <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DB] pb-3">
              <span className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
                AI INTERVIEWER
              </span>

              {currentTopic && (
                <span className="text-xs font-mono text-[#6B6B66] bg-[#F1F0EB] px-2.5 py-1 rounded-md border border-[#E4E2DB]">
                  {currentTopic}
                </span>
              )}
            </div>

            {/* Follow-up Indicator (Subtle Left Accent Line) */}
            {isFollowUp && (
              <div className="pl-3 border-l-2 border-[#4F46E5] space-y-0.5">
                <div className="text-[11px] font-mono font-semibold text-[#4F46E5] uppercase tracking-wider">
                  FOLLOW-UP
                </div>
                <div className="text-xs text-[#6B6B66]">
                  Based on your previous answer
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="text-[#1C1C1A] text-base leading-relaxed font-normal pt-1">
              <p className="whitespace-pre-wrap">{currentQuestion || 'Generating question…'}</p>
            </div>
          </div>

          {/* Multi-Turn Timeline (Past turns) */}
          {conversationHistory.length > 2 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
                Previous Turns
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {conversationHistory.slice(0, -1).map((msg, i) => {
                  const isAI = msg.role === 'interviewer';
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-md border text-xs leading-relaxed ${
                        isAI
                          ? 'bg-[#FCFCFA] border-[#E4E2DB] text-[#6B6B66]'
                          : 'bg-[#EEF0FF] border-[#D9E0FF] text-[#1C1C1A]'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-[#92928C] mb-1">
                        {isAI ? 'AI Interviewer' : 'You'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Response Textarea */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6B6B66]">
              <label htmlFor="user-response-input" className="font-semibold uppercase tracking-wider text-[11px] text-[#92928C]">
                YOUR RESPONSE
              </label>
              <span className="font-mono text-[11px] text-[#92928C]">
                {answerText.length} characters
              </span>
            </div>

            <textarea
              id="user-response-input"
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || !currentQuestion}
              placeholder="Type your technical answer here..."
              className="w-full bg-[#FFFFFF] border border-[#E4E2DB] rounded-md p-4 text-xs font-mono text-[#1C1C1A] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF0FF] leading-relaxed resize-none placeholder:text-[#92928C] disabled:opacity-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between p-3 rounded-md bg-[#FCECEC] border border-[#F8CACA] text-[#B54747] text-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={retry}
                  className="px-3 py-1 rounded bg-[#B54747] text-[#FFFFFF] font-medium text-xs hover:bg-[#9B3C3C]"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#92928C]">
                Ctrl + Enter to submit
              </span>

              <button
                onClick={handleSubmit}
                disabled={!answerText.trim() || isSubmitting || !currentQuestion}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating response…</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer →</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
