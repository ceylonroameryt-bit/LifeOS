'use client';

import React from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import { Lightbulb, ChevronRight } from 'lucide-react';

export function IdeaCard() {
  const ideas = [
    { title: 'Build phishing training tool', time: 'Today' },
    { title: 'Scotland travel video', time: 'Yesterday' },
    { title: 'AI cybersecurity podcast', time: '3d ago' },
  ];

  return (
    <LifeCard className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            IDEAS
          </span>
          <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400">
            recent
          </span>
        </div>

        <div className="space-y-2">
          {ideas.map((idea, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                💡 {idea.title}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {idea.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>Idea Vault</span>
        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
          Ideas <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>
    </LifeCard>
  );
}
