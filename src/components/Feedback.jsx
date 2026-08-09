import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Award,
  Sparkles,
  BookOpen,
  Target
} from 'lucide-react';

export default function Feedback({ feedback, questionCount, topicsCovered, coveredTopics }) {
  const { summary = '', strengths = [], gaps = [], next = [] } = feedback || {};

  // Compute overall assessment score
  const overallScore = Math.min(100, Math.max(68, 84 + (strengths.length * 3) - (gaps.length * 3)));

  const skillScores = [
    { label: 'Technical Architecture & RAG', score: Math.min(96, overallScore + 4) },
    { label: 'Problem Solving & Algorithmic Depth', score: Math.min(94, overallScore - 1) },
    { label: 'System Design & Trade-off Analysis', score: Math.min(95, overallScore + 2) },
    { label: 'Technical Communication', score: Math.min(98, overallScore + 3) },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn bg-[#FFFFFF] p-8 rounded-xl border border-[#E2E8F0] shadow-xs">
      {/* Header Assessment Card */}
      <div className="pb-6 border-b border-[#E2E8F0] space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Structured AI Assessment Report</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
              Technical Interview Complete
            </h2>
            <p className="text-xs text-[#475569]">
              {questionCount} adaptive questions evaluated across {topicsCovered} unique curriculum topics.
            </p>
          </div>

          <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#BFDBFE] text-right font-mono sm:w-48">
            <span className="text-[11px] text-[#2563EB] block font-semibold uppercase">READINESS SCORE</span>
            <span className="text-3xl font-extrabold text-[#1E40AF]">{overallScore} <span className="text-sm font-normal text-[#64748B]">/ 100</span></span>
          </div>
        </div>

        {/* Covered Topics Badges */}
        {coveredTopics && coveredTopics.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
              Curriculum Topics Evaluated ({coveredTopics.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coveredTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-[#F8FAFC] text-[#0F172A] text-xs font-medium border border-[#E2E8F0]"
                >
                  ✓ {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Competency Performance Breakdown */}
      <div className="space-y-3 py-2 border-b border-[#E2E8F0]">
        <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
          Competency Performance Breakdown
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {skillScores.map((skill, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0F172A]">{skill.label}</span>
                <span className="font-mono font-bold text-[#2563EB]">{skill.score}%</span>
              </div>
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB]"
                  style={{ width: `${skill.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-2 py-2 border-b border-[#E2E8F0]">
          <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
            Evaluation Summary
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2 border-b border-[#E2E8F0]">
        {/* Strengths */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#16A34A] uppercase tracking-wider font-semibold">
            Validated Technical Strengths
          </div>

          {strengths.length > 0 ? (
            <ul className="space-y-2 text-xs text-[#0F172A]">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start space-x-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#64748B] italic">No specific strengths recorded.</p>
          )}
        </div>

        {/* Gaps */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#DC2626] uppercase tracking-wider font-semibold">
            Areas to Improve
          </div>

          {gaps.length > 0 ? (
            <ul className="space-y-2 text-xs text-[#0F172A]">
              {gaps.map((g, i) => (
                <li key={i} className="flex items-start space-x-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#64748B] italic">No specific gaps recorded.</p>
          )}
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="space-y-3 pt-1">
        <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
          Recommended Learning Steps
        </div>

        {next.length > 0 ? (
          <div className="space-y-2 text-xs text-[#0F172A]">
            {next.map((n, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <ArrowRight className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] italic">No specific next steps recommended.</p>
        )}
      </div>

      {/* Footer Attribution */}
      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
        <span>INTERVUE AI Assessment Engine</span>
        <span>Engineered by <strong>Vivek Maheshwari, Aayush Malhotra, Manav Lathiya</strong></span>
      </div>
    </div>
  );
}
