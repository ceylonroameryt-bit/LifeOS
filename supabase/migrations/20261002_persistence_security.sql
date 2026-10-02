BEGIN;
ALTER TABLE public.expenses ADD COLUMN notes text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN name SET DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN weekly_budget numeric(12,2) NOT NULL DEFAULT 150;
ALTER TABLE public.goals ALTER COLUMN target_value TYPE text USING target_value::text;
ALTER TABLE public.goals ALTER COLUMN current_value TYPE text USING current_value::text;
ALTER TABLE public.goals ADD COLUMN category text NOT NULL DEFAULT 'Other';
ALTER TABLE public.goals ADD COLUMN progress_percentage integer NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100);
ALTER TABLE public.goals ADD COLUMN next_action text;
ALTER TABLE public.focus_sessions ADD COLUMN task_title text;
ALTER TABLE public.focus_sessions ADD COLUMN remaining_seconds integer;
ALTER TABLE public.focus_sessions ADD COLUMN ends_at timestamptz;
ALTER TABLE public.weekly_reviews ADD COLUMN tasks_total integer NOT NULL DEFAULT 0;
ALTER TABLE public.weekly_reviews ADD COLUMN applications_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.weekly_reviews ADD COLUMN key_dates_count integer NOT NULL DEFAULT 0;
-- Normalize duplicate weeks before introducing a deterministic upsert key.
DELETE FROM public.weekly_reviews a USING public.weekly_reviews b WHERE a.user_id=b.user_id AND a.week_start_date=b.week_start_date AND (a.created_at,a.id)<(b.created_at,b.id);
ALTER TABLE public.weekly_reviews ADD CONSTRAINT weekly_reviews_user_week UNIQUE(user_id,week_start_date);
ALTER TABLE public.interviews ALTER COLUMN interview_type SET DEFAULT 'Other';

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 INSERT INTO public.profiles(id,name,email) VALUES(new.id,COALESCE(new.raw_user_meta_data->>'name',''),new.email);
 INSERT INTO public.user_settings(user_id) VALUES(new.id);
 INSERT INTO public.budgets(user_id,period_type,amount) VALUES(new.id,'weekly',150),(new.id,'monthly',600);
 INSERT INTO public.notification_preferences(user_id) VALUES(new.id);
 RETURN new;
END;
$$;

-- Shared categories are read-only. Authenticated users can modify only their own.
DROP POLICY "Users can access their own or default categories" ON public.expense_categories;
CREATE POLICY category_read ON public.expense_categories FOR SELECT TO authenticated USING(user_id IS NULL OR user_id=auth.uid());
CREATE POLICY category_insert ON public.expense_categories FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid());
CREATE POLICY category_update ON public.expense_categories FOR UPDATE TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
CREATE POLICY category_delete ON public.expense_categories FOR DELETE TO authenticated USING(user_id=auth.uid());
CREATE UNIQUE INDEX expense_category_owner_name ON public.expense_categories(user_id,name) WHERE user_id IS NOT NULL;
INSERT INTO public.expense_categories(name) SELECT seed.name FROM unnest(ARRAY['Food','Shopping','Transport','Entertainment','Bills','Subscriptions','Other']) AS seed(name) WHERE NOT EXISTS(SELECT 1 FROM public.expense_categories c WHERE c.name=seed.name AND c.user_id IS NULL);

-- RESTRICTIVE policies combine with existing owner policies; additional permissive
-- policies cannot bypass ownership of referenced records.
CREATE POLICY expense_category_owner ON public.expenses AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND (category_id IS NULL OR EXISTS(SELECT 1 FROM public.expense_categories c WHERE c.id=category_id AND (c.user_id IS NULL OR c.user_id=auth.uid()))));
CREATE POLICY habit_parent_owner ON public.habit_entries AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.habits h WHERE h.id=habit_id AND h.user_id=auth.uid()));
CREATE POLICY job_references_owner ON public.jobs AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid()
 AND (recruiter_id IS NULL OR EXISTS(SELECT 1 FROM public.recruiters r WHERE r.id=recruiter_id AND r.user_id=auth.uid()))
 AND (cv_version_id IS NULL OR EXISTS(SELECT 1 FROM public.cv_versions c WHERE c.id=cv_version_id AND c.user_id=auth.uid())));
CREATE POLICY interview_job_owner ON public.interviews AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND j.user_id=auth.uid()));
CREATE POLICY followup_job_owner ON public.job_followups AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.jobs j WHERE j.id=job_id AND j.user_id=auth.uid()));
CREATE POLICY focus_task_owner ON public.focus_sessions AS RESTRICTIVE FOR ALL TO authenticated
 USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid() AND (task_id IS NULL OR EXISTS(SELECT 1 FROM public.tasks t WHERE t.id=task_id AND t.user_id=auth.uid())));
COMMIT;
