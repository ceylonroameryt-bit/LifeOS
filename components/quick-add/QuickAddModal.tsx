'use client';

import React, { useState, useEffect } from 'react';
import { QuickAddType } from '@/types';
import { AddTaskForm } from './AddTaskForm';
import { AddExpenseForm } from './AddExpenseForm';
import { AddHabitForm } from './AddHabitForm';
import { AddIdeaForm } from './AddIdeaForm';
import { AddJobForm } from './AddJobForm';
import { AddGoalForm } from './AddGoalForm';
import { AddWishlistForm } from './AddWishlistForm';
import { AddNoteForm } from './AddNoteForm';
import {
  CheckCircle2,
  Lightbulb,
  CreditCard,
  Flame,
  FileText,
  Target,
  Briefcase,
  Heart,
  Sparkles,
  Mic,
  X,
  ArrowRight,
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
  const [detectedType, setDetectedType] = useState<QuickAddType | null>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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

  // Deterministic Smart Capture intent detection (Section 16 of specifications)
  useEffect(() => {
    const lower = naturalText.toLowerCase().trim();
    if (!lower) {
      setDetectedType(null);
      return;
    }
    if (
      lower.includes('£') ||
      lower.includes('$') ||
      lower.includes('tesco') ||
      (/\b\d+(\.\d{1,2})?\b/.test(lower) &&
        (lower.includes('paid') ||
          lower.includes('spent') ||
          lower.includes('cost') ||
          lower.includes('monthly')))
    ) {
      setDetectedType('expense');
    } else if (
      lower.startsWith('idea') ||
      lower.includes('podcast') ||
      lower.includes('video') ||
      lower.includes('build tool')
    ) {
      setDetectedType('idea');
    } else if (
      lower.includes('job') ||
      lower.includes('security') ||
      lower.includes('interview') ||
      lower.includes('recruiter') ||
      lower.includes('analyst') ||
      lower.includes('engineer')
    ) {
      setDetectedType('job');
    } else if (
      lower.includes('habit') ||
      lower.includes('slipped') ||
      lower.includes('resisted') ||
      lower.includes('streak')
    ) {
      setDetectedType('habit');
    } else if (
      lower.includes('wishlist') ||
      lower.includes('buy') ||
      lower.includes('lens') ||
      lower.includes('camera')
    ) {
      setDetectedType('wishlist');
    } else if (lower.startsWith('goal') || lower.includes('target') || lower.includes('save £')) {
      setDetectedType('goal');
    } else if (lower.startsWith('note') || lower.includes('remember')) {
      setDetectedType('note');
    } else {
      setDetectedType('task');
    }
  }, [naturalText]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSelectedType(null);
      setNaturalText('');
      setDetectedType(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      type: 'task' as QuickAddType,
      label: 'Task',
      icon: CheckCircle2,
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-primary border-blue-100 dark:border-blue-900/60',
    },
    {
      type: 'expense' as QuickAddType,
      label: 'Expense',
      icon: CreditCard,
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-success border-emerald-100 dark:border-emerald-900/60',
    },
    {
      type: 'idea' as QuickAddType,
      label: 'Idea',
      icon: Lightbulb,
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-idea border-amber-100 dark:border-amber-900/60',
    },
    {
      type: 'habit' as QuickAddType,
      label: 'Habit',
      icon: Flame,
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-danger border-rose-100 dark:border-rose-900/60',
    },
    {
      type: 'job' as QuickAddType,
      label: 'Job',
      icon: Briefcase,
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/60',
    },
    {
      type: 'note' as QuickAddType,
      label: 'Note',
      icon: FileText,
      bg: 'bg-purple-light dark:bg-purple/20 text-purple border-purple-100 dark:border-purple/30',
    },
    {
      type: 'goal' as QuickAddType,
      label: 'Goal',
      icon: Target,
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60',
    },
    {
      type: 'wishlist' as QuickAddType,
      label: 'Wishlist',
      icon: Heart,
      bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/60',
    },
  ];

  const handleSelect = (type: QuickAddType) => {
    setSelectedType(type);
  };

  const handleNaturalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;
    setSelectedType(detectedType || 'task');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-float border border-border/80 overflow-hidden z-10 transition-all max-h-[92vh] flex flex-col">
        {selectedType === 'task' ? (
          <AddTaskForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'expense' ? (
          <AddExpenseForm
            initialDescription={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'job' ? (
          <AddJobForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'habit' ? (
          <AddHabitForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'idea' ? (
          <AddIdeaForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'goal' ? (
          <AddGoalForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'wishlist' ? (
          <AddWishlistForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : selectedType === 'note' ? (
          <AddNoteForm
            initialTitle={naturalText}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        ) : (
          <div className="p-6">
            {/* Grabber on mobile */}
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-4 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
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

            {/* 2-Column Action Tiles (8 tiles: Task, Expense, Idea, Habit, Job, Note, Goal, Wishlist) */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.type}
                    type="button"
                    onClick={() => handleSelect(act.type)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-150 select-none active:scale-[0.98]',
                      act.bg
                    )}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-black/20 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {act.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Smart Capture Input */}
            <form onSubmit={handleNaturalSubmit}>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={naturalText}
                  onChange={(e) => setNaturalText(e.target.value)}
                  placeholder="Type or speak anything..."
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
                {detectedType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-primary animate-in fade-in flex items-center gap-1 uppercase">
                    {detectedType}
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
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
