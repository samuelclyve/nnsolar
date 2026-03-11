
-- Fix profiles RLS policies - change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles"
  ON public.profiles FOR SELECT
  TO public
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));
