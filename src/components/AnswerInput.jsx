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
    // Ctrl+Enter / Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          id="answer-input"
          rows={4}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Type your answer here… (Ctrl+Enter to submit)"
          className="w-full bg-[#070b14] border border-slate-800 rounded-xl p-4 pr-12 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 leading-relaxed shadow-inner resize-none placeholder:text-slate-600 disabled:opacity-50 transition-colors"
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-600">
          {answer.length}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px]">Enter</kbd> to submit
        </p>

        <button
          type="submit"
          disabled={!answer.trim() || isLoading || disabled}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-purple-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Answer</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
