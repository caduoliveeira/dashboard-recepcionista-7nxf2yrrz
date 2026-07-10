-- Force password to Skip@Pass to comply with acceptance criteria
DO $$
BEGIN
  UPDATE auth.users
  SET encrypted_password = crypt('Skip@Pass', gen_salt('bf'))
  WHERE email = 'caadu1903@gmail.com';

  -- Ensure profile exists with owner role
  INSERT INTO public.profiles (id, full_name, role, is_active)
  SELECT id, 'Proprietário (Admin)', 'owner', true
  FROM auth.users
  WHERE email = 'caadu1903@gmail.com'
  ON CONFLICT (id) DO UPDATE SET
    role = 'owner',
    is_active = true;
END $$;
