import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AIInterviewer from './components/AIInterviewer';
import CandidateDetails from './components/CandidateDetails';
import { INITIAL_CANDIDATES } from './data/mockData';
import { useInterview } from './hooks/useInterview';

export default function App() {
  // Default home view is candidate roster overview
  const [activeTab, setActiveTab] = useState('candidates');
  const [candidates] = useState(INITIAL_CANDIDATES);

  // Single Canonical Interview State Hook
  const interviewState = useInterview();

  // Handler for Start AI Interview trigger from Candidate Overview
  const handleStartInterviewFromProfile = (candidateId) => {
    interviewState.startSession(candidateId);
    setActiveTab('interviewer');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-[#EFF6FF] selection:text-[#2563EB]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        candidatesCount={candidates.length}
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
      </main>

      {/* Modern Light Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-6 text-xs text-[#64748B]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#0F172A] font-mono tracking-tight">INTERVUE <span className="text-[#2563EB]">AI</span></span>
            <span className="text-[#94A3B8]">— Adaptive Technical Interviewer</span>
          </div>
          <div className="text-[#64748B]">
            <span>Engineered by <strong>Vivek Maheshwari, Aayush Malhotra, Manav Lathiya</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
