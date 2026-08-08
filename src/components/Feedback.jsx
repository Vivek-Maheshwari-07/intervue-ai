import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Trophy,
  Sparkles,
} from 'lucide-react';

export default function Feedback({ feedback, questionCount, topicsCovered, coveredTopics }) {
  const { summary = '', strengths = [], gaps = [], next = [] } = feedback || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 border border-cyan-500/30 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Interview Complete
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {questionCount} questions answered across {topicsCovered} topics
          </p>
        </div>

        {coveredTopics && coveredTopics.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {coveredTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 text-[10px] font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Summary</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-emerald-500/20 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Strengths</h3>
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific strengths identified.</p>
          )}
        </div>

        {/* Gaps */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-amber-500/20 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Areas for Improvement</h3>
          </div>

          {gaps.length > 0 ? (
            <ul className="space-y-2">
              {gaps.map((g, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No specific gaps identified.</p>
          )}
        </div>
      </div>

      {/* Next Topics */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-indigo-500/20 space-y-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
            Recommended Next Topics
          </h3>
        </div>

        {next.length > 0 ? (
          <div className="space-y-2">
            {next.map((n, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
              >
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No specific recommendations.</p>
        )}
      </div>
    </div>
  );
}
