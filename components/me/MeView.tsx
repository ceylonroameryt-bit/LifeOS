"use client";

import React, { useState, useEffect } from "react";
import { NotificationHistory } from "./NotificationHistory";
import { profileService } from "@/lib/services/profileService";
import { activityService } from "@/lib/services/activityService";
import { createClient } from "@/lib/supabase/client";
import { backupService } from "@/lib/services/backupService";
import { LifeCard } from "@/components/ui/LifeCard";
import {
  CreditCard,
  Flame,
  Lightbulb,
  Target,
  Briefcase,
  Heart,
  Shield,
  ChevronRight,
  Bell,
  Moon,
  Download,
  LogOut,
  Globe,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

interface MeViewProps {
  userName: string;
  onUpdateName: (name: string) => void | Promise<void>;
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateTab?: (tab: string) => void;
}

export function MeView({
  userName,
  onUpdateName,
  isDark,
  onToggleTheme,
  onNavigateTab,
}: MeViewProps) {
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(false);
  useEffect(() => {
    void profileService.getProfile().then((p) => setEmail(p.email || ""));
    void activityService
      .getNotifications()
      .then((p) => setNotifications(p?.task_reminders || false));
  }, []);
  useEffect(() => setNameVal(userName), [userName]);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(userName);
  const [exportNotice, setExportNotice] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleSaveName = async () => {
    if (nameVal.trim()) {
      await onUpdateName(nameVal.trim());
      setEditingName(false);
    }
  };

  const handleExportData = async () => {
    if (exporting) return;
    setExporting(true);
    setExportError("");
    setExportNotice(false);
    try {
      const data = await backupService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = `lifeos-data-${data.exported_at.split("T")[0]}.json`;
        document.body.appendChild(a);
        try {
          a.click();
        } finally {
          a.remove();
        }
      } finally {
        URL.revokeObjectURL(url);
      }
      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 3000);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Data export failed.",
      );
    } finally {
      setExporting(false);
    }
  };

  const overviewRows = [
    {
      id: "money",
      title: "Money",
      detail: "Open module",
      icon: CreditCard,
      color: "text-emerald-500",
    },
    {
      id: "habits",
      title: "Habits",
      detail: "Open module",
      icon: Flame,
      color: "text-rose-500",
    },
    {
      id: "ideas",
      title: "Ideas",
      detail: "Open module",
      icon: Lightbulb,
      color: "text-amber-500",
    },
    {
      id: "career",
      title: "Career",
      detail: "Open module",
      icon: Briefcase,
      color: "text-primary",
    },
    {
      id: "goals",
      title: "Goals",
      detail: "Open module",
      icon: Target,
      color: "text-purple",
    },
    {
      id: "wishlist",
      title: "Wishlist",
      detail: "Open module",
      icon: Heart,
      color: "text-pink-500",
    },
    {
      id: "admin",
      title: "Life Admin",
      detail: "Open module",
      icon: Shield,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-24 md:pb-12 animate-in fade-in duration-300">
      {/* Profile Header */}
      <LifeCard className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-primary flex items-center justify-center font-bold text-2xl shadow-xs">
            {userName.charAt(0)}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  className="px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="text-xs font-semibold px-2.5 py-1 bg-primary text-white rounded-lg shadow-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {userName}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Edit profile
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {email}
            </p>
          </div>
        </div>
      </LifeCard>

      {/* Overview Rows (Section 45 of specifications) */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          LIFE MODULES
        </span>
        <LifeCard className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden">
          {overviewRows.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateTab && onNavigateTab(item.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${item.color}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.detail}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              </button>
            );
          })}
        </LifeCard>
      </div>

      <NotificationHistory />
      {/* Preferences & Settings */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          SETTINGS & CONTROLS
        </span>
        <LifeCard className="divide-y divide-slate-100 dark:divide-slate-800/80 p-0 overflow-hidden">
          {/* Appearance */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Moon className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Appearance
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">
              {isDark ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          {/* Currency */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <DollarSign className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Currency
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              GBP (£)
            </span>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Bell className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Notifications
              </span>
            </div>
            <button
              className="text-xs text-primary"
              onClick={async () => {
                await activityService.setNotifications(!notifications);
                setNotifications(!notifications);
              }}
            >
              {notifications ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Data Export */}
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            aria-busy={exporting}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-left disabled:opacity-60"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Download className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Export LifeOS Data
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">
              {exporting
                ? "Preparing…"
                : exportNotice
                  ? "Download started"
                  : "Download JSON"}
            </span>
          </button>
          <div className="px-4 py-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Export synced account data as JSON. Automatic backups and restore
              are not included.
            </p>
            {exportError && (
              <p role="alert" className="text-danger">
                {exportError}
              </p>
            )}
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={async () => {
              await createClient()?.auth.signOut();
              location.assign("/login");
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-danger">
                <LogOut className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-medium text-danger">Sign Out</span>
            </div>
            <span className="text-xs text-slate-400">Lock Session</span>
          </button>
        </LifeCard>
      </div>
    </div>
  );
}
