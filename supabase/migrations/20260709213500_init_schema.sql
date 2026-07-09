DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
    CREATE TYPE user_role_enum AS ENUM ('owner', 'receptionist');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  role user_role_enum NOT NULL DEFAULT 'receptionist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  expected_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.task_completions;
CREATE POLICY "Enable read access for all users" ON public.task_completions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.task_completions;
CREATE POLICY "Enable insert for authenticated users" ON public.task_completions FOR INSERT TO authenticated WITH CHECK (true);

-- Seed tasks
INSERT INTO public.tasks (id, title, description, category, expected_time) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Ligar equipamentos', 'Luzes, som e catraca', 'Opening', '05:30:00'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Conferir caixa inicial', 'Verificar troco e fundo de caixa', 'Opening', '05:45:00'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'Limpar balcão', 'Organizar a recepção, tirar poeira', 'Shift', '14:00:00'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'Ligar o Ar Condicionado', 'Ajustar para 23 graus', 'Shift', '10:00:00'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'Fechar caixa', 'Lançar valores no sistema e conferir', 'Closing', '23:00:00'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'Desligar equipamentos', 'Som, luzes, computadores e ar', 'Closing', '23:30:00')
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Owner Seed
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
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin/Owner"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, 'Proprietário (Admin)', 'owner')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  -- Receptionist Seed
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'receptionist@example.com') THEN
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
      'receptionist@example.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Receptionist"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, 'Recepção (Turno Manhã)', 'receptionist')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
