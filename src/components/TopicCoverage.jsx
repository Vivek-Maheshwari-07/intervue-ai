import React from 'react';
import { CheckCircle2, Circle, BookOpen } from 'lucide-react';

const CURRICULUM_DAYS = [
  { day: 'Day 01', title: 'Fundamentals & Code Quality' },
  { day: 'Day 02', title: 'System Design & Microservices' },
  { day: 'Day 03', title: 'Databases & Caching' },
  { day: 'Day 04', title: 'Reliability & Distributed Systems' },
  { day: 'Day 07', title: 'Embeddings & Vector Search' },
  { day: 'Day 10', title: 'Retrieval & Matching Engine' },
  { day: 'Day 16', title: 'API Integration & Async Queues' },
];

export default function TopicCoverage({ coveredTopics = [], currentTopic = '' }) {
  const topicsCount = coveredTopics.length;
  const isSatisfied = topicsCount >= 4;

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
            Curriculum Coverage
          </h3>
        </div>

        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          isSatisfied 
            ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
            : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
        }`}>
          {topicsCount}/4 Required Days
        </span>
      </div>

      <div className="space-y-2 text-xs font-mono">
        {CURRICULUM_DAYS.map((unit, idx) => {
          const isCovered = coveredTopics.some(
            (ct) => ct.toLowerCase().includes(unit.title.toLowerCase().split(' ')[0]) ||
                    unit.title.toLowerCase().includes(ct.toLowerCase().split(' ')[0])
          );
          const isCurrent = currentTopic.toLowerCase().includes(unit.title.toLowerCase().split(' ')[0]);

          return (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                isCurrent
                  ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] font-bold'
                  : isCovered
                  ? 'bg-[#F8FAFC] text-[#16A34A] border-[#E2E8F0]'
                  : 'bg-[#FFFFFF] text-[#94A3B8] border-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                {isCovered ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#CBD5E1] flex-shrink-0" />
                )}
                <span className="font-semibold text-[11px] text-[#64748B]">{unit.day}</span>
                <span className="truncate text-xs font-sans text-[#0F172A]">{unit.title}</span>
              </div>

              <span className="text-[11px] font-bold ml-2 flex-shrink-0">
                {isCovered ? '✓' : isCurrent ? '●' : '○'}
              </span>
            </div>
          );
        })}
      </div>

      {!isSatisfied && (
        <p className="text-[11px] font-sans italic leading-tight text-[#64748B]">
          * Completion requirement: At least 4 unique curriculum days must be covered.
        </p>
      )}
    </div>
  );
}
