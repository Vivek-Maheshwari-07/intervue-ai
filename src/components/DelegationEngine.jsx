import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Flame, 
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';

import { SAMPLE_TASKS } from '../data/mockData';

export default function DelegationEngine({ candidates }) {
  const [taskList, setTaskList] = useState(SAMPLE_TASKS);
  const [selectedTask, setSelectedTask] = useState(SAMPLE_TASKS[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState(6);
  const [newTaskRisk, setNewTaskRisk] = useState('Medium');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const taskObj = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      difficulty: parseInt(newTaskDifficulty),
      risk: newTaskRisk,
      estimatedHours: 20,
      requiredResponsibility: parseInt(newTaskDifficulty) * 10,
      tags: ['Custom Workload', 'Feature']
    };

    setTaskList(prev => [taskObj, ...prev]);
    setSelectedTask(taskObj);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
          <Zap className="w-4 h-4" />
          <span>Automated Workload & Responsibility Allocator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Task Delegation Matching Engine
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          Matches engineering tasks against the Responsibility Matrix. Ensures high-difficulty, mission-critical architecture 
          is owned by Person 1 (100%), while routing moderate complexity tasks to Person 3 (75%) and Person 2 (60%).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Task Queue & Creation */}
        <div className="space-y-6">
          {/* Quick Create Task Form */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Define New Engineering Task</span>
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zero-Downtime Data Pipeline Migration"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Difficulty: <strong className="text-cyan-400">L{newTaskDifficulty}</strong></label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Failure Risk</label>
                  <select
                    value={newTaskRisk}
                    onChange={(e) => setNewTaskRisk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                Add to Delegation Queue
              </button>
            </form>
          </div>

          {/* Task Queue List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Pending Tasks ({taskList.length})</span>
            </h3>

            {taskList.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all space-y-2 ${
                    isSelected
                      ? 'glass-panel-glow border-cyan-500/50 bg-cyan-950/20'
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-400">Difficulty L{task.difficulty}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.risk === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      task.risk === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {task.risk} Risk
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm">{task.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2-Cols: Algorithmic Recommendation & Candidate Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              {/* Task Detail Summary */}
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">SELECTED WORKLOAD SPECIFICATION</span>
                  <h2 className="text-xl font-bold text-white mt-1">{selectedTask.title}</h2>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    Difficulty: <strong className="text-cyan-400 text-sm">L{selectedTask.difficulty}</strong>
                  </div>
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    Required Resp: <strong className="text-indigo-400 text-sm">{selectedTask.requiredResponsibility}%</strong>
                  </div>
                </div>
              </div>

              {/* Recommendation Cards per Candidate */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200">Ownership Readiness Evaluation</h3>

                <div className="space-y-4">
                  {candidates.map((candidate) => {
                    const diffGap = candidate.maxDifficulty - selectedTask.difficulty;
                    const respGap = candidate.responsibility - selectedTask.requiredResponsibility;
                    const isOptimal = diffGap >= 0 && respGap >= -10;
                    const isOverqualified = diffGap >= 3;
                    const isUnderqualified = diffGap < 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isOptimal
                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                            : isUnderqualified
                            ? 'bg-slate-900/40 border-slate-800 opacity-60'
                            : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-white text-base">{candidate.name}</span>
                              <span className="text-xs text-slate-400 font-mono">({candidate.role})</span>
                              {isOptimal && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>RECOMMENDED OWNER</span>
                                </span>
                              )}
                              {isUnderqualified && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>HIGH BURNOUT / OVERREACH</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{candidate.bio}</p>
                          </div>

                          <div className="flex items-center space-x-4 font-mono text-xs flex-shrink-0">
                            <div className="text-right">
                              <div className="text-slate-400">Responsibility</div>
                              <div className="text-base font-extrabold text-cyan-400">{candidate.responsibility}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-slate-400">Max Difficulty</div>
                              <div className="text-base font-extrabold text-purple-400">L{candidate.maxDifficulty}</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Match Bar */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center space-x-2">
                            <span>Suitability Rating:</span>
                            <span className={`font-bold ${isOptimal ? 'text-emerald-400' : isUnderqualified ? 'text-amber-400' : 'text-slate-300'}`}>
                              {isOptimal ? '98% Perfect Fit' : isUnderqualified ? '42% Risk Warning' : '85% Secondary Match'}
                            </span>
                          </div>

                          <button
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isOptimal
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            Assign Task to {candidate.name.split(' ')[1] || candidate.name}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
