import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MatrixDashboard from './components/MatrixDashboard';
import AIInterviewer from './components/AIInterviewer';
import DelegationEngine from './components/DelegationEngine';
import CandidateDetails from './components/CandidateDetails';
import { INITIAL_CANDIDATES } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [selectedDifficulty, setSelectedDifficulty] = useState(6);

  // Compute average reliability score
  const totalReliability = Math.round(
    candidates.reduce((acc, curr) => acc + curr.responsibility, 0) / candidates.length
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col">
      {/* Dynamic Background Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidatesCount={candidates.length}
        totalReliability={totalReliability}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'matrix' && (
          <MatrixDashboard
            candidates={candidates}
            setCandidates={setCandidates}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
          />
        )}

        {activeTab === 'interviewer' && (
          <AIInterviewer
            candidates={candidates}
            setCandidates={setCandidates}
          />
        )}

        {activeTab === 'delegation' && (
          <DelegationEngine
            candidates={candidates}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidateDetails
            candidates={candidates}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400 font-bold">Intervue AI</span>
            <span>— Responsibility vs Difficulty Assessment Platform</span>
          </div>
          <div>
            <span>Engineered with React + Chart.js + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
