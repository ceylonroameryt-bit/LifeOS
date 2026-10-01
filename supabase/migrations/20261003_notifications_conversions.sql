BEGIN;
CREATE TABLE public.notifications(
 id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 title text NOT NULL,
 dedupe_key text NOT NULL,
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,dedupe_key)
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_owner ON public.notifications FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());

-- The conversion and source state change share one transaction and lock, so a
-- failed destination write or a repeated click cannot duplicate a capture.
CREATE FUNCTION public.convert_capture(source_table text,source_id uuid,target_type text) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE capture text; target_id uuid; owner uuid:=auth.uid(); current_status text;
BEGIN
 IF owner IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF source_table='ideas' THEN
  SELECT title,status INTO capture,current_status FROM public.ideas WHERE id=source_id AND user_id=owner FOR UPDATE;
  IF current_status='Working On' THEN RAISE EXCEPTION 'Idea already converted'; END IF;
 ELSIF source_table='inbox_items' THEN
  SELECT content,status INTO capture,current_status FROM public.inbox_items WHERE id=source_id AND user_id=owner FOR UPDATE;
  IF current_status<>'inbox' THEN RAISE EXCEPTION 'Capture already processed'; END IF;
 ELSE RAISE EXCEPTION 'Invalid source'; END IF;
 IF capture IS NULL THEN RAISE EXCEPTION 'Capture not found'; END IF;
 IF target_type='task' THEN INSERT INTO public.tasks(user_id,title) VALUES(owner,capture) RETURNING id INTO target_id;
 ELSIF target_type='idea' THEN INSERT INTO public.ideas(user_id,title) VALUES(owner,capture) RETURNING id INTO target_id;
 ELSIF target_type='note' THEN INSERT INTO public.notes(user_id,title,body) VALUES(owner,left(capture,80),capture) RETURNING id INTO target_id;
 ELSIF target_type='wishlist' THEN INSERT INTO public.wishlist_items(user_id,item_name,price,available_after) VALUES(owner,capture,0,now()+interval '48 hours') RETURNING id INTO target_id;
 ELSE RAISE EXCEPTION 'Invalid target'; END IF;
 IF source_table='ideas' THEN UPDATE public.ideas SET status='Working On' WHERE id=source_id AND user_id=owner;
 ELSE UPDATE public.inbox_items SET status='processed' WHERE id=source_id AND user_id=owner; END IF;
 RETURN target_id;
END;
$$;
REVOKE ALL ON FUNCTION public.convert_capture(text,uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.convert_capture(text,uuid,text) TO authenticated;
COMMIT;
