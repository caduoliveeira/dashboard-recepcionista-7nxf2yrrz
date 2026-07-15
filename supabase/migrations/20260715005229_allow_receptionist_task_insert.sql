-- Update RLS policies for tasks table to allow receptionists to INSERT
-- SELECT already granted to all authenticated users
-- INSERT was owner-only; now also allows receptionist role

-- Drop existing INSERT policy (was owner-only)
DROP POLICY IF EXISTS "Enable insert for owners" ON public.tasks;

-- Recreate INSERT policy allowing both owner and receptionist roles
CREATE POLICY "Enable insert for owners and receptionists" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'receptionist')
    )
  );

-- Ensure SELECT is available to all authenticated users (idempotent)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tasks;
CREATE POLICY "Enable read access for all users" ON public.tasks
  FOR SELECT TO authenticated USING (true);
