'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types';
import { taskService, DEFAULT_TASKS } from '@/lib/services/taskService';
import { getGreeting, formatHeaderDate } from '@/lib/dates';
import { AppShell } from '@/components/layout/AppShell';
import { TodayHero } from '@/components/today/TodayHero';
import { TodayTasks } from '@/components/today/TodayTasks';
import { MoneyCard } from '@/components/today/MoneyCard';
import { HabitCard } from '@/components/today/HabitCard';
import { CareerCard } from '@/components/today/CareerCard';
import { UpcomingCard } from '@/components/today/UpcomingCard';
import { IdeaCard } from '@/components/today/IdeaCard';
import { WeeklySummaryCard } from '@/components/today/WeeklySummaryCard';
import { MeView } from '@/components/me/MeView';
import { MoneyView } from '@/components/money/MoneyView';

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
  const headerDate = formatHeaderDate(); // e.g. "Wednesday, 30 September 2026"

  return (
    <AppShell>
      {({
        currentTab,
        setCurrentTab,
        userName,
        onOpenQuickAdd,
        isDark,
        onToggleTheme,
        onUpdateName,
      }) => {
        if (currentTab === 'money') {
          return <MoneyView />;
        }

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
          <div className="space-y-6 md:space-y-7 pb-24 md:pb-12 animate-in fade-in duration-300">
            {/* Hero Greeting Section with subtle sunrise elements */}
            <TodayHero
              userName={userName}
              greeting={greeting}
              formattedDate={`${headerDate} 2026`}
            />

            {/* Dashboard Layout: Mobile single-column / Tablet & Desktop 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
              {/* Left Column (Desktop 7 cols / Mobile full width) */}
              <div className="md:col-span-7 space-y-5 md:space-y-6">
                {/* 1. Today Tasks Card */}
                <TodayTasks
                  tasks={tasks}
                  loading={loading}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenQuickAdd={onOpenQuickAdd}
                />

                {/* 2. Career Card */}
                <CareerCard />

                {/* 3. This Week Summary */}
                <WeeklySummaryCard />
              </div>

              {/* Right Column (Desktop 5 cols / Mobile sequential flow) */}
              <div className="md:col-span-5 space-y-4 md:space-y-5">
                {/* Side-by-side Money & Habits on mobile, stacked on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-5">
                  <MoneyCard onClick={() => setCurrentTab('money')} />
                  <HabitCard />
                </div>

                {/* Upcoming Card (Life Admin & Renewals) */}
                <UpcomingCard />

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
