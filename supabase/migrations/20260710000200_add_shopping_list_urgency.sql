ALTER TABLE public.shopping_list ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "sl_delete" ON public.shopping_list;
CREATE POLICY "sl_delete" ON public.shopping_list
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
