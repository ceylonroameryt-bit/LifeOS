'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { taskService, DEFAULT_TASKS } from '@/lib/services/taskService';
import { getGreeting, formatHeaderDate, formatMobileDate } from '@/lib/dates';
import { AppShell } from '@/components/layout/AppShell';
import { TodayTasks } from '@/components/today/TodayTasks';
import { MoneyCard } from '@/components/today/MoneyCard';
import { HabitCard } from '@/components/today/HabitCard';
import { IdeaCard } from '@/components/today/IdeaCard';
import { WeeklySummaryCard } from '@/components/today/WeeklySummaryCard';
import { MeView } from '@/components/me/MeView';

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const handleUpdate = () => loadTasks();
    window.addEventListener('lifeos-tasks-updated', handleUpdate);
    return () => window.removeEventListener('lifeos-tasks-updated', handleUpdate);
  }, [loadTasks]);

  const handleToggleTask = async (id: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    await taskService.toggleTask(id);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await taskService.deleteTask(id);
  };

  const greeting = getGreeting();
  const headerDateDesktop = formatHeaderDate();
  const headerDateMobile = formatMobileDate();

  return (
    <AppShell>
      {({ currentTab, userName, onOpenQuickAdd, isDark, onToggleTheme, onUpdateName }) => {
        if (currentTab === 'me' || currentTab === 'settings') {
          return (
            <MeView
              userName={userName}
              onUpdateName={onUpdateName}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
            />
          );
        }

        return (
          <div className="space-y-6 md:space-y-8 pb-24 md:pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div>
              <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
                {greeting}
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                {userName}
              </h1>
              <p className="text-xs md:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
                <span className="hidden md:inline">{headerDateDesktop}</span>
                <span className="md:hidden">{headerDateMobile}</span>
              </p>
            </div>

            {/* Unified Responsive Grid (Mobile single-column with side-by-side cards / Desktop 2-column) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
              {/* Left Column (Desktop 7 cols, Mobile full width) */}
              <div className="md:col-span-7 space-y-5 md:space-y-6">
                <TodayTasks
                  tasks={tasks}
                  loading={loading}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenQuickAdd={onOpenQuickAdd}
                />

                <WeeklySummaryCard />
              </div>

              {/* Right Column (Desktop 5 cols, Mobile cards underneath) */}
              <div className="md:col-span-5 space-y-4 md:space-y-5">
                {/* On mobile (<768px), Money and Habits sit side-by-side in 2 cols */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-5">
                  <MoneyCard />
                  <HabitCard />
                </div>

                {/* Ideas Card */}
                <IdeaCard />
              </div>
            </div>
          </div>
        );
      }}
    </AppShell>
  );
}
