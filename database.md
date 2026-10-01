> Historical product specification. See [README.md](README.md) for the current implementation, validation commands, deployment requirements, and limitations.

# LifeOS — Database Schema & Data Architecture

All tables use PostgreSQL 15+ hosted on Supabase, enforcing strict **Row Level Security (RLS)** with `user_id = auth.uid()`. Monetary values use `NUMERIC(12,2)` to guarantee penny-level decimal precision.

---

## 1. Entity Relationship Diagram (Textual Representation)

```
[auth.users] (Supabase Auth)
     │
     ├── 1:1 ──> [profiles]
     ├── 1:1 ──> [user_settings]
     ├── 1:1 ──> [notification_preferences]
     ├── 1:N ──> [tasks] ─── 1:1 ──> [task_recurrences]
     ├── 1:N ──> [expenses] ─── N:1 ──> [expense_categories]
     ├── 1:N ──> [budgets]
     ├── 1:N ──> [income]
     ├── 1:N ──> [subscriptions]
     ├── 1:N ──> [savings_goals]
     ├── 1:N ──> [habits] ─── 1:N ──> [habit_entries]
     ├── 1:N ──> [ideas]
     ├── 1:N ──> [goals]
     ├── 1:N ──> [jobs] ──┬── 1:N ──> [job_followups]
     │                    ├── 1:N ──> [interviews]
     │                    ├── 1:N ──> [job_notes]
     │                    └── N:1 ──> [recruiters], [cv_versions]
     ├── 1:N ──> [admin_items]
     ├── 1:N ──> [calendar_items]
     ├── 1:N ──> [notes]
     ├── 1:N ──> [inbox_items]
     ├── 1:N ──> [wishlist_items]
     ├── 1:N ──> [focus_sessions]
     └── 1:N ──> [weekly_reviews]
```

---

## 2. Table Specifications

### 2.1 Core & Profiles
- **`profiles`**:
  - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL DEFAULT 'Poorna'`
  - `email TEXT`
  - `avatar_url TEXT`
  - `currency TEXT NOT NULL DEFAULT 'GBP'`
  - `timezone TEXT NOT NULL DEFAULT 'Europe/London'`
  - `week_start TEXT NOT NULL DEFAULT 'monday' CHECK (week_start IN ('monday', 'sunday'))`
  - `budget_mode TEXT NOT NULL DEFAULT 'weekly' CHECK (budget_mode IN ('weekly', 'monthly'))`
  - `appearance TEXT NOT NULL DEFAULT 'system' CHECK (appearance IN ('system', 'light', 'dark'))`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

- **`user_settings`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `theme TEXT NOT NULL DEFAULT 'system'`
  - `currency TEXT NOT NULL DEFAULT 'GBP'`
  - `notifications_enabled BOOLEAN NOT NULL DEFAULT true`
  - `morning_summary BOOLEAN NOT NULL DEFAULT true`
  - `evening_summary BOOLEAN NOT NULL DEFAULT true`

### 2.2 Tasks & Execution
- **`tasks`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `notes TEXT DEFAULT ''`
  - `due_date DATE NOT NULL DEFAULT CURRENT_DATE`
  - `due_time TEXT`
  - `priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'Important'))`
  - `recurrence_rule TEXT DEFAULT 'none' CHECK (recurrence_rule IN ('none', 'daily', 'weekly', 'monthly'))`
  - `reminder_at TIMESTAMPTZ`
  - `completed BOOLEAN NOT NULL DEFAULT false`
  - `completed_at TIMESTAMPTZ`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

### 2.3 Finance & Money
- **`expense_categories`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` (NULL for global defaults)
  - `name TEXT NOT NULL`
  - `icon TEXT NOT NULL DEFAULT 'tag'`
  - `color TEXT DEFAULT '#2F6BFF'`

- **`expenses`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)`
  - `description TEXT NOT NULL`
  - `category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL`
  - `expense_date DATE NOT NULL DEFAULT CURRENT_DATE`
  - `notes TEXT`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

- **`budgets`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `period_type TEXT NOT NULL DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'monthly'))`
  - `amount NUMERIC(12, 2) NOT NULL DEFAULT 150.00 CHECK (amount >= 0)`
  - `start_date DATE NOT NULL DEFAULT CURRENT_DATE`

- **`income`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `source TEXT NOT NULL`
  - `amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)`
  - `income_date DATE NOT NULL DEFAULT CURRENT_DATE`
  - `is_recurring BOOLEAN NOT NULL DEFAULT false`
  - `recurrence_rule TEXT`

- **`subscriptions`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL`
  - `amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0)`
  - `billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly'))`
  - `renewal_date DATE NOT NULL`
  - `category TEXT DEFAULT 'Entertainment'`
  - `active BOOLEAN NOT NULL DEFAULT true`

- **`savings_goals`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount >= 0)`
  - `current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0)`
  - `target_date DATE`
  - `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'))`

