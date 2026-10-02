"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Task } from "@/types";
import { format } from "date-fns";
import { taskService } from "@/lib/services/taskService";
import { getGreeting, formatHeaderDate } from "@/lib/dates";
import { AppShell } from "@/components/layout/AppShell";
import { TodayHero } from "@/components/today/TodayHero";
import { TodayTasks } from "@/components/today/TodayTasks";
import { MoneyCard } from "@/components/today/MoneyCard";
import { HabitCard } from "@/components/today/HabitCard";
import { CareerCard } from "@/components/today/CareerCard";
import { UpcomingCard } from "@/components/today/UpcomingCard";
import { IdeaCard } from "@/components/today/IdeaCard";
import { WeeklySummaryCard } from "@/components/today/WeeklySummaryCard";
import { TasksView } from "@/components/tasks/TasksView";
import { MoneyView } from "@/components/money/MoneyView";
import { HabitsView } from "@/components/habits/HabitsView";
import { CareerView } from "@/components/career/CareerView";
import { IdeasView } from "@/components/ideas/IdeasView";
import { GoalsView } from "@/components/goals/GoalsView";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { AdminView } from "@/components/admin/AdminView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { InboxView } from "@/components/inbox/InboxView";
import { FocusView } from "@/components/focus/FocusView";
import { InsightsView } from "@/components/insights/InsightsView";
import { WeeklyReviewView } from "@/components/review/WeeklyReviewView";
import { MeView } from "@/components/me/MeView";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    const handleUpdate = () => loadTasks();
    window.addEventListener("lifeos-tasks-updated", handleUpdate);
    return () =>
      window.removeEventListener("lifeos-tasks-updated", handleUpdate);
  }, [loadTasks]);

  const handleToggleTask = async (id: string) => {
    await taskService.toggleTask(id);
    await loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    await loadTasks();
  };

  const greeting = getGreeting();
  const headerDate = formatHeaderDate(); // e.g. "Wednesday, 30 September"

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
        if (currentTab === "tasks") {
          return <TasksView onOpenQuickAdd={onOpenQuickAdd} />;
        }

        if (currentTab === "money") {
          return <MoneyView />;
        }

        if (currentTab === "habits") {
          return <HabitsView />;
        }

        if (currentTab === "career") {
          return <CareerView />;
        }

        if (currentTab === "ideas") {
          return <IdeasView />;
        }

        if (currentTab === "goals") {
          return <GoalsView />;
        }

        if (currentTab === "wishlist") {
          return <WishlistView />;
        }

        if (currentTab === "admin") {
          return <AdminView />;
        }

        if (currentTab === "calendar") {
          return <CalendarView />;
        }

        if (currentTab === "inbox") {
          return <InboxView />;
        }

        if (currentTab === "focus") {
          return <FocusView />;
        }

        if (currentTab === "insights") {
          return <InsightsView />;
        }

        if (currentTab === "weekly-review") {
          return <WeeklyReviewView />;
        }

        if (currentTab === "me" || currentTab === "settings") {
          return (
            <MeView
              userName={userName}
              onUpdateName={onUpdateName}
              isDark={isDark}
              onToggleTheme={onToggleTheme}
              onNavigateTab={setCurrentTab}
            />
          );
        }

        // Default: Today Command Center Dashboard
        return (
          <div className="space-y-6 md:space-y-7 pb-24 md:pb-12 animate-in fade-in duration-300">
            {/* Hero Greeting Section with subtle sunrise elements */}
            <TodayHero
              userName={userName}
              greeting={greeting}
              formattedDate={`${headerDate} ${new Date().getFullYear()}`}
            />

            {/* Dashboard Layout: Mobile single-column / Tablet & Desktop 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-start">
              {/* Left Column (Desktop 7 cols / Mobile full width) */}
              <div className="md:col-span-7 space-y-5 md:space-y-6">
                {/* 1. Today Tasks Card */}
                <TodayTasks
                  tasks={tasks.filter(
                    (task) =>
                      task.due_date === format(new Date(), "yyyy-MM-dd"),
                  )}
                  loading={loading}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenQuickAdd={onOpenQuickAdd}
                />

                {/* 2. Career Card */}
                <CareerCard onClick={() => setCurrentTab("career")} />

                {/* 3. This Week Summary */}
                <WeeklySummaryCard
                  onClick={() => setCurrentTab("weekly-review")}
                />
              </div>

              {/* Right Column (Desktop 5 cols / Mobile sequential flow) */}
              <div className="md:col-span-5 space-y-4 md:space-y-5">
                {/* Side-by-side Money & Habits on mobile, stacked on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-5">
                  <MoneyCard onClick={() => setCurrentTab("money")} />
                  <HabitCard onClick={() => setCurrentTab("habits")} />
                </div>

                {/* Upcoming Card (Life Admin & Renewals) */}
                <UpcomingCard onClick={() => setCurrentTab("admin")} />

                {/* Ideas Card */}
                <IdeaCard onClick={() => setCurrentTab("ideas")} />
              </div>
            </div>
          </div>
        );
      }}
    </AppShell>
  );
}
