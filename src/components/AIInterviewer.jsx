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
  Trash2,
  Terminal,
  Cpu,
  ShieldAlert
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
    isSubmitting,
    startSession,
    sendAnswer,
    retry,
    resetSession,
  } = interviewState;

  const [answerText, setAnswerText] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidateId || candidates[0]?.id || 'person-3');
  const [pasteNotice, setPasteNotice] = useState(null);

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

  const triggerPasteNotice = () => {
    setPasteNotice('Paste is disabled during the live technical interview.');
    setTimeout(() => setPasteNotice(null), 3000);
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
    // Intercept Paste keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      e.preventDefault();
      triggerPasteNotice();
      return;
    }
    if (e.shiftKey && e.key === 'Insert') {
      e.preventDefault();
      triggerPasteNotice();
      return;
    }

    // Submit shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    triggerPasteNotice();
  };

  const isFollowUp = conversationHistory.length > 2 && questionNumber > 1;

  // 1. COMPLETED SCREEN (Assessment Report)
  if (status === 'completed' && feedback) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn px-2 sm:px-0">
        <Feedback
          feedback={feedback}
          questionCount={questionNumber}
          topicsCovered={topicsCovered}
          coveredTopics={coveredTopics}
          coveredDays={coveredDays}
        />

        {/* Conversation Transcript Review */}
        {conversationHistory.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3 select-none">
              <MessageSquare className="w-4 h-4 text-[#2563EB]" />
              <h3 className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
                Complete Technical Transcript & Log
              </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 sm:pr-2 font-sans">
              {conversationHistory.map((msg, idx) => {
                const isAI = msg.role === 'interviewer';
                return (
                  <div
                    key={idx}
                    className={`p-3.5 sm:p-4 rounded-xl border text-xs leading-relaxed ${
                      isAI
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]'
                        : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0F172A] ml-2 sm:ml-6'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#64748B] mb-1.5 select-none">
                      <span className="font-semibold uppercase text-[#2563EB]">
                        {isAI ? 'AI Interviewer' : 'Candidate Response'}
                      </span>
                      {msg.topic && <span className="truncate max-w-[120px] sm:max-w-none">{msg.topic}</span>}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center pt-2 select-none">
          <button
            onClick={resetSession}
            className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs select-none"
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
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn px-2 sm:px-0">
        <div className="bg-[#FFFFFF] rounded-xl p-5 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6">
          <div className="space-y-2 select-none">
            <span className="text-xs font-mono text-[#2563EB] font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>AI Technical Interview Room Setup</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight font-sans">
              Personalized Adaptive Technical Interviewer
            </h1>
            <p className="text-xs text-[#475569] leading-relaxed max-w-xl font-sans">
              Conduct an adaptive technical interview. The AI agent evaluates candidate responses in real-time, grounds questions in ChromaDB curriculum context, and adjusts difficulty dynamically based on candidate performance.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 select-none">
            <div className="space-y-1.5 w-full sm:w-80">
              <label className="text-xs font-semibold text-[#64748B] block uppercase tracking-wider font-mono">
                Select Roster Candidate
              </label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] text-xs font-medium rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.role} ({c.responsibility}% Resp)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all cursor-pointer shadow-xs font-sans select-none w-full sm:w-auto"
            >
              <span>Start AI Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIVE TECHNICAL INTERVIEW WORKSPACE — RESPONSIVE LAYOUT
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="space-y-6 max-w-6xl mx-auto animate-fadeIn"
    >
      {/* Top Interview Status Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-xs gap-3 select-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] flex-shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono font-extrabold text-xs sm:text-sm text-[#0F172A] tracking-tight">
                AI INTERVIEWER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] font-semibold border border-[#BFDBFE]">
                RAG GROUNDED
              </span>
            </div>
            <div className="text-xs text-[#475569] font-sans truncate">
              Candidate: <strong className="text-[#0F172A]">{activeCandidate.name}</strong> ({activeCandidate.role})
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs font-mono pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0]">
          <div className="text-[#64748B]">
            QUESTION <strong className="text-[#0F172A] font-mono text-sm">{questionNumber < 10 ? `0${questionNumber}` : questionNumber}</strong> / <span className="text-[#94A3B8]">08+</span>
          </div>

          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-semibold border border-[#BBF7D0]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse flex-shrink-0" />
            <span className="tracking-wider uppercase text-[10px]">LIVE INTERVIEW</span>
          </span>
        </div>
      </div>

      {/* Main Responsive Grid (Desktop: 3:1 Split | Mobile/Tablet: Stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content Column (Question & Response) */}
        <div className="lg:col-span-3 space-y-6">

          {/* AI Interviewer Technical Question Card (Anti-Copy Protection) */}
          <div
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            className="bg-[#FFFFFF] rounded-xl p-4 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4 select-none cursor-default"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
                  Technical Question
                </span>
              </div>

              {currentTopic && (
                <span className="text-xs font-mono text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-[#BFDBFE] font-semibold truncate max-w-[200px] sm:max-w-none">
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

            {/* Question Text or Loading State */}
            <div className="text-[#0F172A] text-sm sm:text-base leading-relaxed font-sans pt-1 min-h-[3.5rem]">
              {!currentQuestion && isSubmitting ? (
                <div className="flex items-center space-x-3 text-[#2563EB] font-mono text-xs sm:text-sm py-2">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                  <span>Generating your next adaptive question from curriculum context...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{currentQuestion || 'Generating adaptive question...'}</p>
              )}
            </div>
          </div>

          {/* Candidate Response Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#64748B] font-mono select-none">
              <label htmlFor="user-response-input" className="font-semibold uppercase tracking-wider text-[11px] text-[#64748B]">
                CANDIDATE TECHNICAL RESPONSE
              </label>
              <div className="flex items-center space-x-3 text-[11px]">
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

            {/* Non-intrusive Paste Warning Notice */}
            {pasteNotice && (
              <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-mono flex items-center space-x-2 animate-fadeIn select-none">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-[#D97706]" />
                <span>{pasteNotice}</span>
              </div>
            )}

            <textarea
              id="user-response-input"
              rows={5}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
              disabled={isSubmitting || !currentQuestion}
              placeholder="Explain your approach, architecture trade-offs, and production considerations..."
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] leading-relaxed resize-none placeholder:text-[#94A3B8] disabled:opacity-50 transition-colors shadow-xs"
            />

            {/* Error Banner */}
            {error && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs font-medium select-none">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#DC2626]" />
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

            {/* Action Bar & Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-1 gap-3">
              <span className="text-[11px] text-[#64748B] font-mono select-none hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A]">Enter</kbd> to submit
              </span>

              <button
                onClick={handleSubmit}
                disabled={!answerText.trim() || isSubmitting || !currentQuestion}
                className="flex items-center justify-center space-x-2 px-7 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer shadow-xs font-sans select-none w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{loadingMessage || 'Analyzing Response & Planning Question...'}</span>
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

        {/* Right Sidebar (Desktop) / Stacked Section (Mobile/Tablet) */}
        <div className="lg:col-span-1 space-y-6 select-none">
          
          {/* Adaptive Signal Panel */}
          {adaptiveSignal && (
            <AdaptiveSignal signal={adaptiveSignal} />
          )}

          {/* Question Counter Card */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs space-y-3">
            <div className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider border-b border-[#E2E8F0] pb-2">
              Question Progress
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-1.5 font-mono">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((qNum) => {
                const isDone = qNum < questionNumber;
                const isCurrent = qNum === questionNumber;

                return (
                  <div
                    key={qNum}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-colors ${
                      isCurrent
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border border-[#BFDBFE]'
                        : isDone
                        ? 'text-[#16A34A] bg-[#F8FAFC]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5 truncate">
                      <span>{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                      <span className="truncate">Q0{qNum}</span>
                    </span>
                    {isCurrent && <span className="text-[9px] uppercase font-bold text-[#2563EB] hidden lg:inline">ACTIVE</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curriculum Day Coverage */}
          <TopicCoverage
            coveredTopics={coveredTopics}
            currentTopic={currentTopic}
          />
        </div>
      </div>
    </div>
  );
}
