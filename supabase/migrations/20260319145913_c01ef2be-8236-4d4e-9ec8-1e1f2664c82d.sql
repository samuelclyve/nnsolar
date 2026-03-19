
-- Table to store SolisCloud API credentials per workspace
CREATE TABLE public.solis_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  api_id TEXT NOT NULL,
  api_secret TEXT NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://www.soliscloud.com:13333',
  station_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

ALTER TABLE public.solis_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view solis credentials"
ON public.solis_credentials FOR SELECT
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace admins can manage solis credentials"
ON public.solis_credentials FOR ALL
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()))
WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

-- Table to cache inverter data snapshots
CREATE TABLE public.solis_inverters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  inverter_id TEXT NOT NULL,
  inverter_sn TEXT NOT NULL,
  station_id TEXT,
  station_name TEXT,
  inverter_model TEXT,
  last_data JSONB,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, inverter_sn)
);

ALTER TABLE public.solis_inverters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view solis inverters"
ON public.solis_inverters FOR SELECT
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace admins can manage solis inverters"
ON public.solis_inverters FOR ALL
USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()))
WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_solis_credentials_updated_at
BEFORE UPDATE ON public.solis_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solis_inverters_updated_at
BEFORE UPDATE ON public.solis_inverters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
