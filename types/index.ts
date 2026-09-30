export type Priority = 'Low' | 'Normal' | 'Important';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes?: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string | null; // e.g. "6:00 PM"
  priority: Priority;
  reminder_at?: string | null;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email?: string;
  currency: string;
  timezone: string;
  budget_period: 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'system' | 'light' | 'dark';
  currency: string;
  notifications_enabled: boolean;
  morning_summary: boolean;
  evening_summary: boolean;
}

export type QuickAddType = 'task' | 'idea' | 'expense' | 'habit' | 'note' | 'goal';