### 2.4 Habits
- **`habits`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL`
  - `type TEXT NOT NULL DEFAULT 'positive' CHECK (type IN ('positive', 'avoid'))`
  - `target TEXT` (e.g. "5 days / week" or "Every day")
  - `is_active BOOLEAN NOT NULL DEFAULT true`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

- **`habit_entries`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `entry_date DATE NOT NULL DEFAULT CURRENT_DATE`
  - `status TEXT NOT NULL CHECK (status IN ('success', 'slip', 'skipped'))`
  - `trigger TEXT` (e.g. "Bored", "Stress", "Saw something online", "Other")
  - `notes TEXT`
  - `UNIQUE(habit_id, entry_date)`

### 2.5 Ideas & Goals
- **`ideas`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `content TEXT DEFAULT ''`
  - `category TEXT DEFAULT 'General'`
  - `status TEXT NOT NULL DEFAULT 'Saved' CHECK (status IN ('Inbox', 'Saved', 'Working On', 'Done', 'Archived'))`

- **`goals`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `category TEXT NOT NULL CHECK (category IN ('Career', 'Money', 'Personal', 'Other'))`
  - `target_value TEXT`
  - `current_value TEXT`
  - `progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100)`
  - `next_action TEXT`
  - `status TEXT NOT NULL DEFAULT 'in_progress'`

### 2.6 Career & Jobs
- **`recruiters`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL`
  - `company TEXT`
  - `email TEXT`
  - `phone TEXT`
  - `linkedin_url TEXT`
  - `notes TEXT`

- **`cv_versions`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `name TEXT NOT NULL`
  - `file_url TEXT`
  - `notes TEXT`

- **`jobs`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `job_title TEXT NOT NULL`
  - `company TEXT NOT NULL`
  - `location TEXT NOT NULL DEFAULT 'Remote'`
  - `work_style TEXT NOT NULL DEFAULT 'Hybrid' CHECK (work_style IN ('Remote', 'Hybrid', 'Office'))`
  - `salary_min NUMERIC(12, 2)`
  - `salary_max NUMERIC(12, 2)`
  - `currency TEXT DEFAULT 'GBP'`
  - `job_url TEXT`
  - `job_description TEXT`
  - `status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Closed'))`
  - `applied_at DATE DEFAULT CURRENT_DATE`
  - `followup_at DATE`
  - `next_action TEXT`
  - `recruiter_id UUID REFERENCES recruiters(id) ON DELETE SET NULL`
  - `cv_version_id UUID REFERENCES cv_versions(id) ON DELETE SET NULL`
  - `notes TEXT`

- **`job_followups`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE`
  - `followup_date DATE NOT NULL`
  - `status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed'))`
  - `notes TEXT`

- **`interviews`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE`
  - `interview_date DATE NOT NULL`
  - `interview_time TEXT`
  - `interview_type TEXT NOT NULL DEFAULT 'Video' CHECK (interview_type IN ('Phone', 'Teams', 'Zoom', 'Google Meet', 'In person', 'Other'))`
  - `meeting_url TEXT`
  - `stage TEXT DEFAULT 'First Round'`
  - `notes TEXT`

### 2.7 Life Admin & Wishlist
- **`admin_items`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `title TEXT NOT NULL`
  - `category TEXT NOT NULL CHECK (category IN ('Insurance', 'Vehicle', 'Documents', 'Bills', 'Subscriptions', 'Visa / permits', 'Appointments', 'Other'))`
  - `due_date DATE NOT NULL`
  - `cost TEXT`
  - `reminder_date DATE`
  - `notes TEXT`
  - `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived'))`

- **`wishlist_items`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `item_name TEXT NOT NULL`
  - `price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)`
  - `url TEXT`
  - `priority TEXT DEFAULT 'Normal'`
  - `notes TEXT`
  - `wait_duration_hours INTEGER NOT NULL DEFAULT 48`
  - `available_after TIMESTAMPTZ NOT NULL`
  - `status TEXT NOT NULL DEFAULT 'Waiting' CHECK (status IN ('Waiting', 'Approved', 'Bought', 'Removed'))`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

### 2.8 Focus Mode & Universal Inbox
- **`focus_sessions`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `task_id UUID REFERENCES tasks(id) ON DELETE SET NULL`
  - `duration_minutes INTEGER NOT NULL DEFAULT 25`
  - `started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`
  - `completed_at TIMESTAMPTZ`
  - `status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'interrupted', 'in_progress'))`

- **`inbox_items`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `content TEXT NOT NULL`
  - `suggested_type TEXT DEFAULT 'Task'`
  - `status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'processed', 'archived'))`
  - `created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`

- **`weekly_reviews`**:
  - `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `week_start_date DATE NOT NULL`
  - `tasks_completed INTEGER NOT NULL DEFAULT 0`
  - `budget_spent NUMERIC(12,2) NOT NULL DEFAULT 0`
  - `budget_target NUMERIC(12,2) NOT NULL DEFAULT 0`
  - `habits_rate INTEGER NOT NULL DEFAULT 0`
  - `priority_1 TEXT`
  - `priority_2 TEXT`
  - `priority_3 TEXT`
  - `notes TEXT`

---

## 3. Row Level Security (RLS) Template
Every table is secured with the canonical policy:
```sql
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own <table_name>"
    ON public.<table_name> FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```
