import React, { useRef, useEffect } from 'react';

export default function ChatWindow({ conversationHistory }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  if (!conversationHistory || conversationHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E4E2DB] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-2 p-4">
      <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider border-b border-[#E4E2DB] pb-2">
        Transcript History
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 pt-1 pr-1 text-xs">
        {conversationHistory.map((msg, i) => {
          const isInterviewer = msg.role === 'interviewer';

          return (
            <div
              key={i}
              className={`p-3 rounded-md border leading-relaxed ${
                isInterviewer
                  ? 'bg-[#FCFCFA] border-[#E4E2DB] text-[#6B6B66]'
                  : 'bg-[#EEF0FF] border-[#D9E0FF] text-[#1C1C1A]'
              }`}
            >
              <div className="text-[10px] font-mono text-[#92928C] mb-1">
                {isInterviewer ? 'AI Interviewer' : 'Candidate'}
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>
    </div>
  );
}
