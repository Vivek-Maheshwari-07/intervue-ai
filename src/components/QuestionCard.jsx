import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function QuestionCard({ question, questionNumber, totalQuestions, topic }) {
  return (
    <div className="glass-panel-glow rounded-2xl p-5 sm:p-6 border border-cyan-500/30 space-y-3 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              AI Interviewer
            </div>
            <div className="text-[10px] text-slate-400">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </div>

        {topic && (
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-semibold flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>{topic}</span>
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-sm sm:text-base text-white leading-relaxed font-medium">
        {question}
      </p>
    </div>
  );
}
