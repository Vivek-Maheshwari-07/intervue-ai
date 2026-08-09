import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-1">
        <span className="text-xs font-mono text-[#92928C] uppercase tracking-wider">
          Task Allocation Engine
        </span>
        <h1 className="text-2xl font-semibold text-[#1C1C1A]">
          Workload & Responsibility Delegation
        </h1>
        <p className="text-xs text-[#6B6B66] leading-relaxed max-w-2xl">
          Matches engineering tasks against candidate responsibility thresholds to ensure safe ownership allocation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task Queue & Creation */}
        <div className="space-y-6">
          {/* Quick Create Task Form */}
          <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-3">
            <h3 className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
              Define Engineering Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-[#6B6B66] block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Pipeline Migration"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#FCFCFA] border border-[#E4E2DB] rounded-md px-3 py-1.5 text-[#1C1C1A] focus:outline-none focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#6B6B66] block mb-1">Difficulty: <strong className="text-[#4F46E5]">L{newTaskDifficulty}</strong></label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full h-1.5 bg-[#F1F0EB] rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="text-[#6B6B66] block mb-1">Failure Risk</label>
                  <select
                    value={newTaskRisk}
                    onChange={(e) => setNewTaskRisk(e.target.value)}
                    className="w-full bg-[#FCFCFA] border border-[#E4E2DB] rounded-md px-2 py-1 text-[#1C1C1A]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-md bg-[#4F46E5] hover:bg-[#4338CA] text-[#FFFFFF] font-semibold text-xs transition-colors cursor-pointer"
              >
                Add Task to Queue
              </button>
            </form>
          </div>

          {/* Task Queue List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-[#92928C] uppercase tracking-wider">
              Pending Tasks ({taskList.length})
            </div>

            {taskList.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`cursor-pointer p-3.5 rounded-lg border transition-all space-y-1 ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#4F46E5] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'bg-[#FCFCFA] border-[#E4E2DB] hover:border-[#D7D5CD]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#4F46E5] font-semibold">Level {task.difficulty}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      task.risk === 'Critical' ? 'bg-[#FCECEC] text-[#B54747] border border-[#F8CACA]' :
                      task.risk === 'High' ? 'bg-[#FFF6DF] text-[#B7791F] border border-[#FFE9B3]' :
                      'bg-[#EAF5EF] text-[#2F7D5A] border border-[#D1EADE]'
                    }`}>
                      {task.risk} Risk
                    </span>
                  </div>

                  <div className="font-medium text-[#1C1C1A] text-xs">{task.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2-Cols: Candidate Ownership Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask && (
            <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] space-y-5">
              {/* Task Detail Summary */}
              <div className="border-b border-[#E4E2DB] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-[#92928C]">WORKLOAD SPECIFICATION</span>
                  <h2 className="text-lg font-semibold text-[#1C1C1A] mt-0.5">{selectedTask.title}</h2>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="bg-[#F7F6F2] px-2.5 py-1 rounded border border-[#E4E2DB]">
                    Difficulty: <strong className="text-[#4F46E5]">L{selectedTask.difficulty}</strong>
                  </span>
                  <span className="bg-[#F7F6F2] px-2.5 py-1 rounded border border-[#E4E2DB]">
                    Resp Req: <strong className="text-[#1C1C1A]">{selectedTask.requiredResponsibility}%</strong>
                  </span>
                </div>
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-[#92928C] uppercase tracking-wider">Candidate Match Evaluation</div>

                <div className="space-y-3">
                  {candidates.map((candidate) => {
                    const diffGap = candidate.maxDifficulty - selectedTask.difficulty;
                    const respGap = candidate.responsibility - selectedTask.requiredResponsibility;
                    const isOptimal = diffGap >= 0 && respGap >= -10;
                    const isUnderqualified = diffGap < 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`p-4 rounded-lg border text-xs transition-all ${
                          isOptimal
                            ? 'bg-[#FCFCFA] border-[#2F7D5A]/40'
                            : 'bg-[#FCFCFA] border-[#E4E2DB]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-[#1C1C1A]">{candidate.name}</span>
                              <span className="text-[#92928C] text-[11px]">({candidate.role})</span>
                              {isOptimal && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF5EF] text-[#2F7D5A] border border-[#D1EADE]">
                                  Recommended Owner
                                </span>
                              )}
                              {isUnderqualified && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF6DF] text-[#B7791F] border border-[#FFE9B3]">
                                  Overreach Warning
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6B6B66]">{candidate.bio}</p>
                          </div>

                          <div className="text-right font-mono text-xs">
                            <div className="text-[#4F46E5] font-bold">{candidate.responsibility}% Resp</div>
                            <div className="text-[#92928C]">Max L{candidate.maxDifficulty}</div>
                          </div>
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
