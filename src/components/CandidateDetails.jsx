import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  ShieldCheck, 
  Activity, 
  FileText, 
  Download, 
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  BarChart2
} from 'lucide-react';

export default function CandidateDetails({ candidates }) {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
  const [exportMessage, setExportMessage] = useState(null);

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      candidateName: selectedCandidate.name,
      role: selectedCandidate.role,
      responsibilityScore: `${selectedCandidate.responsibility}%`,
      maxSafeDifficulty: `Level ${selectedCandidate.maxDifficulty}`,
      skills: selectedCandidate.skills,
      evaluationSummary: 'Evaluated under Intervue AI Responsibility vs Difficulty Framework v2.4'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCandidate.name.replace(/\s+/g, '_')}_Responsibility_Report.json`;
    a.click();

    setExportMessage(`Exported audit report for ${selectedCandidate.name}`);
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-purple-400 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Profile Benchmarks & Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Competency Profiler
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            In-depth evaluation matrix detailing technical mastery, autonomous ownership, crisis recovery, and task history.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 shadow-md transition-all"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export JSON Audit Report</span>
        </button>
      </div>

      {exportMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Candidate List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Loaded Matrix Profiles</h3>

          {candidates.map((c) => {
            const isSelected = selectedCandidate.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className={`cursor-pointer p-4 rounded-xl border transition-all space-y-3 ${
                  isSelected
                    ? 'glass-panel-glow border-cyan-500/50 bg-cyan-950/20'
                    : 'glass-panel border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-base">{c.name}</div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.badgeColor}`}>
                    {c.responsibility}% Resp
                  </span>
                </div>
                <div className="text-xs text-slate-400">{c.role}</div>

                {/* Mini skill bar preview */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${c.responsibility}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2-Cols: Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
            {/* Header Profile Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-extrabold text-white">{selectedCandidate.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${selectedCandidate.badgeColor}`}>
                    Max Difficulty L{selectedCandidate.maxDifficulty}
                  </span>
                </div>
                <p className="text-xs text-cyan-400 font-mono">{selectedCandidate.role}</p>
              </div>

              <div className="text-left sm:text-right font-mono bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">RESPONSIBILITY THRESHOLD</div>
                <div className="text-2xl font-black text-cyan-400">{selectedCandidate.responsibility}%</div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-sans">
              {selectedCandidate.bio}
            </p>

            {/* Competencies Progress Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Core Skill Matrix (0 - 100 Scale)</span>
              </h3>

              <div className="space-y-4">
                {Object.entries(selectedCandidate.skills).map(([skillKey, score]) => {
                  const formattedName = skillKey
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());

                  return (
                    <div key={skillKey} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-300">{formattedName}</span>
                        <span className="font-mono font-bold text-cyan-400">{score} / 100</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-md bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evaluation Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400">EVALUATED TASKS</div>
                <div className="text-xl font-bold text-white">{selectedCandidate.evaluatedTasks} Tasks</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400">SUCCESS RATE</div>
                <div className="text-xl font-bold text-emerald-400">{selectedCandidate.successRate}%</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-mono text-slate-400">AUTONOMY TIER</div>
                <div className="text-xl font-bold text-indigo-400">
                  {selectedCandidate.responsibility >= 90 ? 'Full Lead' : selectedCandidate.responsibility >= 70 ? 'Independent' : 'Guided'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
