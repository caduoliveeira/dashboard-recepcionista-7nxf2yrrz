-- Add INSERT and UPDATE RLS policies for tasks table (owner role only)
-- SELECT already exists; these allow owners to create and update tasks

DROP POLICY IF EXISTS "Enable insert for owners" ON public.tasks;
CREATE POLICY "Enable insert for owners" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Enable update for owners" ON public.tasks;
CREATE POLICY "Enable update for owners" ON public.tasks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
