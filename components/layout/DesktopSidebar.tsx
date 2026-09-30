'use client';

import React from 'react';
import {
  Sun,
  CreditCard,
  Flame,
  Lightbulb,
  Target,
  Settings,
  Plus,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: () => void;
  userName?: string;
}

export function DesktopSidebar({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
  userName = 'Poorna',
}: DesktopSidebarProps) {
  const navItems = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'money', label: 'Money', icon: CreditCard },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between p-5 border-r border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md select-none">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-3 py-2 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              L
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              LifeOS
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            v1.0
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-between px-3.5 py-2.5 mb-6 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add New
          </span>
          <span className="flex items-center gap-0.5 text-[10px] bg-blue-700/60 px-1.5 py-0.5 rounded text-blue-100">
            <Command className="w-3 h-3" /> K
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="my-5 border-t border-slate-200/60 dark:border-slate-800/80 mx-2" />

        {/* Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
            currentTab === 'settings'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          )}
        >
          <Settings className="w-4 h-4 stroke-[2]" />
          <span>Settings</span>
        </button>
      </div>

      {/* User Profile Footer */}
      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Personal Space
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
