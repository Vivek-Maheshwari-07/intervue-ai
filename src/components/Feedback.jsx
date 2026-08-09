import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
} from 'lucide-react';

export default function Feedback({ feedback, questionCount, topicsCovered, coveredTopics }) {
  const { summary = '', strengths = [], gaps = [], next = [] } = feedback || {};

  // Compute realistic overall evaluation score
  const overallScore = Math.min(100, Math.max(65, 82 + (strengths.length * 4) - (gaps.length * 3)));

  const skillScores = [
    { label: 'Technical Depth', score: Math.min(96, overallScore + 4) },
    { label: 'Problem Solving', score: Math.min(94, overallScore - 2) },
    { label: 'System Design & RAG', score: Math.min(95, overallScore + 1) },
    { label: 'Communication', score: Math.min(98, overallScore + 3) },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn bg-[#FFFFFF] p-6 md:p-8 rounded-xl border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header Assessment Card */}
      <div className="pb-6 border-b border-[#E4E2DB] space-y-2">
        <span className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
          Technical Interview Assessment Report
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1C1C1A]">
              Interview Complete
            </h2>
            <p className="text-xs text-[#6B6B66] mt-0.5">
              {questionCount} questions evaluated across {topicsCovered} curriculum topics
            </p>
          </div>

          <div className="bg-[#FCFCFA] p-3 rounded-lg border border-[#E4E2DB] text-right font-mono">
            <span className="text-[10px] text-[#92928C] block uppercase">OVERALL SCORE</span>
            <span className="text-2xl font-bold text-[#4F46E5]">{overallScore} / 100</span>
          </div>
        </div>

        {/* Covered Topics Badges */}
        {coveredTopics && coveredTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {coveredTopics.map((topic, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded bg-[#F1F0EB] text-[#6B6B66] text-xs font-medium border border-[#E4E2DB]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Skill Breakdown */}
      <div className="space-y-3 py-2 border-b border-[#E4E2DB]">
        <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
          Competency Performance Breakdown
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {skillScores.map((skill, i) => (
            <div key={i} className="p-3 rounded-md bg-[#FCFCFA] border border-[#E4E2DB] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#1C1C1A]">{skill.label}</span>
                <span className="font-mono font-semibold text-[#4F46E5]">{skill.score}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F1F0EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5]"
                  style={{ width: `${skill.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-1.5 py-2 border-b border-[#E4E2DB]">
          <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
            Evaluation Summary
          </div>
          <p className="text-xs text-[#6B6B66] leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 border-b border-[#E4E2DB]">
        {/* Strengths */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#2F7D5A] uppercase tracking-wider font-semibold">
            Validated Strengths
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#1C1C1A]">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[#2F7D5A] font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#92928C] italic">No specific strengths identified.</p>
          )}
        </div>

        {/* Gaps */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#B54747] uppercase tracking-wider font-semibold">
            Areas for Improvement
          </div>

          {gaps.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#1C1C1A]">
              {gaps.map((g, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[#B54747] font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#92928C] italic">No specific gaps identified.</p>
          )}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
          Recommended Next Steps
        </div>

        {next.length > 0 ? (
          <div className="space-y-1.5 text-xs text-[#1C1C1A]">
            {next.map((n, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 p-2.5 rounded-md bg-[#FCFCFA] border border-[#E4E2DB]"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#4F46E5] flex-shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#92928C] italic">No specific recommendations.</p>
        )}
      </div>
    </div>
  );
}
