import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Code2, 
  BrainCircuit, 
  CheckCircle2, 
  RefreshCw, 
  Trophy, 
  HelpCircle,
  Zap,
  Award,
  ChevronRight,
  MessageSquareCode
} from 'lucide-react';

import confetti from 'canvas-confetti';
import { QUESTION_BANK } from '../data/mockData';

export default function AIInterviewer({ candidates, setCandidates }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || 'person-1');
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTION_BANK[0]);
  const [candidateCode, setCandidateCode] = useState(QUESTION_BANK[0].sampleSolution);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  const handleQuestionSelect = (q) => {
    setSelectedQuestion(q);
    setCandidateCode(q.sampleSolution);
    setEvaluationResult(null);
    setShowHint(false);
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setEvaluationResult(null);

    setTimeout(() => {
      setIsEvaluating(false);

      // Algorithmic evaluation score calculation based on code length, key terms, difficulty
      const codeLength = candidateCode.trim().length;
      const difficultyFactor = selectedQuestion.difficulty;
      
      let score = 75;
      if (codeLength > 100) score += 15;
      if (candidateCode.includes('Map') || candidateCode.includes('redis') || candidateCode.includes('Architecture')) score += 10;
      score = Math.min(100, Math.max(50, score));

      // Calculate calculated responsibility impact
      const newlyCalculatedResponsibility = Math.min(100, Math.round(score * (1 + (difficultyFactor / 20))));

      const resultObj = {
        score,
        difficulty: selectedQuestion.difficulty,
        calculatedResponsibility: newlyCalculatedResponsibility,
        feedback: [
          `Strong architectural grasp demonstrated for Level ${selectedQuestion.difficulty} task.`,
          `Code complexity & state management aligned with ${newlyCalculatedResponsibility}% responsibility threshold.`,
          `Handled key boundary cases and scalability tradeoffs effectively.`
        ],
        strengths: ['Algorithmic Efficiency', 'Clear Code Structure', 'High Responsibility Readiness'],
      };

      setEvaluationResult(resultObj);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore fallback
      }

      // Update candidate's responsibility rating if score is high
      setCandidates(prev => prev.map(c => {
        if (c.id === selectedCandidateId) {
          const updatedResp = Math.min(100, Math.max(c.responsibility, newlyCalculatedResponsibility));
          return {
            ...c,
            responsibility: updatedResp,
            maxDifficulty: Math.max(c.maxDifficulty, Math.round(updatedResp / 10)),
            evaluatedTasks: c.evaluatedTasks + 1
          };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            <span>AI Evaluation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Technical Interview Simulator
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Conduct adaptive technical interviews scaled by difficulty. Evaluate code solutions, system architecture strategies, 
            and automatically calibrate candidate Responsibility Scores.
          </p>
        </div>

        {/* Candidate Selector Pill */}
        <div className="w-full lg:w-auto bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Target Interviewee:
          </label>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white font-bold rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — Current Ownership: {c.responsibility}% (Max L{c.maxDifficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Question Selector Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span>Select Interview Question</span>
          </h3>

          <div className="space-y-3">
            {QUESTION_BANK.map((q) => {
              const isSelected = selectedQuestion.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => handleQuestionSelect(q)}
                  className={`cursor-pointer p-4 rounded-xl transition-all border ${
                    isSelected
                      ? 'glass-panel-glow border-cyan-500/50 bg-cyan-950/20'
                      : 'glass-panel border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-400">{q.category}</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Difficulty L{q.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{q.title}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : 'text-slate-500'}`} />
                  </h4>
                </div>
              );
            })}
          </div>

          {/* Current Candidate Card Mini */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400">Assessed Profile</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-base">{selectedCandidate?.name}</div>
                <div className="text-xs text-slate-400">{selectedCandidate?.role}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Current Score</div>
                <div className="text-lg font-extrabold text-cyan-400">{selectedCandidate?.responsibility}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2-Cols: Interview Editor & AI Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
            {/* Question Header */}
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">{selectedQuestion.levelLabel}</span>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center space-x-1 text-xs text-cyan-400 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hints' : 'View Architectural Hints'}</span>
                </button>
              </div>

              <h2 className="text-xl font-bold text-white">{selectedQuestion.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 font-mono">
                {selectedQuestion.scenario}
              </p>

              {showHint && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                  <span className="font-bold">Architectural Guidance:</span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    {selectedQuestion.hints.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code / Solution Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5 font-mono">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Candidate Response & Solution Draft:</span>
                </span>
                <span className="font-mono text-[10px]">JavaScript / Pseudo System Code</span>
              </div>

              <textarea
                rows={10}
                value={candidateCode}
                onChange={(e) => setCandidateCode(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500/60 leading-relaxed shadow-inner"
              />
            </div>

            {/* Submit & AI Evaluate Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCandidateCode(selectedQuestion.sampleSolution)}
                className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Default Solution</span>
              </button>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 shadow-lg shadow-indigo-500/25 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run AI Evaluation & Score</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI EVALUATION RESULT MODAL / CARD */}
          {evaluationResult && (
            <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">AI Evaluation Summary Report</h3>
                    <p className="text-xs text-slate-400">Assessed against Difficulty Level {evaluationResult.difficulty}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">NEW RESPONSIBILITY SCORE</div>
                  <div className="text-2xl font-extrabold text-cyan-400">{evaluationResult.calculatedResponsibility}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-200">Evaluation Points:</div>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {evaluationResult.feedback.map((f, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-200">Validated Competencies:</div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evaluationResult.strengths.map((s, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Candidate matrix status for <strong>{selectedCandidate.name}</strong> automatically updated to {evaluationResult.calculatedResponsibility}%.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
