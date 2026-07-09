CREATE TABLE IF NOT EXISTS public.task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.task_categories(id) ON DELETE SET NULL;

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

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

INSERT INTO public.task_categories (name, start_time, end_time) VALUES
  ('Manhã', '05:00:00', '12:00:00'),
  ('Tarde', '13:00:00', '18:00:00'),
  ('Noite', '19:00:00', '23:00:00')
ON CONFLICT (name) DO NOTHING;

UPDATE public.tasks SET category_id = (
  SELECT id FROM public.task_categories WHERE name = 'Manhã'
) WHERE category = 'Opening' AND category_id IS NULL;

UPDATE public.tasks SET category_id = (
  SELECT id FROM public.task_categories WHERE name = 'Tarde'
) WHERE category = 'Shift' AND category_id IS NULL;

UPDATE public.tasks SET category_id = (
  SELECT id FROM public.task_categories WHERE name = 'Noite'
) WHERE category = 'Closing' AND category_id IS NULL;
