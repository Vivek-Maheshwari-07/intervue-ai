import React from 'react';

export default function QuestionCard({ question, questionNumber, totalQuestions, topic }) {
  return (
    <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
      <div className="flex items-center justify-between border-b border-[#E4E2DB] pb-3">
        <span className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
          AI INTERVIEWER · Question 0{questionNumber} / 0{totalQuestions}
        </span>

        {topic && (
          <span className="text-xs font-mono text-[#6B6B66] bg-[#F1F0EB] px-2.5 py-0.5 rounded border border-[#E4E2DB]">
            {topic}
          </span>
        )}
      </div>

      <p className="text-[#1C1C1A] text-base leading-relaxed font-normal">
        {question}
      </p>
    </div>
  );
}
