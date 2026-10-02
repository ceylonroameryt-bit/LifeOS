"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DataStatus } from "./DataStatus";
import React, { useState, useEffect } from "react";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { TabletRail } from "./TabletRail";
import { QuickAddModal } from "@/components/quick-add/QuickAddModal";
import { profileService } from "@/lib/services/profileService";
import { Sun, Moon, Search } from "lucide-react";

interface AppShellProps {
  children: (props: {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    userName: string;
    onOpenQuickAdd: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
    onUpdateName: (name: string) => void | Promise<void>;
  }) => React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const currentTab = usePathname().split("/")[1] || "today";
  const setCurrentTab = (tab: string) => {
    if (!navigator.onLine) window.history.pushState(null, "", "/" + tab);
    else router.push("/" + tab);
  };
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [isDark, setIsDark] = useState(false);

  // Initialize profile and theme
  useEffect(() => {
    profileService
      .getProfile()
      .then((prof) => {
        if (prof?.name) setUserName(prof.name);
      })
      .catch(() => {});

    const handleProfileUpdate = () => {
      profileService
        .getProfile()
        .then((prof) => {
          if (prof?.name) setUserName(prof.name);
        })
        .catch(() => {});
    };

    const handleOpenQuickAdd = () => setIsQuickAddOpen(true);

    window.addEventListener("lifeos-profile-updated", handleProfileUpdate);
    window.addEventListener("lifeos-open-quick-add", handleOpenQuickAdd);

    // Dark mode check
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    return () => {
      window.removeEventListener("lifeos-profile-updated", handleProfileUpdate);
      window.removeEventListener("lifeos-open-quick-add", handleOpenQuickAdd);
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
      setIsDark(true);
    }
  };

  const handleUpdateName = async (newName: string) => {
    await profileService.updateName(newName);
    setUserName(newName);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F8FC] dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Tablet Rail (visible between 768px and 1199px) */}
      <div className="hidden md:block xl:hidden flex-shrink-0">
        <TabletRail
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          userName={userName}
        />
      </div>

      {/* Desktop Full Sidebar (visible on xl >= 1200px) */}
      <div className="hidden xl:block flex-shrink-0">
        <DesktopSidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          userName={userName}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Minimal Bar on Tablet & Desktop */}
        <header className="hidden md:flex items-center justify-between px-6 lg:px-8 py-3.5 border-b border-border/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {currentTab === "admin" ? "Life Admin" : currentTab}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search or capture... (Cmd+K)</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        <DataStatus />
        <button
          className="self-end px-6 text-xs"
          onClick={async () => {
            await createClient()?.auth.signOut();
            location.assign("/login");
          }}
        >
          Sign out
        </button>
        {/* Page Canvas */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 md:py-8 max-w-6xl w-full mx-auto">
          {children({
            currentTab,
            setCurrentTab,
            userName,
            onOpenQuickAdd: () => setIsQuickAddOpen(true),
            isDark,
            onToggleTheme: toggleTheme,
            onUpdateName: handleUpdateName,
          })}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileNav
        currentTab={currentTab === "me" ? "me" : "today"}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
