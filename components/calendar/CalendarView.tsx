"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  Shield,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { taskService } from "@/lib/services/taskService";
import { careerService } from "@/lib/services/careerService";
import { adminService } from "@/lib/services/adminService";
import { moneyService } from "@/lib/services/moneyService";
import { startOfMonth, addMonths, getDaysInMonth, format } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarEventItem {
  id: string;
  time: string;
  title: string;
  category: "interview" | "task" | "admin" | "subscription";
  meta?: string;
}

export function CalendarView() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [events, setEvents] = useState<Record<number, CalendarEventItem[]>>({});
  useEffect(() => {
    void Promise.all([
      taskService.getTasks(),
      careerService.getInterviews(),
      adminService.getAdminItems(),
      moneyService.getSubscriptions(),
    ]).then(([tasks, interviews, admin, subscriptions]) => {
      const rows = [
        ...tasks.map((t) => ({
          id: t.id,
          date: t.due_date,
          time: t.due_time || "All day",
          title: t.title,
          category: "task" as const,
        })),
        ...interviews.map((i) => ({
          id: i.id,
          date: i.interview_date,
          time: i.interview_time || "All day",
          title: i.job_title + " — " + i.company,
          category: "interview" as const,
        })),
        ...admin.map((i) => ({
          id: i.id,
          date: i.due_date,
          time: "Deadline",
          title: i.title,
          category: "admin" as const,
        })),
        ...subscriptions.map((s) => ({
          id: s.id,
          date: s.renewal_date,
          time: "Renewal",
          title: s.name,
          category: "subscription" as const,
        })),
      ];
      const mapped: Record<number, CalendarEventItem[]> = {};
      for (const row of rows) {
        if (!row.date?.startsWith(format(month, "yyyy-MM"))) continue;
        const day = Number(row.date.slice(8, 10));
        (mapped[day] ??= []).push(row);
      }
      setEvents(mapped);
    });
  }, [month]);
  const dayEvents = events[selectedDay] || [];

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Calendar & Agenda
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Unified schedule across tasks, interviews, contracts, and renewals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Month View (7 Cols) */}
        <div className="md:col-span-7 bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {format(month, "MMMM yyyy")}
            </h3>
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  setMonth(addMonths(month, -1));
                  setSelectedDay(1);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => {
                  setMonth(addMonths(month, 1));
                  setSelectedDay(1);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="font-bold text-slate-400 py-1.5">
                {d}
              </span>
            ))}
            {/* September trailing padding */}
            {Array.from({ length: (month.getDay() + 6) % 7 }, (_, i) => i).map(
              (d) => (
                <div
                  key={d}
                  className="py-2.5 text-slate-300 dark:text-slate-600 font-medium"
                >
                  {d}
                </div>
              ),
            )}
            {/* October days 1 to 31 */}
            {Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1).map(
              (day) => {
                const hasEvents = !!events[day];
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "py-2.5 rounded-xl font-bold transition-all relative",
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
                    )}
                  >
                    <span>{day}</span>
                    {hasEvents && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1.5 left-1/2 -translate-x-1/2" />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Selected Day Agenda (5 Cols) */}
        <div className="md:col-span-5 bg-surface rounded-3xl border border-border/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {selectedDay} {format(month, "MMMM yyyy")}
              </h3>
              <p className="text-xs text-slate-400">
                {dayEvents.length} scheduled items
              </p>
            </div>
            <CalendarIcon className="w-5 h-5 text-primary stroke-[2]" />
          </div>

          {dayEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No scheduled events for this date
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border/60 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {evt.time}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {evt.category}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {evt.title}
                  </h4>
                  {evt.meta && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {evt.meta}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
