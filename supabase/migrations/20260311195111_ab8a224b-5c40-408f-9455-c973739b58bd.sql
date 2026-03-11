
-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id),
  message TEXT NOT NULL,
  sender TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can insert their own tickets
CREATE POLICY "Users can insert own tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view own tickets
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- Super admins can manage all tickets
CREATE POLICY "Super admins can manage all tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Fix site_settings unique constraint for proper upsert per workspace
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_workspace_key_unique 
  ON public.site_settings (workspace_id, setting_key);
