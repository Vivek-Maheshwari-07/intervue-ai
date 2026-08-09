import React, { useState } from 'react';
import { 
  BarChart3, 
  Terminal as TerminalIcon, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Grid, 
  UserPlus
} from 'lucide-react';

export default function MatrixDashboard({ candidates, setCandidates, selectedDifficulty, setSelectedDifficulty }) {
  const [viewMode, setViewMode] = useState('bars'); // 'bars', 'matrix', 'ascii'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: '',
    responsibility: 70,
    maxDifficulty: 7,
    colorHex: '#4F46E5'
  });

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
      avatarColor: 'from-indigo-500 to-blue-600',
      borderColor: 'border-[#4F46E5]',
      badgeColor: 'bg-[#EEF0FF] text-[#4F46E5] border-[#D9E0FF]',
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
    setNewCandidate({ name: '', role: '', responsibility: 70, maxDifficulty: 7, colorHex: '#4F46E5' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
              Assessment Matrix
            </span>
            <h1 className="text-2xl font-semibold text-[#1C1C1A]">
              Responsibility vs. Difficulty Matrix
            </h1>
            <p className="text-xs text-[#6B6B66] leading-relaxed max-w-xl">
              Evaluates candidate ownership capability against task technical complexity thresholds.
            </p>
          </div>

          {/* Quick Actions & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#F7F6F2] p-1 rounded-md border border-[#E4E2DB] flex items-center space-x-1">
              <button
                onClick={() => setViewMode('bars')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'bars'
                    ? 'bg-[#FFFFFF] text-[#4F46E5] shadow-xs font-semibold'
                    : 'text-[#6B6B66] hover:text-[#1C1C1A]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Bar View</span>
              </button>

              <button
                onClick={() => setViewMode('matrix')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-[#FFFFFF] text-[#4F46E5] shadow-xs font-semibold'
                    : 'text-[#6B6B66] hover:text-[#1C1C1A]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>2D Grid</span>
              </button>

              <button
                onClick={() => setViewMode('ascii')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === 'ascii'
                    ? 'bg-[#FFFFFF] text-[#4F46E5] shadow-xs font-semibold'
                    : 'text-[#6B6B66] hover:text-[#1C1C1A]'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>ASCII</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Difficulty Interactive Filter */}
      <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-8 h-8 rounded-md bg-[#EEF0FF] border border-[#D9E0FF] flex items-center justify-center text-[#4F46E5]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#1C1C1A]">Task Difficulty Filter</div>
            <div className="text-[11px] text-[#92928C]">Simulate task complexity from Level 1 to Level 10</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-64">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#F1F0EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
          />
          <div className="bg-[#F7F6F2] px-2.5 py-1 rounded-md border border-[#E4E2DB] text-[#4F46E5] font-mono font-bold text-xs">
            Level {selectedDifficulty}
          </div>
        </div>
      </div>

      {/* BAR VIEW */}
      {viewMode === 'bars' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E4E2DB] pb-3">
              <div>
                <h2 className="text-sm font-semibold text-[#1C1C1A]">
                  Responsibility Breakdown
                </h2>
                <p className="text-xs text-[#92928C]">
                  Showing readiness for Level {selectedDifficulty} tasks
                </p>
              </div>
              <span className="text-xs font-mono text-[#92928C]">{candidates.length} Profiles</span>
            </div>

            <div className="space-y-5">
              {candidates.map((c) => {
                const canHandle = c.maxDifficulty >= selectedDifficulty;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#1C1C1A]">{c.name}</span>
                        <span className="text-[#92928C] text-[11px]">({c.role})</span>
                        {canHandle ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF5EF] text-[#2F7D5A] border border-[#D1EADE]">
                            Qualified for L{selectedDifficulty}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF6DF] text-[#B7791F] border border-[#FFE9B3]">
                            Max L{c.maxDifficulty}
                          </span>
                        )}
                      </div>

                      <div className="font-mono text-xs text-[#6B6B66]">
                        {c.responsibility}%
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-3 bg-[#F1F0EB] rounded-md overflow-hidden p-0.5 border border-[#E4E2DB]">
                      <div
                        className={`h-full rounded-xs transition-all ${
                          canHandle ? 'bg-[#4F46E5]' : 'bg-[#92928C]'
                        }`}
                        style={{ width: `${c.responsibility}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#92928C] pt-0.5">
                      <span>Adjust ownership threshold:</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={c.responsibility}
                          onChange={(e) => updateResponsibility(c.id, parseInt(e.target.value))}
                          className="w-24 h-1 bg-[#F1F0EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                        />
                        <span className="font-mono text-[#6B6B66]">{c.responsibility}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Insight Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
              <h3 className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
                Matrix Guidelines
              </h3>

              <div className="space-y-2 text-xs text-[#6B6B66]">
                <div className="p-2.5 rounded-md bg-[#FCFCFA] border border-[#E4E2DB] space-y-0.5">
                  <div className="font-semibold text-[#1C1C1A]">100% Responsibility</div>
                  <p className="text-[11px] text-[#92928C]">Top tier architecture & incidents (Max L10).</p>
                </div>
                <div className="p-2.5 rounded-md bg-[#FCFCFA] border border-[#E4E2DB] space-y-0.5">
                  <div className="font-semibold text-[#1C1C1A]">75% Responsibility</div>
                  <p className="text-[11px] text-[#92928C]">Complex services independently (Max L8).</p>
                </div>
                <div className="p-2.5 rounded-md bg-[#FCFCFA] border border-[#E4E2DB] space-y-0.5">
                  <div className="font-semibold text-[#1C1C1A]">60% Responsibility</div>
                  <p className="text-[11px] text-[#92928C]">Standard feature delivery (Max L6).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2D SCATTER GRID */}
      {viewMode === 'matrix' && (
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
            2D Responsibility vs. Difficulty Grid
          </div>

          <div className="relative w-full h-80 bg-[#FCFCFA] rounded-lg border border-[#E4E2DB] p-6 bg-grid-pattern-light overflow-hidden">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-[#92928C]">
              RESPONSIBILITY % ↑
            </div>
            <div className="absolute bottom-2 right-4 text-[10px] font-mono text-[#92928C]">
              DIFFICULTY LEVEL →
            </div>

            <div className="absolute inset-x-8 inset-y-8">
              {candidates.map((c) => {
                const leftPercent = (c.maxDifficulty / 10) * 100;
                const bottomPercent = c.responsibility;

                return (
                  <div
                    key={c.id}
                    className="absolute -translate-x-1/2 translate-y-1/2 group cursor-pointer"
                    style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                  >
                    <div className="w-7 h-7 rounded-md bg-[#4F46E5] text-[#FFFFFF] font-bold text-xs flex items-center justify-center shadow-xs">
                      {c.name.split(' ')[1] || c.name[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ASCII MODE */}
      {viewMode === 'ascii' && (
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3 font-mono text-xs">
          <div className="text-xs text-[#92928C] font-semibold uppercase tracking-wider">ASCII Render Mode</div>
          <div className="bg-[#1C1C1A] text-[#EAF5EF] p-4 rounded-md overflow-x-auto leading-relaxed">
            <pre>
{`                 RESPONSIBILITY
                      ↑
${candidates.map(c => {
  const barLength = Math.round((c.responsibility / 100) * 15);
  const barChars = '█'.repeat(barLength).padEnd(15, ' ');
  const pName = c.name.padEnd(9, ' ');
  return `        ${pName}  ${barChars}  ${c.responsibility}% (Max L${c.maxDifficulty})`;
}).join('\n')}
                      └────────────→
                       Difficulty Filter: L${selectedDifficulty}`}
            </pre>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1C1A]/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-xl p-6 border border-[#E4E2DB] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E2DB] pb-2">
              <h3 className="text-sm font-semibold text-[#1C1C1A]">Add Candidate Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#92928C] hover:text-[#1C1C1A]">✕</button>
            </div>

            <form onSubmit={handleAddCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#6B6B66] mb-1">Candidate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Person 4"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                  className="w-full bg-[#FCFCFA] border border-[#E4E2DB] rounded-md px-3 py-1.5 text-[#1C1C1A]"
                />
              </div>

              <div>
                <label className="block text-[#6B6B66] mb-1">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={newCandidate.role}
                  onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                  className="w-full bg-[#FCFCFA] border border-[#E4E2DB] rounded-md px-3 py-1.5 text-[#1C1C1A]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md bg-[#F1F0EB] text-[#6B6B66]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-[#4F46E5] text-[#FFFFFF] font-semibold"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
