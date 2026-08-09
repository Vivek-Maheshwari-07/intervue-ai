import React, { useState } from 'react';
import { ExternalLink, Copy, Check, FileText } from 'lucide-react';

// Verified Git Remote URL: https://github.com/Vivek-Maheshwari-07/intervue-ai
// Verified Branch: main
// Verified Document: PROMPTS.md
const VERIFIED_PROMPTS_URL = 'https://github.com/Vivek-Maheshwari-07/intervue-ai/blob/main/PROMPTS.md';

export default function AIUsageLogSection({ className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(VERIFIED_PROMPTS_URL);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] p-5 shadow-xs space-y-3 select-none ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-mono font-semibold text-[#0F172A] uppercase tracking-wider">
            AI-Usage Log URL
          </span>
        </div>

        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          VERIFIED REPOSITORY PATH
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
        <a
          href={VERIFIED_PROMPTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 font-mono text-xs text-[#2563EB] hover:underline truncate flex items-center space-x-1.5 focus:outline-none min-w-0"
          title={VERIFIED_PROMPTS_URL}
        >
          <span className="truncate">{VERIFIED_PROMPTS_URL}</span>
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 text-[#2563EB]" />
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#FFFFFF] border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-medium transition-colors cursor-pointer flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-[#16A34A] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-[#64748B] font-sans">
        Public link to the project's verified AI usage and prompt documentation (<code className="font-mono text-[#0F172A] bg-[#F1F5F9] px-1 py-0.5 rounded">PROMPTS.md</code>).
      </p>
    </div>
  );
}
