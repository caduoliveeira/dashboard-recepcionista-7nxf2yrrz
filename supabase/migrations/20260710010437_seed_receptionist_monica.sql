-- Seed receptionist user: monicapedroso80@gmail.com
-- Password: moni12345
-- Role: receptionist

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed receptionist account (idempotent: skip if email already exists)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'monicapedroso80@gmail.com') THEN
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
      'monicapedroso80@gmail.com',
      crypt('moni12345', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Mônica Pedroso"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Mônica Pedroso', 'receptionist', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Ensure receptionist profile has correct role/is_active (idempotent)
INSERT INTO public.profiles (id, full_name, role, is_active)
SELECT id, 'Mônica Pedroso', 'receptionist', true
FROM auth.users
WHERE email = 'monicapedroso80@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Mônica Pedroso',
  role = 'receptionist',
  is_active = true;
