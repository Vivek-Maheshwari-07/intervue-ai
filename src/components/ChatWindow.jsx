import React, { useRef, useEffect } from 'react';
import { BrainCircuit, User } from 'lucide-react';

export default function ChatWindow({ conversationHistory }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  if (!conversationHistory || conversationHistory.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Conversation History
        </h3>
      </div>

      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {conversationHistory.map((msg, i) => {
          const isInterviewer = msg.role === 'interviewer';

          return (
            <div
              key={i}
              className={`flex items-start space-x-3 ${isInterviewer ? '' : 'flex-row-reverse space-x-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  isInterviewer
                    ? 'bg-cyan-500/15 border border-cyan-500/25'
                    : 'bg-purple-500/15 border border-purple-500/25'
                }`}
              >
                {isInterviewer ? (
                  <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isInterviewer
                    ? 'bg-slate-900/80 border border-slate-800 text-slate-200'
                    : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-100'
                }`}
              >
                {isInterviewer && msg.topic && (
                  <div className="text-[9px] font-mono text-cyan-500/70 mb-1">
                    {msg.topic}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>
    </div>
  );
}
