import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MatrixDashboard from './components/MatrixDashboard';
import AIInterviewer from './components/AIInterviewer';
import CandidateDetails from './components/CandidateDetails';
import { INITIAL_CANDIDATES } from './data/mockData';
import { useInterview } from './hooks/useInterview';

export default function App() {
  // Default home view is candidate overview
  const [activeTab, setActiveTab] = useState('candidates');
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [selectedDifficulty, setSelectedDifficulty] = useState(6);

  // Centralized Single Canonical Interview State Hook
  const interviewState = useInterview();

  // Compute average reliability score
  const totalReliability = Math.round(
    candidates.reduce((acc, curr) => acc + curr.responsibility, 0) / candidates.length
  );

  // Handler for Start Interview trigger from Candidate Overview
  const handleStartInterviewFromProfile = (candidateId) => {
    interviewState.startSession(candidateId);
    setActiveTab('interviewer');
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1C1C1A] font-sans flex flex-col selection:bg-[#EEF0FF] selection:text-[#4F46E5]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidatesCount={candidates.length}
        totalReliability={totalReliability}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'candidates' && (
          <CandidateDetails
            candidates={candidates}
            onStartInterview={handleStartInterviewFromProfile}
          />
        )}

        {activeTab === 'interviewer' && (
          <AIInterviewer
            candidates={candidates}
            interviewState={interviewState}
            onStartInterview={handleStartInterviewFromProfile}
          />
        )}

        {activeTab === 'matrix' && (
          <MatrixDashboard
            candidates={candidates}
            setCandidates={setCandidates}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E2DB] bg-[#F1F0EB] py-6 text-center text-xs text-[#686862]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#1C1C1A]">INTERVUE AI</span>
            <span className="text-[#96968F]">— Personalized AI Technical Interviewer</span>
          </div>
          <div className="text-[#96968F]">
            <span>Engineered by Vivek Maheshwari, Aayush Malhotra, Manav Lathiya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
