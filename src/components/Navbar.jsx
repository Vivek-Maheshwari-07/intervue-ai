import React from 'react';
import { LayoutDashboard, Bot, Users } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, candidatesCount, totalReliability }) {
  const navItems = [
    { id: 'candidates', label: 'Candidate Overview', icon: Users, badge: null },
    { id: 'interviewer', label: 'Interview Workspace', icon: Bot, badge: 'Live Agent' },
    { id: 'matrix', label: 'Responsibility Matrix', icon: LayoutDashboard, badge: null },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E4E2DB] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => setActiveTab('candidates')}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#1C1C1A] font-mono">
                INTERVUE
              </span>
              <span className="text-[11px] text-[#686862] tracking-normal font-sans">
                AI Interview Agent
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#EEF0FF] text-[#4F46E5] font-semibold'
                      : 'text-[#686862] hover:text-[#1C1C1A] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4F46E5]' : 'text-[#96968F]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1F0EB] text-[#686862] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs text-[#686862] bg-[#F7F6F2] px-2.5 py-1 rounded-md border border-[#E4E2DB]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5A]" />
              <span>{candidatesCount} Candidates</span>
              <span className="text-[#D7D5CD]">·</span>
              <span>Team Reliability: <strong className="text-[#1C1C1A]">{totalReliability}%</strong></span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto space-x-1 py-1.5 border-t border-[#E4E2DB]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-[#EEF0FF] text-[#4F46E5] font-semibold'
                    : 'text-[#686862]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
