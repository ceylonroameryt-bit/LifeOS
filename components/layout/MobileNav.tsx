'use client';

import React from 'react';
import { Sun, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  currentTab: 'today' | 'me';
  onTabChange: (tab: 'today' | 'me') => void;
  onOpenQuickAdd: () => void;
}

export function MobileNav({ currentTab, onTabChange, onOpenQuickAdd }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-around px-6 z-40">
      {/* Today Tab */}
      <button
        type="button"
        onClick={() => onTabChange('today')}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 py-1 select-none transition-colors',
          currentTab === 'today'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        )}
      >
        <Sun className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px]">Today</span>
      </button>

      {/* Center + Quick Add Button */}
      <button
        type="button"
        onClick={onOpenQuickAdd}
        aria-label="Quick Add"
        className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 active:scale-95 transition-transform -mt-5"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Me Tab */}
      <button
        type="button"
        onClick={() => onTabChange('me')}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 py-1 select-none transition-colors',
          currentTab === 'me'
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        )}
      >
        <User className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[11px]">Me</span>
      </button>
    </nav>
  );
}
