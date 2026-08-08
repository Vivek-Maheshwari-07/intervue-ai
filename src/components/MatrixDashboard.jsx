import React, { useState } from 'react';
import { 
  BarChart3, 
  Terminal as TerminalIcon, 
  Sliders, 
  Plus, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Grid, 
  Sparkles,
  ArrowUpRight,
  UserPlus,
  RotateCcw
} from 'lucide-react';

export default function MatrixDashboard({ candidates, setCandidates, selectedDifficulty, setSelectedDifficulty }) {
  const [viewMode, setViewMode] = useState('bars'); // 'bars', 'matrix', 'ascii'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: '',
    responsibility: 70,
    maxDifficulty: 7,
    colorHex: '#3b82f6'
  });

  // Handle responsibility adjustment via slider
  const updateResponsibility = (id, newResp) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          responsibility: newResp,
          maxDifficulty: Math.max(1, Math.min(10, Math.round(newResp / 10)))
        };
      }
      return c;
    }));
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!newCandidate.name) return;
    const id = `person-${Date.now()}`;
    const resp = parseInt(newCandidate.responsibility);
    const candidateObj = {
      id,
      name: newCandidate.name,
      role: newCandidate.role || 'Custom Candidate',
      responsibility: resp,
      maxDifficulty: Math.max(1, Math.min(10, Math.round(resp / 10))),
      avatarColor: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      colorHex: newCandidate.colorHex,
      skills: {
        systemDesign: resp,
        problemComplexity: Math.max(50, resp - 5),
        autonomousOwnership: resp,
        crisisRecovery: Math.max(40, resp - 10),
        leadership: Math.max(45, resp - 8),
      },
      bio: 'Custom candidate profile added via interactive matrix controls.',
      evaluatedTasks: 5,
      successRate: 92.5
    };

    setCandidates(prev => [...prev, candidateObj]);
    setShowAddModal(false);
    setNewCandidate({ name: '', role: '', responsibility: 70, maxDifficulty: 7, colorHex: '#3b82f6' });
  };

  const resetPresets = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Assessment Framework</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Responsibility vs. Difficulty Matrix
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Evaluating candidate ownership capability against technical task complexity. 
              Visualizing how responsibility thresholds (100%, 75%, 60%) correlate with maximum safe execution difficulty.
            </p>
          </div>

          {/* Quick Actions & View Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('bars')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'bars'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar Chart</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2D Scatter Grid</span>
              </button>

              <button
                onClick={() => setViewMode('ascii')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'ascii'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>Terminal ASCII</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Candidate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty Interactive Slider Bar */}
      <div className="glass-panel rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Target Task Difficulty Filter</h3>
            <p className="text-xs text-slate-400">Simulate task complexity from Level 1 (Easy) to Level 10 (High Risk System Design)</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-72">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex items-center space-x-1 min-w-[70px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-cyan-400 font-mono font-bold text-sm">
            <span>Lvl</span>
            <span className="text-base">{selectedDifficulty}</span>
          </div>
        </div>
      </div>

      {/* MAIN VIEW AREA */}
      {viewMode === 'bars' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Horizontal Chart */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Responsibility Breakdown Bar Graph</span>
                  <span className="text-xs font-normal text-slate-400">(X-Axis: Difficulty scale →)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Highlighting candidate readiness for Level {selectedDifficulty} tasks.
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {candidates.length} Profiles Loaded
              </div>
            </div>

            {/* Dynamic Visual Bars */}
            <div className="space-y-6 pt-4">
              {candidates.map((c) => {
                const canHandle = c.maxDifficulty >= selectedDifficulty;
                return (
                  <div key={c.id} className="space-y-2 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span className="text-slate-400 font-mono text-xs">({c.role})</span>
                        {canHandle ? (
                          <span className="flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Qualified for L{selectedDifficulty}</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Exceeds Max L{c.maxDifficulty}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-slate-400">Max Difficulty: <strong className="text-cyan-400">L{c.maxDifficulty}</strong></span>
                        <span className="text-base font-extrabold text-white">{c.responsibility}%</span>
                      </div>
                    </div>

                    {/* Bar track */}
                    <div className="relative w-full h-8 bg-slate-900/90 rounded-xl overflow-hidden p-1 border border-slate-800">
                      {/* Grid markers inside bar */}
                      <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                          <div key={val} className="h-full border-r border-slate-500 text-[9px] text-slate-400 pt-0.5"></div>
                        ))}
                      </div>

                      {/* Filled Progress */}
                      <div
                        className={`h-full rounded-lg transition-all duration-700 relative overflow-hidden shadow-lg ${
                          canHandle 
                            ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600' 
                            : 'bg-gradient-to-r from-slate-700 via-amber-700 to-amber-600 opacity-70'
                        }`}
                        style={{ width: `${c.responsibility}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30 animate-pulse-subtle" />
                      </div>
                    </div>

                    {/* Responsibility Slider per Candidate */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Adjust Responsibility Ownership %:</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={c.responsibility}
                          onChange={(e) => updateResponsibility(c.id, parseInt(e.target.value))}
                          className="w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <span className="font-mono font-semibold text-slate-300">{c.responsibility}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Matrix Rules & Insights</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center justify-between">
                    <span>PERSON 1 (100% Responsibility)</span>
                    <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-400">Max L10</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Handles top tier system design & high risk mission-critical architecture. Full autonomy.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-1">
                  <div className="font-bold text-purple-300 flex items-center justify-between">
                    <span>PERSON 3 (75% Responsibility)</span>
                    <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-400">Max L8</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Solves complex features & services independently. Requires light senior review on core migrations.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center justify-between">
                    <span>PERSON 2 (60% Responsibility)</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">Max L6</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Delivers standard product features and modules with guided oversight and clear specifications.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Status Card */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Selected Level {selectedDifficulty} Readiness</h4>
              {candidates.filter(c => c.maxDifficulty >= selectedDifficulty).length > 0 ? (
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {candidates.filter(c => c.maxDifficulty >= selectedDifficulty).length} candidate(s) ready to lead
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-amber-400 text-sm font-semibold">
                  <ShieldAlert className="w-5 h-5" />
                  <span>No candidate has required L{selectedDifficulty} clearance</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2D MATRIX SCATTER VIEW */}
      {viewMode === 'matrix' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">2D Responsibility vs. Difficulty Grid</h2>
              <p className="text-xs text-slate-400">X-Axis: Difficulty Level (1 to 10) | Y-Axis: Responsibility Ownership % (0% to 100%)</p>
            </div>
          </div>

          {/* Canvas Scatter Grid */}
          <div className="relative w-full h-96 bg-slate-950/90 rounded-2xl border border-slate-800 p-8 bg-grid-pattern overflow-hidden">
            {/* Axis Labels */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-mono font-bold text-slate-400 tracking-wider">
              RESPONSIBILITY % ↑
            </div>
            <div className="absolute bottom-3 right-6 text-xs font-mono font-bold text-slate-400 tracking-wider">
              DIFFICULTY LEVEL →
            </div>

            {/* Grid Line Markers */}
            <div className="absolute inset-x-12 inset-y-12 flex justify-between pointer-events-none opacity-20 border-b border-l border-slate-500">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(lvl => (
                <div key={lvl} className="h-full border-r border-slate-600 relative">
                  <span className="absolute bottom-[-22px] -left-2 text-[10px] font-mono text-slate-400">L{lvl}</span>
                </div>
              ))}
            </div>

            {/* Plot Points for Candidates */}
            <div className="absolute inset-x-12 inset-y-12">
              {candidates.map((c) => {
                const leftPercent = (c.maxDifficulty / 10) * 100;
                const bottomPercent = c.responsibility;
                const isSelected = c.maxDifficulty >= selectedDifficulty;

                return (
                  <div
                    key={c.id}
                    className="absolute -translate-x-1/2 translate-y-1/2 group cursor-pointer transition-all duration-500"
                    style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                  >
                    {/* Glowing point marker */}
                    <div className="relative flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs text-white shadow-xl transition-transform group-hover:scale-125 ${
                        isSelected ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 ring-4 ring-cyan-500/30' : 'bg-slate-700 opacity-60'
                      }`}>
                        {c.name.split(' ')[1] || c.name[0]}
                      </div>

                      {/* Tooltip Card on Hover */}
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 glass-panel p-3 rounded-xl border border-cyan-500/30 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-30 space-y-1">
                        <div className="font-bold text-xs text-white">{c.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{c.role}</div>
                        <div className="text-[10px] text-slate-300 flex justify-between pt-1 border-t border-slate-800">
                          <span>Responsibility: <strong>{c.responsibility}%</strong></span>
                          <span>Max Diff: <strong>L{c.maxDifficulty}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TERMINAL ASCII MODE */}
      {viewMode === 'ascii' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-slate-400 ml-2">intervue-ai-matrix-terminal --v2.4</span>
            </div>
            <span className="text-xs text-emerald-400">STATUS: LIVE ASCII RENDER</span>
          </div>

          <div className="bg-[#050811] p-6 rounded-xl border border-slate-800 overflow-x-auto text-emerald-400 leading-relaxed text-sm">
            <pre className="select-none">
{`                 RESPONSIBILITY
                      ↑
                      │
${candidates.map(c => {
  const barLength = Math.round((c.responsibility / 100) * 15);
  const barChars = '█'.repeat(barLength).padEnd(15, ' ');
  const pName = c.name.padEnd(9, ' ');
  return `        ${pName}  ${barChars}  ${c.responsibility}% (Max L${c.maxDifficulty})`;
}).join('\n')}
                      │
                      └────────────→
                       Difficulty (Filter Active: Level ${selectedDifficulty})`}
            </pre>
          </div>

          <p className="text-xs text-slate-400">
            Prompt reproduction mode rendering exact ASCII structure with real-time reactive bar updates.
          </p>
        </div>
      )}

      {/* ADD CANDIDATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Add Candidate to Matrix</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Person 4 or Alex Vance"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role / Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Backend Engineer"
                  value={newCandidate.role}
                  onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Initial Responsibility Ownership: <strong className="text-cyan-400">{newCandidate.responsibility}%</strong>
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={newCandidate.responsibility}
                  onChange={(e) => setNewCandidate({ ...newCandidate, responsibility: e.target.value })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
