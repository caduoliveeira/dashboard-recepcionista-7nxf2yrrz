-- Allow authenticated users to SELECT their own profile or all profiles
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to UPDATE their own profile
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Keep owner update policy
DROP POLICY IF EXISTS "Enable update for owners" ON public.profiles;
CREATE POLICY "Enable update for owners" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Ensure task completions can be updated by the person who created it
DROP POLICY IF EXISTS "Enable update for own completions" ON public.task_completions;
CREATE POLICY "Enable update for own completions" ON public.task_completions
  FOR UPDATE TO authenticated USING (completed_by = auth.uid()) WITH CHECK (completed_by = auth.uid());
