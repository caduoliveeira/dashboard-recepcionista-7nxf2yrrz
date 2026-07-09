-- Idempotent seed for owner account with password loja1962
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
      crypt('loja1962', gen_salt('bf')),
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

-- Update password to loja1962 (idempotent — safe to run multiple times)
UPDATE auth.users
SET encrypted_password = crypt('loja1962', gen_salt('bf'))
WHERE email = 'caadu1903@gmail.com';

-- Ensure profile exists with owner role and is_active = true
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'Proprietário (Admin)', 'owner', true
FROM auth.users
WHERE email = 'caadu1903@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  is_active = true;

-- RLS: Allow owners to DELETE tasks
DROP POLICY IF EXISTS "Enable delete for owners" ON public.tasks;
CREATE POLICY "Enable delete for owners" ON public.tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Allow owners to INSERT profiles
DROP POLICY IF EXISTS "Enable insert for owners" ON public.profiles;
CREATE POLICY "Enable insert for owners" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Allow owners to DELETE profiles
DROP POLICY IF EXISTS "Enable delete for owners" ON public.profiles;
CREATE POLICY "Enable delete for owners" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Restrict DELETE on task_completions to owners only
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.task_completions;
DROP POLICY IF EXISTS "Enable delete for owners only" ON public.task_completions;
CREATE POLICY "Enable delete for owners only" ON public.task_completions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Restrict DELETE on shift_handover_notes to owners only
DROP POLICY IF EXISTS "shn_delete" ON public.shift_handover_notes;
CREATE POLICY "shn_delete" ON public.shift_handover_notes
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
