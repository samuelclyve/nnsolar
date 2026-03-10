-- Allow public to view workspaces by slug (for tenant public sites)
-- Drop old restrictive policy first
DROP POLICY IF EXISTS "Members can view own workspace" ON public.workspaces;

-- Create a public read policy (workspace basic info is not sensitive)
CREATE POLICY "Anyone can view workspaces"
ON public.workspaces
FOR SELECT
TO public
USING (true);