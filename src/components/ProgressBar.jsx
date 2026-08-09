import React from 'react';

export default function ProgressBar({ questionNumber, totalQuestions, topicsCovered, coveredTopics }) {
  const progress = Math.min(100, ((questionNumber - 1) / totalQuestions) * 100);

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3 text-xs">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#1C1C1A]">Interview Progress</span>
          <span className="font-mono font-semibold text-[#4F46E5]">
            Question 0{Math.max(1, questionNumber - 1)} / 0{totalQuestions}
          </span>
        </div>

        <div className="w-full h-2 bg-[#F1F0EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B6B66]">
        <span>Topics Covered: <strong className="text-[#1C1C1A]">{topicsCovered} / 4 min</strong></span>
        {coveredTopics && coveredTopics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {coveredTopics.map((topic, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-[#F1F0EB] text-[#6B6B66] font-mono">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
