import React from 'react';
import { Bot, Users, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, candidatesCount }) {
  const navItems = [
    { id: 'candidates', label: 'Candidates', icon: Users, badge: null },
    { id: 'interviewer', label: 'AI Interviewer', icon: Bot, badge: 'Adaptive Agent' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none" 
            onClick={() => setActiveTab('candidates')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-[#1D4ED8] transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-[#0F172A] font-mono">
                INTERVUE <span className="text-[#2563EB]">AI</span>
              </span>
              <span className="text-[11px] text-[#64748B] tracking-normal font-sans">
                Adaptive Technical Interview Agent
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 select-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] shadow-xs border border-[#BFDBFE]'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2563EB] text-white font-mono font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicator */}
          <div className="flex items-center space-x-3 select-none">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{candidatesCount} Candidate Profiles</span>
              <span>•</span>
              <span className="text-[#2563EB] font-bold">RAG Grounded</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto space-x-2 py-2 border-t border-[#E2E8F0] select-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                    : 'text-[#64748B]'
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
