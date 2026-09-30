'use client';

import React from 'react';
import { Task } from '@/types';
import { TaskRow } from './TaskRow';
import { LifeCard } from '@/components/ui/LifeCard';
import { Plus, SunMedium, Sparkles } from 'lucide-react';

interface TodayTasksProps {
  tasks: Task[];
  loading: boolean;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenQuickAdd: () => void;
}

export function TodayTasks({
  tasks,
  loading,
  onToggleTask,
  onDeleteTask,
  onOpenQuickAdd,
}: TodayTasksProps) {
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <LifeCard className="p-5 sm:p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            TODAY
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {pendingCount === 1 ? '1 task' : `${pendingCount} tasks`}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-3 py-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mb-3">
            <SunMedium className="w-6 h-6 stroke-[1.8]" />
          </div>
          <p className="text-[16px] font-semibold text-slate-800 dark:text-slate-200">
            No tasks today.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
            Enjoy the breathing room.
          </p>
          <button
            type="button"
            onClick={onOpenQuickAdd}
            className="mt-4 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Capture something new</span>
          </button>
        </div>
      ) : (
        /* Task List */
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 -mx-1">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}
    </LifeCard>
  );
}
