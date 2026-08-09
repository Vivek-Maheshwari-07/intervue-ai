import React from 'react';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';

const STANDARD_CURRICULUM_UNITS = [
  'Data Structures & Algorithmic Efficiency',
  'RAG Architecture & Document Retrieval',
  'Vector Databases & Indexing Strategies',
  'Prompt Engineering & Constraints',
  'Agentic AI Workflows & State Memory',
  'Model Context Protocol (MCP)',
  'AI System Deployment & Monitoring',
];

export default function TopicCoverage({ coveredTopics = [], currentTopic = '' }) {
  const topicsCount = coveredTopics.length;
  const isSatisfied = topicsCount >= 4;

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
            Curriculum Coverage
          </h3>
        </div>

        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
          isSatisfied 
            ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' 
            : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
        }`}>
          {topicsCount}/4 Required Topics
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {STANDARD_CURRICULUM_UNITS.map((unitTopic, idx) => {
          const isCovered = coveredTopics.some(
            (ct) => ct.toLowerCase().includes(unitTopic.toLowerCase().split(' ')[0]) ||
                    unitTopic.toLowerCase().includes(ct.toLowerCase().split(' ')[0])
          );
          const isCurrent = currentTopic.toLowerCase().includes(unitTopic.toLowerCase().split(' ')[0]);

          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-semibold'
                  : isCovered
                  ? 'bg-[#F8FAFC] text-[#16A34A] border-[#E2E8F0]'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                {isCovered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
                )}
                <span className="truncate">{unitTopic}</span>
              </div>

              <span className="font-mono text-[10px] uppercase ml-2 flex-shrink-0">
                {isCovered ? '●●●●' : isCurrent ? '●●●○' : '○○○○'}
              </span>
            </div>
          );
        })}
      </div>

      {!isSatisfied && (
        <p className="text-[11px] text-[#64748B] italic leading-tight">
          * At least 4 unique topics must be explored before interview completion.
        </p>
      )}
    </div>
  );
}
