
-- Growatt credentials table
CREATE TABLE public.growatt_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  api_token text NOT NULL,
  api_url text NOT NULL DEFAULT 'https://openapi.growatt.com/',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

ALTER TABLE public.growatt_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view growatt credentials"
  ON public.growatt_credentials FOR SELECT
  USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace admins can manage growatt credentials"
  ON public.growatt_credentials FOR ALL
  USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

-- Growatt inverters table
CREATE TABLE public.growatt_inverters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  device_sn text NOT NULL,
  device_type text DEFAULT 'inverter',
  plant_id text,
  plant_name text,
  device_model text,
  last_data jsonb,
  last_synced_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, device_sn)
);

ALTER TABLE public.growatt_inverters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view growatt inverters"
  ON public.growatt_inverters FOR SELECT
  USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace admins can manage growatt inverters"
  ON public.growatt_inverters FOR ALL
  USING (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()))
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_growatt_credentials_updated_at
  BEFORE UPDATE ON public.growatt_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_growatt_inverters_updated_at
  BEFORE UPDATE ON public.growatt_inverters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
