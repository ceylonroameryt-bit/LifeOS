'use client';

import React, { useState } from 'react';
import { Priority } from '@/types';
import { taskService } from '@/lib/services/taskService';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddTaskForm({ onClose, onSuccess, initialTitle = '' }: AddTaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [notes, setNotes] = useState('');
  const [dueTime, setDueTime] = useState('06:00 PM');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>('Normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await taskService.createTask({
        title: trimmed,
        notes: notes.trim(),
        due_time: dueTime,
        priority,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-card w-full">
      {/* Top Header matching approved LifeOS UI */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
        <button
          type="button"
          onClick={onClose}
          className="text-primary font-medium text-base hover:opacity-80 transition-opacity"
        >
          Cancel
        </button>

        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          New Task
        </h2>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Task'}
        </button>
      </div>

      {/* Body with soft white rounded cards on cool grey canvas */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto">
        {/* Card 1: Title & Notes */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full text-sm pt-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Card 2: Date & Time */}
        <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs divide-y divide-border/60">
          {/* Date Row */}
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Date
            </span>
            <span className="font-semibold text-primary">
              Today
            </span>
          </div>

          {/* Time Row */}
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Time
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="flex items-center gap-1.5 font-semibold text-primary hover:opacity-80"
              >
                <span>{dueTime}</span>
                <Clock className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          {showTimePicker && (
            <div className="pt-2 pb-1 flex justify-end">
              <input
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 06:00 PM"
                className="text-xs px-2.5 py-1 rounded-lg border border-border bg-background text-slate-800 dark:text-slate-100"
              />
            </div>
          )}
        </div>

        {/* Card 3: Priority */}
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
            PRIORITY
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
            {(['Low', 'Normal', 'Important'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'py-2 text-xs font-semibold rounded-lg transition-all',
                  priority === p
                    ? 'bg-surface text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
