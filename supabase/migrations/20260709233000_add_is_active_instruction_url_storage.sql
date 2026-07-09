ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS instruction_url TEXT;

DROP POLICY IF EXISTS "Enable update for owners" ON public.profiles;
CREATE POLICY "Enable update for owners" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "task_attachments_upload" ON storage.objects;
CREATE POLICY "task_attachments_upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "task_attachments_read" ON storage.objects;
CREATE POLICY "task_attachments_read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'task-attachments');

DROP POLICY IF EXISTS "task_attachments_delete" ON storage.objects;
CREATE POLICY "task_attachments_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'task-attachments');
