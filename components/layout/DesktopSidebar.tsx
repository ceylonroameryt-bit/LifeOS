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
  Heart,
  Shield,
  Inbox,
  Calendar,
  Zap,
  Settings,
  Plus,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickAdd: () => void;
  userName?: string;
}

export function DesktopSidebar({
  currentTab,
  onTabChange,
  onOpenQuickAdd,
  userName = "",
}: DesktopSidebarProps) {
  const primaryNav = [
    { id: "today", label: "Today", icon: Sun },
    { id: "tasks", label: "Tasks", icon: CheckCircle2 },
    { id: "money", label: "Money", icon: CreditCard },
    { id: "habits", label: "Habits", icon: Flame },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "career", label: "Career", icon: Briefcase },
    { id: "goals", label: "Goals", icon: Target },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "admin", label: "Life Admin", icon: Shield },
  ];

  const toolsNav = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "focus", label: "Focus Mode", icon: Zap },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between p-4 border-r border-border/80 bg-surface/80 dark:bg-surface/50 backdrop-blur-md select-none overflow-y-auto no-scrollbar">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center justify-between px-3 py-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-xs">
              L
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">
                LifeOS
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Clear and simple
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="w-full flex items-center justify-between px-3.5 py-2.5 mb-5 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white transition-all shadow-sm active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add New
          </span>
          <span className="flex items-center gap-0.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
            <Command className="w-3 h-3" /> K
          </span>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <ModuleLink
                key={item.id}
                href={"/" + item.id}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-primary font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 stroke-[2]",
                    isActive ? "text-primary" : "text-slate-400",
                  )}
                />
                <span>{item.label}</span>
              </ModuleLink>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border/80 mx-2" />

        {/* Tools Section */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 block mb-1">
            Focus & Agendas
          </span>
          {toolsNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <ModuleLink
                key={item.id}
                href={"/" + item.id}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/60 text-primary font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 stroke-[2]",
                    isActive ? "text-primary" : "text-slate-400",
                  )}
                />
                <span>{item.label}</span>
              </ModuleLink>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border/80 mx-2" />

        {/* Settings */}
        <ModuleLink
          href={"/" + "settings"}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left",
            currentTab === "settings"
              ? "bg-blue-50 dark:bg-blue-950/60 text-primary font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100",
          )}
        >
          <Settings className="w-4 h-4 stroke-[2] text-slate-400" />
          <span>Profile & Settings</span>
        </ModuleLink>
      </div>

      {/* User Profile Badge */}
      <div className="pt-3 border-t border-border/70 mt-3">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {userName}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Personal Workspace
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
