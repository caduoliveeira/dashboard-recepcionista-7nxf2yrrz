CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_completion_rate INTEGER NOT NULL DEFAULT 90,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable select for authenticated" ON public.gym_settings;
CREATE POLICY "Enable select for authenticated" ON public.gym_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for owners" ON public.gym_settings;
CREATE POLICY "Enable update for owners" ON public.gym_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "Enable insert for owners" ON public.gym_settings;
CREATE POLICY "Enable insert for owners" ON public.gym_settings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

INSERT INTO public.gym_settings (id, target_completion_rate)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 90)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_gym_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "gym_settings_updated_at" ON public.gym_settings;
CREATE TRIGGER "gym_settings_updated_at"
  BEFORE UPDATE ON public.gym_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_gym_settings_updated_at();
