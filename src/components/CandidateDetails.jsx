import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  BookOpen,
  Award,
  Sparkles
} from 'lucide-react';
import AIUsageLogSection from './AIUsageLogSection';

const CURRICULUM_FOCUS_AREAS = [
  { name: 'RAG Architecture & Document Retrieval', day: 'Day 12' },
  { name: 'Vector Databases & Indexing Strategies', day: 'Day 17' },
  { name: 'Prompt Engineering & Constraints', day: 'Day 08' },
  { name: 'Agentic AI Workflows & State Memory', day: 'Day 22' },
  { name: 'Model Context Protocol (MCP)', day: 'Day 26' },
  { name: 'AI Deployment & Monitoring', day: 'Day 29' },
];

export default function CandidateDetails({ candidates, onStartInterview }) {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0] || {});
  const [exportMessage, setExportMessage] = useState(null);

  const handleSelectCandidate = (cand) => {
    setSelectedCandidate(cand);
    if (typeof window !== 'undefined' && window.getSelection) {
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    }
  };

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      candidateId: selectedCandidate.id,
      candidateName: selectedCandidate.name,
      role: selectedCandidate.role,
      cohort: 'Cohort 2026-A (AI Engineering)',
      completedMissions: '24 missions completed',
      learningProgress: '78% learning progress',
      responsibilityScore: `${selectedCandidate.responsibility}%`,
      maxSafeDifficulty: `Level ${selectedCandidate.maxDifficulty}`,
      skills: selectedCandidate.skills,
      teamMembers: ['Vivek Maheshwari', 'Aayush Malhotra', 'Manav Lathiya']
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCandidate.name.replace(/\s+/g, '_')}_Candidate_Profile.json`;
    a.click();

    setExportMessage(`Exported audit report for ${selectedCandidate.name}`);
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-2 select-none">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#2563EB] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Candidate Profiles & Readiness</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Select Candidate to Begin AI Technical Interview
        </h1>
        <p className="text-xs text-[#475569] leading-relaxed max-w-2xl font-sans">
          Each candidate's profile, learning missions, and technical focus areas ground the adaptive interview agent.
        </p>
      </div>

      {/* Verified AI-Usage Log URL Section */}
      <AIUsageLogSection />

      {exportMessage && (
        <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#BBF7D0] text-[#166534] text-xs font-medium flex items-center space-x-2 select-none">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Candidate Roster Selector */}
        <div className="space-y-3 select-none">
          <div className="text-xs font-mono font-semibold text-[#64748B] uppercase tracking-wider">
            Candidate Roster ({candidates.length})
          </div>

          <div className="space-y-2">
            {candidates.map((c) => {
              const isSelected = selectedCandidate.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCandidate(c)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectCandidate(c); }}
                  className={`cursor-pointer p-4 rounded-xl border transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isSelected
                      ? 'bg-[#EFF6FF]/60 border-[#2563EB] ring-1 ring-[#2563EB] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#0F172A] text-sm flex items-center space-x-1.5">
                      <span>{c.name}</span>
                      {isSelected && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.2 rounded border border-[#BFDBFE]">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                      {c.responsibility}% Resp
                    </span>
                  </div>
                  <div className="text-xs text-[#475569] mt-1">{c.role}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleExportReport}
            className="w-full mt-3 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-medium bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer select-none"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export Profile JSON</span>
          </button>
        </div>

        {/* Right 2 Columns: Candidate Overview Card */}
        <div className="md:col-span-2 space-y-6 bg-[#FFFFFF] p-6 rounded-xl border border-[#E2E8F0] shadow-xs">
          {/* Candidate Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-[#E2E8F0] gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider select-none">Target Interviewee</span>
              <h2 className="text-2xl font-bold text-[#0F172A]">{selectedCandidate.name}</h2>
              <p className="text-xs text-[#475569]">{selectedCandidate.role} · AI Cohort Candidate</p>
            </div>

            <div className="sm:text-right bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] select-none">
              <span className="text-[11px] text-[#64748B] block font-mono">Responsibility Ownership</span>
              <span className="text-xl font-bold text-[#2563EB] font-mono">{selectedCandidate.responsibility}%</span>
              <span className="text-[11px] text-[#475569] block font-mono">Max Difficulty: Level {selectedCandidate.maxDifficulty}</span>
            </div>
          </div>

          {/* Learning Progress Metrics */}
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E2E8F0] select-none">
            <div>
              <div className="text-xs font-medium text-[#64748B]">Cohort Track</div>
              <div className="text-sm font-semibold text-[#0F172A] mt-0.5">Cohort 2026-A</div>
              <div className="text-xs text-[#475569]">AI Engineering</div>
            </div>

            <div>
              <div className="text-xs font-medium text-[#64748B]">Missions Status</div>
              <div className="text-sm font-semibold text-[#0F172A] mt-0.5">24 Completed</div>
              <div className="text-xs text-[#16A34A] font-medium">Ready for AI Eval</div>
            </div>

            <div>
              <div className="text-xs font-medium text-[#64748B]">Curriculum Mastery</div>
              <div className="text-sm font-semibold text-[#0F172A] mt-0.5">78% Progress</div>
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#2563EB] w-[78%]" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider select-none">Background Summary</div>
            <p className="text-xs text-[#475569] leading-relaxed">
              {selectedCandidate.bio}
            </p>
          </div>

          {/* Interview Focus Areas */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider select-none">
              Grounding Curriculum Topics
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {CURRICULUM_FOCUS_AREAS.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <span className="font-medium text-[#0F172A]">{topic.name}</span>
                  <span className="text-[11px] font-mono text-[#64748B] ml-2 flex-shrink-0 select-none">{topic.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Hero CTA */}
          {onStartInterview && (
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs text-[#64748B] select-none">
                Engineered by <strong>Vivek Maheshwari, Aayush Malhotra, Manav Lathiya</strong>
              </span>

              <button
                onClick={() => onStartInterview(selectedCandidate.id)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-xs cursor-pointer select-none"
              >
                <span>Start AI Interview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
