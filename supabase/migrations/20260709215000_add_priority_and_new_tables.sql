ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_priority_check') THEN
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('High', 'Medium', 'Low'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  skipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skipped_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_select" ON public.stock_items;
CREATE POLICY "stock_select" ON public.stock_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "stock_insert" ON public.stock_items;
CREATE POLICY "stock_insert" ON public.stock_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "stock_update" ON public.stock_items;
CREATE POLICY "stock_update" ON public.stock_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "stock_delete" ON public.stock_items;
CREATE POLICY "stock_delete" ON public.stock_items FOR DELETE TO authenticated USING (true);

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mt_select" ON public.maintenance_tickets;
CREATE POLICY "mt_select" ON public.maintenance_tickets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "mt_insert" ON public.maintenance_tickets;
CREATE POLICY "mt_insert" ON public.maintenance_tickets FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mt_update" ON public.maintenance_tickets;
CREATE POLICY "mt_update" ON public.maintenance_tickets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sl_select" ON public.shopping_list;
CREATE POLICY "sl_select" ON public.shopping_list FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sl_insert" ON public.shopping_list;
CREATE POLICY "sl_insert" ON public.shopping_list FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sl_update" ON public.shopping_list;
CREATE POLICY "sl_update" ON public.shopping_list FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sl_delete" ON public.shopping_list;
CREATE POLICY "sl_delete" ON public.shopping_list FOR DELETE TO authenticated USING (true);

ALTER TABLE public.task_exceptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "te_select" ON public.task_exceptions;
CREATE POLICY "te_select" ON public.task_exceptions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "te_insert" ON public.task_exceptions;
CREATE POLICY "te_insert" ON public.task_exceptions FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ntf_select" ON public.notifications;
CREATE POLICY "ntf_select" ON public.notifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ntf_update" ON public.notifications;
CREATE POLICY "ntf_update" ON public.notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ntf_delete" ON public.notifications;
CREATE POLICY "ntf_delete" ON public.notifications FOR DELETE TO authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.stock_items LIMIT 1) THEN
    INSERT INTO public.stock_items (name, quantity, unit) VALUES
      ('Água Mineral', 50, 'un'),
      ('Toalhas', 120, 'un'),
      ('Whey Protein', 8, 'pote'),
      ('Copos Descartaveis', 200, 'un'),
      ('Papel Toalha', 30, 'rolo');
  END IF;
END $$;
