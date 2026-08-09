import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function AnswerInput({ onSubmit, isLoading, disabled }) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
    setAnswer('');
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#6B6B66]">
          <label htmlFor="answer-input" className="font-mono text-[11px] text-[#92928C] uppercase tracking-wider">
            YOUR RESPONSE
          </label>
          <span className="font-mono text-[11px] text-[#92928C]">
            {answer.length} characters
          </span>
        </div>

        <textarea
          id="answer-input"
          rows={5}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Type your technical answer here..."
          className="w-full bg-[#FFFFFF] border border-[#E4E2DB] rounded-md p-4 text-xs font-mono text-[#1C1C1A] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF0FF] leading-relaxed resize-none placeholder:text-[#92928C] disabled:opacity-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#92928C]">
          Ctrl + Enter to submit
        </span>

        <button
          type="submit"
          disabled={!answer.trim() || isLoading || disabled}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
        >
          {isLoading ? (
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
    </form>
  );
}
