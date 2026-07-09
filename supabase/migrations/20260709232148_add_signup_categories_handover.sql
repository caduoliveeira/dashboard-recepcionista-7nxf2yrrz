-- 1. Auto-create profile on signup with role 'receptionist'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'receptionist'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Seed default task_categories (Manhã, Tarde, Noite)
INSERT INTO public.task_categories (name, start_time, end_time) VALUES
  ('Manhã', '05:00:00', '12:00:00'),
  ('Tarde', '13:00:00', '18:00:00'),
  ('Noite', '19:00:00', '23:00:00')
ON CONFLICT (name) DO UPDATE SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

-- 3. Link existing tasks to new categories by mapping old text categories
UPDATE public.tasks t
SET category_id = tc.id
FROM public.task_categories tc
WHERE t.category_id IS NULL
  AND tc.name = CASE t.category
    WHEN 'Opening' THEN 'Manhã'
    WHEN 'Shift' THEN 'Tarde'
    WHEN 'Closing' THEN 'Noite'
    ELSE NULL
  END;

-- 4. Create shift_handover_notes table
CREATE TABLE IF NOT EXISTS public.shift_handover_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.task_categories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.shift_handover_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shn_select" ON public.shift_handover_notes;
CREATE POLICY "shn_select" ON public.shift_handover_notes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shn_insert" ON public.shift_handover_notes;
CREATE POLICY "shn_insert" ON public.shift_handover_notes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shn_delete" ON public.shift_handover_notes;
CREATE POLICY "shn_delete" ON public.shift_handover_notes
  FOR DELETE TO authenticated USING (true);

-- 5. Update task_categories RLS — owner-only for INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "tc_select" ON public.task_categories;
CREATE POLICY "tc_select" ON public.task_categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "tc_insert" ON public.task_categories;
CREATE POLICY "tc_insert" ON public.task_categories
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "tc_update" ON public.task_categories;
CREATE POLICY "tc_update" ON public.task_categories
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "tc_delete" ON public.task_categories;
CREATE POLICY "tc_delete" ON public.task_categories
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
