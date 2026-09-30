'use client';

import React, { useState, useEffect } from 'react';
import { MobileNav } from './MobileNav';
import { DesktopSidebar } from './DesktopSidebar';
import { QuickAddModal } from '@/components/quick-add/QuickAddModal';
import { profileService } from '@/lib/services/profileService';
import { Sun, Moon } from 'lucide-react';

interface AppShellProps {
  children: (props: {
    currentTab: string;
    userName: string;
    onOpenQuickAdd: () => void;
    isDark: boolean;
    onToggleTheme: () => void;
    onUpdateName: (name: string) => void;
  }) => React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [currentTab, setCurrentTab] = useState<string>('today');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [userName, setUserName] = useState('Poorna');
  const [isDark, setIsDark] = useState(false);

  // Initialize profile and theme
  useEffect(() => {
    profileService.getProfile().then((prof) => {
      if (prof?.name) setUserName(prof.name);
    });

    const handleProfileUpdate = () => {
      profileService.getProfile().then((prof) => {
        if (prof?.name) setUserName(prof.name);
      });
    };

    const handleOpenQuickAdd = () => setIsQuickAddOpen(true);

    window.addEventListener('lifeos-profile-updated', handleProfileUpdate);
    window.addEventListener('lifeos-open-quick-add', handleOpenQuickAdd);

    // Dark mode check
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    return () => {
      window.removeEventListener('lifeos-profile-updated', handleProfileUpdate);
      window.removeEventListener('lifeos-open-quick-add', handleOpenQuickAdd);
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleUpdateName = async (newName: string) => {
    await profileService.updateName(newName);
    setUserName(newName);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar (visible on md:flex and above) */}
      <div className="hidden md:block flex-shrink-0">
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
        <header className="hidden md:flex items-center justify-end px-8 py-3.5 border-b border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-5 md:py-8 max-w-6xl w-full mx-auto">
          {children({
            currentTab,
            userName,
            onOpenQuickAdd: () => setIsQuickAddOpen(true),
            isDark,
            onToggleTheme: toggleTheme,
            onUpdateName: handleUpdateName,
          })}
        </main>
      </div>

      {/* Mobile Bottom Navigation (<768px) */}
      <MobileNav
        currentTab={currentTab === 'me' ? 'me' : 'today'}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          // Handled via event listener
        }}
      />
    </div>
  );
}
