import React from 'react';
import { TrendingUp, HelpCircle, ArrowRight, Layers } from 'lucide-react';

export default function AdaptiveSignal({ signal }) {
  if (!signal) return null;

  const { action, quality, score, topic, difficultyDelta, reason } = signal;

  const getConfig = () => {
    switch (action) {
      case 'HARDER':
        return {
          title: 'Difficulty Increased',
          icon: TrendingUp,
          bgColor: 'bg-[#EFF6FF]',
          borderColor: 'border-[#BFDBFE]',
          textColor: 'text-[#1E40AF]',
          badgeBg: 'bg-[#2563EB]',
          badgeText: 'text-white',
          deltaText: '↑ Architecture Depth',
        };
      case 'CLARIFY':
        return {
          title: 'Clarification Recommended',
          icon: HelpCircle,
          bgColor: 'bg-[#FEF3C7]',
          borderColor: 'border-[#FDE68A]',
          textColor: 'text-[#92400E]',
          badgeBg: 'bg-[#D97706]',
          badgeText: 'text-white',
          deltaText: '↓ Core Fundamentals',
        };
      case 'NEW_TOPIC':
        return {
          title: 'Topic Transition',
          icon: Layers,
          bgColor: 'bg-[#F3E8FF]',
          borderColor: 'border-[#E9D5FF]',
          textColor: 'text-[#6B21A8]',
          badgeBg: 'bg-[#7C3AED]',
          badgeText: 'text-white',
          deltaText: '→ Curriculum Shift',
        };
      case 'MODERATE':
      default:
        return {
          title: 'Maintaining Difficulty',
          icon: ArrowRight,
          bgColor: 'bg-[#F8FAFC]',
          borderColor: 'border-[#E2E8F0]',
          textColor: 'text-[#334155]',
          badgeBg: 'bg-[#475569]',
          badgeText: 'text-white',
          deltaText: '● Level Preserved',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all duration-300 shadow-xs space-y-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-lg ${config.badgeBg} flex items-center justify-center text-white shadow-xs`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${config.textColor}`}>
              Adaptive Interview Signal
            </span>
            <div className="text-sm font-bold text-[#0F172A]">
              {config.title}
            </div>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${config.badgeBg} ${config.badgeText}`}>
          {config.deltaText}
        </span>
      </div>

      <p className="text-xs text-[#475569] leading-relaxed pl-8">
        {reason || 'Adaptive algorithm updated next question level based on answer evaluation.'}
      </p>

      {score !== undefined && (
        <div className="flex items-center space-x-3 text-[11px] font-mono text-[#64748B] pt-1 pl-8">
          <span>Score: <strong className="text-[#0F172A]">{score}/10</strong></span>
          <span>•</span>
          <span>Quality: <strong className="capitalize text-[#0F172A]">{quality}</strong></span>
          <span>•</span>
          <span>Topic: <strong className="text-[#0F172A]">{topic}</strong></span>
        </div>
      )}
    </div>
  );
}
