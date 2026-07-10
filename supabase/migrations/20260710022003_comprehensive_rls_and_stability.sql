-- =====================================================
-- Comprehensive RLS policies, trigger, and seed user
-- Ensures all tables have proper RLS for authenticated users
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_handover_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- profiles: SELECT all, INSERT/UPDATE/DELETE owners
-- =====================================================
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

-- =====================================================
-- tasks: SELECT all, INSERT/UPDATE/DELETE owners
-- =====================================================
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

-- =====================================================
-- task_categories: SELECT all, INSERT/UPDATE/DELETE owners
-- =====================================================
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

-- =====================================================
-- task_completions: SELECT all, INSERT all, UPDATE all, DELETE owners
-- =====================================================
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

-- =====================================================
-- task_exceptions: SELECT all, INSERT all, DELETE owners
-- =====================================================
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

-- =====================================================
-- shift_handover_notes: SELECT all, INSERT all, DELETE owners
-- =====================================================
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

-- =====================================================
-- maintenance_tickets: SELECT all, INSERT all, UPDATE all, DELETE all
-- =====================================================
DROP POLICY IF EXISTS "mt_select" ON public.maintenance_tickets;
CREATE POLICY "mt_select" ON public.maintenance_tickets
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "mt_insert" ON public.maintenance_tickets;
CREATE POLICY "mt_insert" ON public.maintenance_tickets
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "mt_update" ON public.maintenance_tickets;
CREATE POLICY "mt_update" ON public.maintenance_tickets
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "mt_delete" ON public.maintenance_tickets;
CREATE POLICY "mt_delete" ON public.maintenance_tickets
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- shopping_list: SELECT all, INSERT all, UPDATE all, DELETE all
-- =====================================================
DROP POLICY IF EXISTS "sl_select" ON public.shopping_list;
CREATE POLICY "sl_select" ON public.shopping_list
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sl_insert" ON public.shopping_list;
CREATE POLICY "sl_insert" ON public.shopping_list
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sl_update" ON public.shopping_list;
CREATE POLICY "sl_update" ON public.shopping_list
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sl_delete" ON public.shopping_list;
CREATE POLICY "sl_delete" ON public.shopping_list
  FOR DELETE TO authenticated USING (true);

-- =====================================================
-- stock_items: SELECT all, INSERT/UPDATE/DELETE owners
-- =====================================================
DROP POLICY IF EXISTS "stock_select" ON public.stock_items;
CREATE POLICY "stock_select" ON public.stock_items
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "stock_insert" ON public.stock_items;
CREATE POLICY "stock_insert" ON public.stock_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "stock_update" ON public.stock_items;
CREATE POLICY "stock_update" ON public.stock_items
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "stock_delete" ON public.stock_items;
CREATE POLICY "stock_delete" ON public.stock_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- chat_messages: SELECT all, INSERT all, UPDATE/DELETE own
-- =====================================================
DROP POLICY IF EXISTS "cm_select" ON public.chat_messages;
CREATE POLICY "cm_select" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cm_insert" ON public.chat_messages;
CREATE POLICY "cm_insert" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "cm_update" ON public.chat_messages;
CREATE POLICY "cm_update" ON public.chat_messages
  FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "cm_delete" ON public.chat_messages;
CREATE POLICY "cm_delete" ON public.chat_messages
  FOR DELETE TO authenticated USING (
    sender_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- notifications: SELECT/UPDATE own, INSERT all, DELETE own
-- =====================================================
DROP POLICY IF EXISTS "ntf_select" ON public.notifications;
CREATE POLICY "ntf_select" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ntf_insert" ON public.notifications;
CREATE POLICY "ntf_insert" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ntf_update" ON public.notifications;
CREATE POLICY "ntf_update" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ntf_delete" ON public.notifications;
CREATE POLICY "ntf_delete" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =====================================================
-- gym_settings: SELECT all, INSERT/UPDATE/DELETE owners
-- =====================================================
DROP POLICY IF EXISTS "gs_select" ON public.gym_settings;
CREATE POLICY "gs_select" ON public.gym_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "gs_insert" ON public.gym_settings;
CREATE POLICY "gs_insert" ON public.gym_settings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "gs_update" ON public.gym_settings;
CREATE POLICY "gs_update" ON public.gym_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "gs_delete" ON public.gym_settings;
CREATE POLICY "gs_delete" ON public.gym_settings
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- =====================================================
-- Auto-profile trigger (idempotent)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'receptionist'::user_role_enum,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Seed user: caadu1903@gmail.com / Skip@Pass (idempotent)
-- =====================================================
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
SELECT id, 'Proprietário (Admin)', 'owner'::user_role_enum, true
FROM auth.users
WHERE email = 'caadu1903@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'owner'::user_role_enum,
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
