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
  avatar_url?: string;
  currency: string;
  timezone: string;
  week_start?: 'monday' | 'sunday';
  budget_period: 'weekly' | 'monthly';
  weekly_budget: number;
  appearance?: 'system' | 'light' | 'dark';
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

export interface ExpenseCategory {
  id: string;
  user_id?: string | null;
  name: string;
  icon: string;
  color?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  category_id?: string;
  expense_date: string;
  notes?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly';
  amount: number;
  start_date: string;
}

export interface Income {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  income_date: string;
  is_recurring: boolean;
  recurrence_rule?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  renewal_date: string;
  category: string;
  active: boolean;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: 'active' | 'completed' | 'paused';
}

export type HabitType = 'positive' | 'avoid';
export type SlipTrigger = 'Bored' | 'Stress' | 'Saw something online' | 'Other';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  target: string;
  streak: number;
  is_active: boolean;
  weekly_progress?: string; // e.g. "4/5"
  days_completed?: boolean[]; // 7 elements for M T W T F S S
  slip_count?: number;
  common_trigger?: string;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  user_id: string;
  entry_date: string;
  status: 'success' | 'slip' | 'skipped';
  trigger?: SlipTrigger;
  notes?: string;
}

export type WorkStyle = 'Remote' | 'Hybrid' | 'Office';
export type JobStatus =
  | 'Saved'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Closed';

export interface Recruiter {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  notes?: string;
  last_contact_at?: string;
  next_followup_at?: string;
}

export interface CVVersion {
  id: string;
  user_id: string;
  name: string;
  file_url?: string;
  notes?: string;
  created_at: string;
  applications_count?: number;
  interviews_count?: number;
}

export interface CareerJob {
  id: string;
  user_id: string;
  title: string;
  company: string;
  location: string;
  work_style: WorkStyle;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  job_url?: string;
  job_description?: string;
  status: JobStatus;
  applied_date: string;
  next_action?: string;
  follow_up_date?: string;
  recruiter_id?: string;
  recruiter?: string;
  cv_version_id?: string;
  cv_version?: string;
  notes?: string;
}

export interface JobFollowup {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company: string;
  followup_date: string;
  status: 'pending' | 'completed' | 'dismissed';
  notes?: string;
}

export interface Interview {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  company: string;
  interview_date: string;
  interview_time?: string;
  interview_type: 'Phone' | 'Teams' | 'Zoom' | 'Google Meet' | 'In person' | 'Other';
  meeting_url?: string;
  stage: string;
  notes?: string;
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

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  category: 'Career' | 'Money' | 'Personal' | 'Other';
  target_value?: string;
  current_value?: string;
  progress_percentage: number;
  next_action?: string;
  status?: 'in_progress' | 'completed' | 'paused';
}

export interface UpcomingItem {
  id: string;
  title: string;
  category: 'insurance' | 'subscription' | 'document' | 'reminder';
  days_left: number;
  due_date: string;
  cost?: string;
}

export type AdminCategory =
  | 'Insurance'
  | 'Vehicle'
  | 'Documents'
  | 'Bills'
  | 'Subscriptions'
  | 'Visa / permits'
  | 'Appointments'
  | 'Other';

export interface AdminItem {
  id: string;
  user_id: string;
  title: string;
  category: AdminCategory;
  due_date: string;
  cost?: string;
  days_remaining: number;
  reminder_date?: string;
  notes?: string;
  status: 'active' | 'completed' | 'archived';
}

export interface WishlistItem {
  id: string;
  user_id: string;
  title: string;
  price: number;
  url?: string;
  priority?: string;
  notes?: string;
  wait_duration_hours: number;
  hours_remaining: number;
  available_after: string;
  status: 'Waiting' | 'Approved' | 'Bought' | 'Removed';
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  content: string;
  suggested_type: string;
  status: 'inbox' | 'processed' | 'archived';
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  task_id?: string | null;
  task_title?: string;
  duration_minutes: number;
  started_at: string;
  completed_at?: string | null;
  status: 'completed' | 'interrupted' | 'in_progress';
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string;
  tasks_completed: number;
  tasks_total: number;
  budget_spent: number;
  budget_target: number;
  habits_rate: string;
  applications_count: number;
  key_dates_count: number;
  priority_1: string;
  priority_2: string;
  priority_3: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'task' | 'interview' | 'admin' | 'subscription';
  reference_id?: string;
  badge_color?: string;
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
