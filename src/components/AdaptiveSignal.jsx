import React from 'react';
import { TrendingUp, HelpCircle, ArrowRight, Layers } from 'lucide-react';

export default function AdaptiveSignal({ signal }) {
  if (!signal) return null;

  const { action, quality, score, topic, reason } = signal;

  const getConfig = () => {
    switch (action) {
      case 'HARDER':
        return {
          title: 'Escalated Difficulty',
          icon: TrendingUp,
          accentColor: '#7F77DD',
          borderColor: 'border-[#7F77DD]/40',
          bgColor: 'bg-[#F5F3FF]',
          textColor: 'text-[#6D28D9]',
          badgeBg: 'bg-[#7F77DD]',
          badgeText: 'text-white',
          deltaText: '↑ HARDER',
        };
      case 'CLARIFY':
        return {
          title: 'Targeted Clarification',
          icon: HelpCircle,
          accentColor: '#F0994D',
          borderColor: 'border-[#F0994D]/40',
          bgColor: 'bg-[#FFFBEB]',
          textColor: 'text-[#B45309]',
          badgeBg: 'bg-[#F0994D]',
          badgeText: 'text-white',
          deltaText: '↓ CLARIFY',
        };
      case 'NEW_TOPIC':
        return {
          title: 'Curriculum Transition',
          icon: Layers,
          accentColor: '#22D3A6',
          borderColor: 'border-[#22D3A6]/40',
          bgColor: 'bg-[#F0FDF4]',
          textColor: 'text-[#047857]',
          badgeBg: 'bg-[#22D3A6]',
          badgeText: 'text-[#064E3B]',
          deltaText: '→ NEW TOPIC',
        };
      case 'MODERATE':
      default:
        return {
          title: 'Sustained Depth',
          icon: ArrowRight,
          accentColor: '#94A3B8',
          borderColor: 'border-[#CBD5E1]',
          bgColor: 'bg-[#F8FAFC]',
          textColor: 'text-[#475569]',
          badgeBg: 'bg-[#64748B]',
          badgeText: 'text-white',
          deltaText: '● MODERATE',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all duration-200 shadow-xs space-y-2 select-none`}
      style={{ borderLeftWidth: '4px', borderLeftColor: config.accentColor }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shadow-xs"
            style={{ backgroundColor: config.accentColor, color: action === 'NEW_TOPIC' ? '#064E3B' : '#FFFFFF' }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${config.textColor}`}>
              AI Adaptive Signal
            </span>
            <div className="text-xs font-bold text-[#0F172A] font-sans">
              {config.title}
            </div>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-tight ${config.badgeBg} ${config.badgeText}`}>
          {config.deltaText}
        </span>
      </div>

      <p className="text-xs leading-relaxed font-sans text-[#475569]">
        {reason || 'Adaptive policy engine adjusted question depth based on previous response.'}
      </p>

      {score !== undefined && (
        <div className="flex items-center space-x-3 text-[11px] font-mono pt-1 text-[#64748B]">
          <span>Score: <strong className="text-[#0F172A]">{score}/10</strong></span>
          <span>•</span>
          <span>Quality: <strong className="capitalize text-[#0F172A]">{quality}</strong></span>
          {topic && (
            <>
              <span>•</span>
              <span className="truncate">Topic: <strong className="text-[#0F172A]">{topic}</strong></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
