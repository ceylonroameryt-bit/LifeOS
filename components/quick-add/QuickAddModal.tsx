'use client';

import React, { useState, useEffect } from 'react';
import { QuickAddType } from '@/types';
import { AddTaskForm } from './AddTaskForm';
import {
  CheckCircle2,
  Lightbulb,
  CreditCard,
  Flame,
  FileText,
  Target,
  Sparkles,
  Mic,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [selectedType, setSelectedType] = useState<QuickAddType | null>(null);
  const [naturalText, setNaturalText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or prop
          window.dispatchEvent(new Event('lifeos-open-quick-add'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
      setNaturalText('');
      setNotice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      type: 'task' as QuickAddType,
      label: 'Task',
      icon: CheckCircle2,
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60',
    },
    {
      type: 'idea' as QuickAddType,
      label: 'Idea',
      icon: Lightbulb,
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/60',
    },
    {
      type: 'expense' as QuickAddType,
      label: 'Expense',
      icon: CreditCard,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/60',
    },
    {
      type: 'habit' as QuickAddType,
      label: 'Habit',
      icon: Flame,
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/60',
    },
    {
      type: 'note' as QuickAddType,
      label: 'Note',
      icon: FileText,
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/60',
    },
    {
      type: 'goal' as QuickAddType,
      label: 'Goal',
      icon: Target,
      bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/60',
    },
  ];

  const handleSelect = (type: QuickAddType) => {
    if (type === 'task') {
      setSelectedType('task');
    } else {
      setNotice(`${type.charAt(0).toUpperCase() + type.slice(1)} capture unlocks in next phase`);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  const handleNaturalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;
    // For Phase 1, pass natural input as task title
    setSelectedType('task');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-float border border-border/80 overflow-hidden z-10 transition-all max-h-[92vh] flex flex-col">
        {selectedType === 'task' ? (
          <AddTaskForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : (
          <div className="p-6">
            {/* Grabber on mobile */}
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  What do you want to add?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Capture something in 3 seconds
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice pill if clicked coming soon */}
            {notice && (
              <div className="mb-4 px-3 py-2 text-xs font-semibold text-center text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200/60 animate-in fade-in">
                {notice}
              </div>
            )}

            {/* 2-Column Action Tiles */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.type}
                    type="button"
                    onClick={() => handleSelect(act.type)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 select-none active:scale-[0.98]',
                      act.bg
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-black/20 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Icon className="w-5 h-5 stroke-[2]" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {act.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Natural Text / Speech Input */}
            <form onSubmit={handleNaturalSubmit}>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={naturalText}
                  onChange={(e) => setNaturalText(e.target.value)}
                  placeholder="Type or speak anything..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  title="Voice dictation"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
