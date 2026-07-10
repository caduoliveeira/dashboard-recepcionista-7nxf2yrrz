DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed owner user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'caadu1903@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'caadu1903@gmail.com',
      crypt('loja1962', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Owner', 'owner', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- User exists: enforce password loja1962
    UPDATE auth.users
    SET encrypted_password = crypt('loja1962', gen_salt('bf'))
    WHERE email = 'caadu1903@gmail.com';

    -- Ensure profile exists with correct role and name
    INSERT INTO public.profiles (id, full_name, role, is_active)
    SELECT id, 'Owner', 'owner', true
    FROM auth.users
    WHERE email = 'caadu1903@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
      role = 'owner',
      full_name = 'Owner',
      is_active = true;
  END IF;
END $$;

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read profiles (needed for dashboard user lists)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow owners to update any profile
DROP POLICY IF EXISTS "Enable update for owners" ON public.profiles;
CREATE POLICY "Enable update for owners" ON public.profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- Allow owners to insert profiles
DROP POLICY IF EXISTS "Enable insert for owners" ON public.profiles;
CREATE POLICY "Enable insert for owners" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- Allow owners to delete profiles
DROP POLICY IF EXISTS "Enable delete for owners" ON public.profiles;
CREATE POLICY "Enable delete for owners" ON public.profiles
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );
