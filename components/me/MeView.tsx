'use client';

import React, { useState } from 'react';
import { LifeCard } from '@/components/ui/LifeCard';
import {
  CreditCard,
  Flame,
  Lightbulb,
  Target,
  ChevronRight,
  Bell,
  Moon,
  Shield,
  LogOut,
  User,
} from 'lucide-react';

interface MeViewProps {
  userName: string;
  onUpdateName: (name: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function MeView({ userName, onUpdateName, isDark, onToggleTheme }: MeViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(userName);

  const handleSaveName = () => {
    if (nameVal.trim()) {
      onUpdateName(nameVal.trim());
      setEditingName(false);
    }
  };

  const overviewCards = [
    { title: 'Money', detail: '£42 left this week', icon: CreditCard, color: 'text-emerald-500' },
    { title: 'Habits', detail: '3 active habits', icon: Flame, color: 'text-rose-500' },
    { title: 'Ideas', detail: '3 ideas saved', icon: Lightbulb, color: 'text-amber-500' },
    { title: 'Goals', detail: '1 active goal', icon: Target, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 md:pb-12">
      {/* Profile Header */}
      <LifeCard className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-2xl">
            {userName.charAt(0)}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="text-xs font-semibold px-2 py-1 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {userName}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personal Control Centre
            </p>
          </div>
        </div>
      </LifeCard>

      {/* Summary Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          OVERVIEW
        </span>
        <LifeCard className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden">
          {overviewCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${item.color}`}>
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.detail}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
            );
          })}
        </LifeCard>
      </div>

      {/* Preferences & Settings */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          SETTINGS
        </span>
        <LifeCard className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden">
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Moon className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Appearance
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Bell className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Notifications
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">Enabled</span>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Shield className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Privacy & Data
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">Local first</span>
          </div>
        </LifeCard>
      </div>
    </div>
  );
}
