CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cm_select" ON public.chat_messages;
CREATE POLICY "cm_select" ON public.chat_messages
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cm_insert" ON public.chat_messages;
CREATE POLICY "cm_insert" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (true);
