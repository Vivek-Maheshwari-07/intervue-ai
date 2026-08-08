import React from 'react';
import { TrendingUp, BookOpen } from 'lucide-react';

export default function ProgressBar({ questionNumber, totalQuestions, topicsCovered, coveredTopics }) {
  const progress = Math.min(100, ((questionNumber - 1) / totalQuestions) * 100);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
      {/* Question progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1.5 font-semibold text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interview Progress</span>
          </span>
          <span className="font-mono font-bold text-cyan-400">
            {questionNumber - 1} / {totalQuestions}
          </span>
        </div>

        <div className="w-full h-3 bg-slate-900 rounded-full p-0.5 border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topics covered */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1.5 font-semibold text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Topics Covered</span>
          </span>
          <span className="font-mono font-bold text-purple-400">
            {topicsCovered} / 4 min
          </span>
        </div>

        {coveredTopics && coveredTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coveredTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 text-[10px] font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
