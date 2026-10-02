BEGIN;

-- Configure one verified auth user from the SQL editor/service administrator.
-- Empty configuration denies access; do not choose the first registered user.
CREATE TABLE public.private_app_owner (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.private_app_owner ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.private_app_owner FROM PUBLIC;
REVOKE ALL ON public.private_app_owner FROM anon, authenticated;

CREATE FUNCTION public.is_private_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.private_app_owner
    WHERE singleton AND user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_private_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_private_owner() TO authenticated;

-- Restrictive policies combine with existing row ownership and parent checks.
-- Even another valid Supabase account cannot use the direct database API.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles','tasks','expense_categories','expenses','budgets','habits',
    'habit_entries','ideas','goals','user_settings','income','subscriptions',
    'savings_goals','wishlist_items','recruiters','cv_versions','jobs',
    'job_followups','interviews','admin_items','notes','inbox_items',
    'focus_sessions','weekly_reviews','notification_preferences','notifications'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY private_owner_access ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_private_owner()) WITH CHECK (public.is_private_owner())',
      table_name
    );
  END LOOP;
END;
$$;
COMMIT;
