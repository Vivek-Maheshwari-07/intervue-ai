import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ArrowRight, 
  AlertCircle, 
  RotateCcw, 
  Loader2, 
  Sparkles,
  Send,
  MessageSquare,
  Trash2
} from 'lucide-react';

import Feedback from './Feedback';
import AdaptiveSignal from './AdaptiveSignal';
import TopicCoverage from './TopicCoverage';

export default function AIInterviewer({
  candidates = [],
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
    adaptiveSignal,
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

  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0] || {
    name: 'Selected Candidate',
    role: 'AI Engineer',
    id: selectedCandidateId,
  };

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

  // 1. COMPLETED SCREEN
  if (status === 'completed' && feedback) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <Feedback
          feedback={feedback}
          questionCount={questionNumber}
          topicsCovered={topicsCovered}
          coveredTopics={coveredTopics}
        />

        {/* Conversation Transcript Review */}
        {conversationHistory.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
                Complete Interview Transcript & Evaluation Log
              </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {conversationHistory.map((msg, idx) => {
                const isAI = msg.role === 'interviewer';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      isAI
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                        : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0F172A] ml-6'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B] mb-1.5">
                      <span className="font-semibold uppercase text-[#2563EB]">
                        {isAI ? 'AI Interviewer' : 'Candidate Response'}
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
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-[#64748B]" />
            <span>Start New Candidate Session</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. IDLE / SETUP SCREEN
  if (status === 'idle') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-[#FFFFFF] rounded-xl p-8 border border-[#E2E8F0] shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#2563EB] font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Technical Interview Room</span>
            </span>
            <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Personalized Adaptive Technical Interviewer
            </h1>
            <p className="text-xs text-[#475569] leading-relaxed max-w-xl">
              Conduct an adaptive multi-turn technical interview. The AI agent evaluates responses in real-time, grounds questions in curriculum context, and adjusts difficulty dynamically based on candidate performance.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 w-full sm:w-80">
              <label className="text-xs font-semibold text-[#64748B] block uppercase tracking-wider">
                Select Candidate
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
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
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              <span>Start AI Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN HERO INTERVIEW WORKSPACE
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-sm text-[#0F172A]">
              INTERVUE AI
            </span>
            <div className="text-xs text-[#64748B]">
              Interviewing <strong>{activeCandidate.name}</strong> ({activeCandidate.role})
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-[#64748B]">
            Question <strong className="text-[#0F172A]">0{questionNumber}</strong> / 08+
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold border border-[#BBF7D0]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>SESSION LIVE</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Left Interview Hero | Right Progress Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Column (3/4): Question Hero Card & Answer Submission */}
        <div className="md:col-span-3 space-y-6">

          {/* Adaptive Signal Notification (if available) */}
          {adaptiveSignal && (
            <AdaptiveSignal signal={adaptiveSignal} />
          )}

          {/* AI Interviewer Main Question Card */}
          <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
                  AI Technical Interviewer
                </span>
              </div>

              {currentTopic && (
                <span className="text-xs font-mono text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#BFDBFE] font-medium">
                  {currentTopic}
                </span>
              )}
            </div>

            {/* Follow-up Indicator */}
            {isFollowUp && (
              <div className="pl-3 border-l-2 border-[#2563EB] py-0.5 space-y-0.5">
                <div className="text-[11px] font-mono font-semibold text-[#2563EB] uppercase tracking-wider">
                  Adaptive Follow-up
                </div>
                <div className="text-xs text-[#64748B]">
                  Tailored based on your previous answer evaluation
                </div>
              </div>
            )}

            {/* Main Question Text */}
            <div className="text-[#0F172A] text-base leading-relaxed font-normal pt-1">
              <p className="whitespace-pre-wrap">{currentQuestion || 'Generating adaptive question…'}</p>
            </div>
          </div>

          {/* Multi-Turn Transcript Timeline (Previous Turns) */}
          {conversationHistory.length > 2 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
                Previous Conversation Turns
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {conversationHistory.slice(0, -1).map((msg, i) => {
                  const isAI = msg.role === 'interviewer';
                  return (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        isAI
                          ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]'
                          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0F172A]'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-semibold text-[#64748B] mb-1 uppercase">
                        {isAI ? 'AI Interviewer' : 'Candidate Response'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidate Response Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <label htmlFor="user-response-input" className="font-semibold uppercase tracking-wider text-[11px] text-[#64748B]">
                YOUR TECHNICAL RESPONSE
              </label>
              <div className="flex items-center space-x-3 font-mono text-[11px]">
                <span>{answerText.length} characters</span>
                {answerText.length > 0 && (
                  <button
                    onClick={() => setAnswerText('')}
                    className="text-[#DC2626] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="user-response-input"
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting || !currentQuestion}
              placeholder="Provide a detailed technical answer explaining architecture decisions, trade-offs, and implementation details..."
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] leading-relaxed resize-none placeholder:text-[#94A3B8] disabled:opacity-50 transition-colors shadow-xs"
            />

            {/* Error Banner */}
            {error && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={retry}
                  className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white font-semibold text-xs hover:bg-[#B91C1C] cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#64748B] font-mono">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A]">Enter</kbd> to submit
              </span>

              <button
                onClick={handleSubmit}
                disabled={!answerText.trim() || isSubmitting || !currentQuestion}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response & Planning Next Question…</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Sidebar (1/4): Progress & Curriculum Coverage */}
        <div className="md:col-span-1 space-y-6">
          {/* Question Counter Progress */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Question Progress
            </div>

            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((qNum) => {
                const isDone = qNum < questionNumber;
                const isCurrent = qNum === questionNumber;

                return (
                  <div
                    key={qNum}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]'
                        : isDone
                        ? 'text-[#16A34A] bg-[#F8FAFC]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                      <span>Question 0{qNum}</span>
                    </span>
                    {isCurrent && <span className="text-[10px] uppercase font-mono">ACTIVE</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curriculum Coverage Component */}
          <TopicCoverage
            coveredTopics={coveredTopics}
            currentTopic={currentTopic}
          />
        </div>
      </div>
    </div>
  );
}
