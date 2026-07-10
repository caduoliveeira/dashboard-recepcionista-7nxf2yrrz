-- Ensure RLS is enabled on all required tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handover_notes ENABLE ROW LEVEL SECURITY;

-- =========================
-- profiles policies
-- =========================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for owners" ON public.profiles;
CREATE POLICY "Enable insert for owners" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Enable update for owners" ON public.profiles;
CREATE POLICY "Enable update for owners" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Enable delete for owners" ON public.profiles;
CREATE POLICY "Enable delete for owners" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =========================
-- tasks policies
-- =========================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT TO authenticated USING (true);

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

DROP POLICY IF EXISTS "Enable delete for owners" ON public.tasks;
CREATE POLICY "Enable delete for owners" ON public.tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =========================
-- task_categories policies
-- =========================
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

-- =========================
-- task_completions policies
-- =========================
DROP POLICY IF EXISTS "Enable read access for all users" ON public.task_completions;
CREATE POLICY "Enable read access for all users" ON public.task_completions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.task_completions;
CREATE POLICY "Enable insert for authenticated users" ON public.task_completions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.task_completions;
CREATE POLICY "Enable update for authenticated users" ON public.task_completions
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for own completions" ON public.task_completions;
CREATE POLICY "Enable update for own completions" ON public.task_completions
  FOR UPDATE TO authenticated USING (completed_by = auth.uid()) WITH CHECK (completed_by = auth.uid());

DROP POLICY IF EXISTS "Enable delete for owners only" ON public.task_completions;
CREATE POLICY "Enable delete for owners only" ON public.task_completions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =========================
-- task_exceptions policies
-- =========================
DROP POLICY IF EXISTS "te_select" ON public.task_exceptions;
CREATE POLICY "te_select" ON public.task_exceptions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "te_insert" ON public.task_exceptions;
CREATE POLICY "te_insert" ON public.task_exceptions
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "te_delete" ON public.task_exceptions;
CREATE POLICY "te_delete" ON public.task_exceptions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =========================
-- shift_handover_notes policies
-- =========================
DROP POLICY IF EXISTS "shn_select" ON public.shift_handover_notes;
CREATE POLICY "shn_select" ON public.shift_handover_notes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shn_insert" ON public.shift_handover_notes;
CREATE POLICY "shn_insert" ON public.shift_handover_notes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "shn_delete" ON public.shift_handover_notes;
CREATE POLICY "shn_delete" ON public.shift_handover_notes
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =========================
-- Seed user: caadu1903@gmail.com / Skip@Pass
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'caadu1903@gmail.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'caadu1903@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin/Owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;

-- Ensure password is Skip@Pass (idempotent)
UPDATE auth.users
SET encrypted_password = crypt('Skip@Pass', gen_salt('bf'))
WHERE email = 'caadu1903@gmail.com';

-- Ensure profile exists with owner role and is_active = true
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'Proprietário (Admin)', 'owner', true
FROM auth.users
WHERE email = 'caadu1903@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  is_active = true;

-- Fix any NULL token columns in auth.users (GoTrue compatibility)
UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
