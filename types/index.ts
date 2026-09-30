export type Priority = 'Low' | 'Normal' | 'Important';

export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes?: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string | null; // e.g. "6:00 PM"
  priority: Priority;
  recurrence?: TaskRecurrence;
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
  weekly_budget: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  notes?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: 'positive' | 'avoid';
  target: string;
  streak: number;
  is_active: boolean;
  weekly_progress?: string; // e.g. "4/5"
}

export interface CareerJob {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  work_style: 'Remote' | 'Hybrid' | 'Office';
  salary?: string;
  status: 'Saved' | 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  applied_date: string;
  next_action?: string;
  follow_up_date?: string;
  recruiter?: string;
  cv_version?: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  category: string;
  status: 'Inbox' | 'Saved' | 'Working On' | 'Done' | 'Archived';
  created_at: string;
}

export interface UpcomingItem {
  id: string;
  title: string;
  category: 'insurance' | 'subscription' | 'document' | 'reminder';
  days_left: number;
  due_date: string;
  cost?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  url?: string;
  wait_hours: number;
  hours_remaining: number;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  category: 'Career' | 'Money' | 'Personal' | 'Other';
  target_value?: string;
  current_value?: string;
  progress_percentage: number;
  next_action?: string;
}

export type QuickAddType =
  | 'task'
  | 'expense'
  | 'idea'
  | 'habit'
  | 'job'
  | 'note'
  | 'goal'
  | 'wishlist';
