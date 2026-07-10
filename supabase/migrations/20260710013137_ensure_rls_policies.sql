-- Ensure RLS policies exist for tasks, task_categories, and task_completions
-- Idempotent: drops and recreates policies

-- tasks: SELECT for authenticated
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT TO authenticated USING (true);

-- tasks: INSERT for owners
DROP POLICY IF EXISTS "Enable insert for owners" ON public.tasks;
CREATE POLICY "Enable insert for owners" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- tasks: UPDATE for owners
DROP POLICY IF EXISTS "Enable update for owners" ON public.tasks;
CREATE POLICY "Enable update for owners" ON public.tasks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- tasks: DELETE for owners
DROP POLICY IF EXISTS "Enable delete for owners" ON public.tasks;
CREATE POLICY "Enable delete for owners" ON public.tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- task_categories: SELECT for authenticated
DROP POLICY IF EXISTS "tc_select" ON public.task_categories;
CREATE POLICY "tc_select" ON public.task_categories
  FOR SELECT TO authenticated USING (true);

-- task_categories: INSERT for owners
DROP POLICY IF EXISTS "tc_insert" ON public.task_categories;
CREATE POLICY "tc_insert" ON public.task_categories
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- task_categories: UPDATE for owners
DROP POLICY IF EXISTS "tc_update" ON public.task_categories;
CREATE POLICY "tc_update" ON public.task_categories
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- task_categories: DELETE for owners
DROP POLICY IF EXISTS "tc_delete" ON public.task_categories;
CREATE POLICY "tc_delete" ON public.task_categories
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- task_completions: SELECT for authenticated
DROP POLICY IF EXISTS "Enable read access for all users" ON public.task_completions;
CREATE POLICY "Enable read access for all users" ON public.task_completions
  FOR SELECT TO authenticated USING (true);

-- task_completions: INSERT for authenticated
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.task_completions;
CREATE POLICY "Enable insert for authenticated users" ON public.task_completions
  FOR INSERT TO authenticated WITH CHECK (true);

-- task_completions: UPDATE for authenticated
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.task_completions;
CREATE POLICY "Enable update for authenticated users" ON public.task_completions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- task_completions: DELETE for owners only
DROP POLICY IF EXISTS "Enable delete for owners only" ON public.task_completions;
CREATE POLICY "Enable delete for owners only" ON public.task_completions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
