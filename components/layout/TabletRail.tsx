"use client";

import React from "react";
import { ModuleLink } from "./ModuleLink";
import {
  Sun,
  CheckCircle2,
  CreditCard,
  Flame,
  Lightbulb,
  Briefcase,
  Target,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabletRailProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: () => void;
  userName?: string;
}

export function TabletRail({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
  userName = "",
}: TabletRailProps) {
  const navItems = [
    { id: "today", label: "Today", icon: Sun },
    { id: "tasks", label: "Tasks", icon: CheckCircle2 },
    { id: "money", label: "Money", icon: CreditCard },
    { id: "habits", label: "Habits", icon: Flame },
    { id: "career", label: "Career", icon: Briefcase },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "goals", label: "Goals", icon: Target },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-16 h-screen sticky top-0 flex flex-col items-center justify-between py-5 border-r border-border/80 bg-surface/80 dark:bg-surface/50 backdrop-blur-md select-none">
      <div className="flex flex-col items-center gap-5">
        {/* Brand Icon */}
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xs">
          L
        </div>

        {/* Quick Add (+) */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          title="Quick Add (Cmd+K)"
          className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Icons */}
        <nav className="flex flex-col items-center gap-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <ModuleLink
                key={item.id}
                href={"/" + item.id}
                title={item.label}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-primary"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40",
                )}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </ModuleLink>
            );
          })}
        </nav>
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-primary flex items-center justify-center font-bold text-xs">
        {userName.charAt(0)}
      </div>
    </aside>
  );
}
