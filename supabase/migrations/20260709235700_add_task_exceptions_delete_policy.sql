-- Ensure task_exceptions FK cascades on task deletion
-- ALTER TABLE ... DROP CONSTRAINT IF EXISTS is already idempotent, no DO block needed
ALTER TABLE public.task_exceptions DROP CONSTRAINT IF EXISTS task_exceptions_task_id_fkey;

ALTER TABLE public.task_exceptions
  ADD CONSTRAINT task_exceptions_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- RLS: Allow owners to DELETE task_exceptions
DROP POLICY IF EXISTS "te_delete" ON public.task_exceptions;
CREATE POLICY "te_delete" ON public.task_exceptions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Ensure owners can DELETE tasks (idempotent)
DROP POLICY IF EXISTS "Enable delete for owners" ON public.tasks;
CREATE POLICY "Enable delete for owners" ON public.tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Ensure owners can DELETE task_completions (idempotent)
DROP POLICY IF EXISTS "Enable delete for owners only" ON public.task_completions;
CREATE POLICY "Enable delete for owners only" ON public.task_completions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
