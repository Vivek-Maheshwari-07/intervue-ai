import React, { useState } from 'react';
import { 
  Download, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

const CURRICULUM_FOCUS_AREAS = [
  { name: 'RAG Architecture', day: 'Day 12' },
  { name: 'Vector Databases', day: 'Day 17' },
  { name: 'Prompt Engineering', day: 'Day 08' },
  { name: 'Agentic AI', day: 'Day 22' },
  { name: 'MCP (Model Context Protocol)', day: 'Day 26' },
  { name: 'AI Deployment', day: 'Day 29' },
  { name: 'Production AI Systems', day: 'Day 30' },
];

export default function CandidateDetails({ candidates, onStartInterview }) {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
  const [exportMessage, setExportMessage] = useState(null);

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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b border-[#E4E2DB]">
        <h1 className="text-2xl font-semibold text-[#1C1C1A] tracking-tight">
          Technical Interview
        </h1>
        <p className="text-sm text-[#686862]">
          Personalized to your AI Cohort journey.
        </p>
      </div>

      {exportMessage && (
        <div className="p-3 rounded-md bg-[#EAF5EF] border border-[#D1EADE] text-[#2F7D5A] text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Candidate Selector */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#96968F] uppercase tracking-wider">
            Candidate Roster
          </div>

          <div className="space-y-2">
            {candidates.map((c) => {
              const isSelected = selectedCandidate.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidate(c)}
                  className={`cursor-pointer p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#4F46E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'bg-[#FCFCFA] border-[#E4E2DB] hover:border-[#D7D5CD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#1C1C1A] text-sm">{c.name}</div>
                    <span className="text-xs font-mono text-[#686862]">{c.responsibility}%</span>
                  </div>
                  <div className="text-xs text-[#686862] mt-0.5">{c.role}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleExportReport}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-medium bg-[#FFFFFF] border border-[#E4E2DB] text-[#1C1C1A] hover:bg-[#F7F6F2] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#686862]" />
            <span>Export Profile JSON</span>
          </button>
        </div>

        {/* Right 2-Cols: Candidate Overview Profile */}
        <div className="md:col-span-2 space-y-6 bg-[#FFFFFF] p-6 rounded-xl border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {/* Candidate Profile Header */}
          <div className="flex items-start justify-between pb-5 border-b border-[#E4E2DB]">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#96968F]">CANDIDATE</span>
              <h2 className="text-xl font-semibold text-[#1C1C1A]">{selectedCandidate.name}</h2>
              <p className="text-xs text-[#686862]">AI Cohort Candidate · {selectedCandidate.role}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#96968F] block font-mono">Responsibility Ownership</span>
              <span className="text-lg font-bold text-[#4F46E5] font-mono">{selectedCandidate.responsibility}%</span>
              <span className="text-xs text-[#686862] block font-mono">Max Difficulty L{selectedCandidate.maxDifficulty}</span>
            </div>
          </div>

          {/* Learning Progress Metrics */}
          <div className="grid grid-cols-3 gap-4 py-2 border-b border-[#E4E2DB]">
            <div>
              <div className="text-xs text-[#96968F]">Cohort Info</div>
              <div className="text-sm font-semibold text-[#1C1C1A] mt-0.5">Cohort 2026-A</div>
              <div className="text-xs text-[#686862]">AI Engineering</div>
            </div>

            <div>
              <div className="text-xs text-[#96968F]">Completed Missions</div>
              <div className="text-sm font-semibold text-[#1C1C1A] mt-0.5">24 missions</div>
              <div className="text-xs text-[#2F7D5A]">Completed</div>
            </div>

            <div>
              <div className="text-xs text-[#96968F]">Learning Progress</div>
              <div className="text-sm font-semibold text-[#1C1C1A] mt-0.5">78% progress</div>
              <div className="w-full h-1.5 bg-[#F1F0EB] rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#4F46E5] w-[78%]" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-[#96968F] uppercase tracking-wider">Background Summary</div>
            <p className="text-xs text-[#686862] leading-relaxed">
              {selectedCandidate.bio}
            </p>
          </div>

          {/* Interview Focus Areas */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-[#96968F] uppercase tracking-wider">
              Interview Areas
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {CURRICULUM_FOCUS_AREAS.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-md bg-[#FCFCFA] border border-[#E4E2DB]"
                >
                  <span className="font-medium text-[#1C1C1A]">{topic.name}</span>
                  <span className="text-[11px] font-mono text-[#96968F]">{topic.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Action */}
          {onStartInterview && (
            <div className="pt-4 border-t border-[#E4E2DB] flex justify-end">
              <button
                onClick={() => onStartInterview(selectedCandidate.id)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer"
              >
                <span>Start Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
