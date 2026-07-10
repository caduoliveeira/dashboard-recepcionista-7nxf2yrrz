-- Seed default task categories and update seed user
DO $$
BEGIN
  -- Rename DIÁRIO to DIÁRIA if it exists and DIÁRIA doesn't
  IF EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'DIÁRIO') AND
     NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'DIÁRIA') THEN
    UPDATE public.task_categories SET name = 'DIÁRIA' WHERE name = 'DIÁRIO';
  END IF;

  -- Create DIÁRIA if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'DIÁRIA') THEN
    INSERT INTO public.task_categories (name, start_time, end_time)
    VALUES ('DIÁRIA', '05:00:00', '23:00:00');
  END IF;

  -- Create MANHÃ if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'MANHÃ') THEN
    INSERT INTO public.task_categories (name, start_time, end_time)
    VALUES ('MANHÃ', '06:00:00', '12:00:00');
  END IF;

  -- Create TARDE if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'TARDE') THEN
    INSERT INTO public.task_categories (name, start_time, end_time)
    VALUES ('TARDE', '12:00:00', '18:00:00');
  END IF;

  -- Create NOITE if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.task_categories WHERE name = 'NOITE') THEN
    INSERT INTO public.task_categories (name, start_time, end_time)
    VALUES ('NOITE', '18:00:00', '23:00:00');
  END IF;
END $$;

-- Seed or update user: caadu1903@gmail.com with password Skip@Pass123 and role receptionist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
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
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Recepcionista"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Recepcionista', 'receptionist', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Update existing user password
    UPDATE auth.users
    SET encrypted_password = crypt('Skip@Pass123', gen_salt('bf'))
    WHERE email = 'caadu1903@gmail.com';
  END IF;
END $$;

-- Ensure profile has correct role (idempotent)
UPDATE public.profiles
SET role = 'receptionist', full_name = COALESCE(full_name, 'Recepcionista'), is_active = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'caadu1903@gmail.com');
