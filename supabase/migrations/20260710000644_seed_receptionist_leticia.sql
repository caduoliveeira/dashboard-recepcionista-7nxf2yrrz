-- Seed receptionist user: leticiaborosa@outlook.com
-- Ensure owner account exists as well

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Ensure owner account exists (idempotent)
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
      '{"name": "Admin/Owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Proprietário (Admin)', 'owner', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Seed receptionist account (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'leticiaborosa@outlook.com') THEN
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
      'leticiaborosa@outlook.com',
      crypt('leticia1234', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Leticia Borosa"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Leticia Borosa', 'receptionist', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Ensure owner profile has correct role/is_active (idempotent)
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'Proprietário (Admin)', 'owner', true
FROM auth.users
WHERE email = 'caadu1903@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'owner',
  is_active = true;

-- Ensure receptionist profile has correct role/is_active (idempotent)
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'Leticia Borosa', 'receptionist', true
FROM auth.users
WHERE email = 'leticiaborosa@outlook.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Leticia Borosa',
  role = 'receptionist',
  is_active = true;

-- RLS: Ensure receptionists can SELECT tasks (already exists, re-assert idempotently)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT TO authenticated USING (true);

-- RLS: Ensure receptionists can INSERT tasks (already open per prior migration)
DROP POLICY IF EXISTS "Enable insert for owners" ON public.tasks;
CREATE POLICY "Enable insert for owners" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: Restrict task UPDATE to owners only
DROP POLICY IF EXISTS "Enable update for owners" ON public.tasks;
CREATE POLICY "Enable update for owners" ON public.tasks
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Restrict task DELETE to owners only
DROP POLICY IF EXISTS "Enable delete for owners" ON public.tasks;
CREATE POLICY "Enable delete for owners" ON public.tasks
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Allow all authenticated to SELECT maintenance_tickets
DROP POLICY IF EXISTS "mt_select" ON public.maintenance_tickets;
CREATE POLICY "mt_select" ON public.maintenance_tickets
  FOR SELECT TO authenticated USING (true);

-- RLS: Allow all authenticated to INSERT maintenance_tickets (receptionists can report)
DROP POLICY IF EXISTS "mt_insert" ON public.maintenance_tickets;
CREATE POLICY "mt_insert" ON public.maintenance_tickets
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: Allow all authenticated to UPDATE maintenance_tickets
DROP POLICY IF EXISTS "mt_update" ON public.maintenance_tickets;
CREATE POLICY "mt_update" ON public.maintenance_tickets
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS: Restrict maintenance_tickets DELETE to owners only
DROP POLICY IF EXISTS "mt_delete" ON public.maintenance_tickets;
CREATE POLICY "mt_delete" ON public.maintenance_tickets
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- RLS: Allow all authenticated to SELECT shopping_list
DROP POLICY IF EXISTS "sl_select" ON public.shopping_list;
CREATE POLICY "sl_select" ON public.shopping_list
  FOR SELECT TO authenticated USING (true);

-- RLS: Allow all authenticated to INSERT shopping_list items
DROP POLICY IF EXISTS "sl_insert" ON public.shopping_list;
CREATE POLICY "sl_insert" ON public.shopping_list
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS: Allow all authenticated to UPDATE shopping_list items
DROP POLICY IF EXISTS "sl_update" ON public.shopping_list;
CREATE POLICY "sl_update" ON public.shopping_list
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS: Restrict shopping_list DELETE to owners only
DROP POLICY IF EXISTS "sl_delete" ON public.shopping_list;
CREATE POLICY "sl_delete" ON public.shopping_list
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );
