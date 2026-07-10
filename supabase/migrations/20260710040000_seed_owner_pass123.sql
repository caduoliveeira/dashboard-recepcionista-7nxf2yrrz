DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if the user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'caadu1903@gmail.com') THEN
    new_user_id := gen_random_uuid();
    -- Insert into auth.users ensuring tokens are empty strings as required by GoTrue
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
      '{"name": "Admin/Owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    -- Insert into public.profiles with the owner role
    INSERT INTO public.profiles (id, full_name, role, is_active)
    VALUES (new_user_id, 'Proprietário (Admin)', 'owner', true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- If user already exists, strictly enforce the new Skip@Pass123 password
    UPDATE auth.users
    SET encrypted_password = crypt('Skip@Pass123', gen_salt('bf'))
    WHERE email = 'caadu1903@gmail.com';

    -- Ensure the profile has owner role and is active
    INSERT INTO public.profiles (id, full_name, role, is_active)
    SELECT id, 'Proprietário (Admin)', 'owner', true
    FROM auth.users
    WHERE email = 'caadu1903@gmail.com'
    ON CONFLICT (id) DO UPDATE SET
      role = 'owner',
      is_active = true;
  END IF;
END $$;
