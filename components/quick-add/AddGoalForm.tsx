'use client';

import React, { useState } from 'react';
import { Goal } from '@/types';
import { goalService } from '@/lib/services/goalService';

interface AddGoalFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialTitle?: string;
}

export function AddGoalForm({ onClose, onSuccess, initialTitle = '' }: AddGoalFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<Goal['category']>('Career');
  const [targetValue, setTargetValue] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await goalService.createGoal({
        title: title.trim(),
        category,
        target_value: targetValue.trim() || undefined,
        next_action: nextAction.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col bg-card w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
        <button
          type="button"
          onClick={onClose}
          className="text-primary font-medium text-base hover:opacity-80 transition-opacity"
        >
          Cancel
        </button>

        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          New Goal
        </h2>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="text-primary font-bold text-base hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isSubmitting ? 'Saving...' : 'Save Goal'}
        </button>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 bg-background dark:bg-background/80 flex-1 overflow-y-auto">
        <div className="bg-surface rounded-2xl border border-border/80 p-4 shadow-2xs divide-y divide-border/60">
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal Title (e.g. Get SOC Analyst Role)"
            className="w-full text-base pb-3 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          <input
            type="text"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Target Metric (e.g. £3,000 or Offer accepted)"
            className="w-full text-sm pt-3 bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="bg-surface rounded-2xl border border-border/80 px-4 py-3 shadow-2xs divide-y divide-border/60">
          <div className="flex items-center justify-between text-sm py-2">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Goal['category'])}
              className="text-xs font-semibold text-primary bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Career">Career</option>
              <option value="Money">Money</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="py-2">
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Next immediate action..."
              className="w-full text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
