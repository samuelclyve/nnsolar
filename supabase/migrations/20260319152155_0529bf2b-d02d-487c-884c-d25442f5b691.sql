
-- Huawei FusionSolar credentials
CREATE TABLE public.huawei_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://intl.fusionsolar.huawei.com/thirdData',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

ALTER TABLE public.huawei_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage huawei credentials" ON public.huawei_credentials
  FOR ALL USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()))
  WITH CHECK ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace members can view huawei credentials" ON public.huawei_credentials
  FOR SELECT USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_huawei_credentials_updated_at
  BEFORE UPDATE ON public.huawei_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Huawei inverters
CREATE TABLE public.huawei_inverters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_sn TEXT NOT NULL,
  station_code TEXT,
  station_name TEXT,
  device_model TEXT,
  device_type TEXT DEFAULT 'inverter',
  last_data JSONB,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, device_sn)
);

ALTER TABLE public.huawei_inverters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage huawei inverters" ON public.huawei_inverters
  FOR ALL USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()))
  WITH CHECK ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace members can view huawei inverters" ON public.huawei_inverters
  FOR SELECT USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_huawei_inverters_updated_at
  BEFORE UPDATE ON public.huawei_inverters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fronius credentials
CREATE TABLE public.fronius_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  api_url TEXT NOT NULL DEFAULT 'https://api.solarweb.com/swqapi',
  access_key_id TEXT,
  access_key_value TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

ALTER TABLE public.fronius_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage fronius credentials" ON public.fronius_credentials
  FOR ALL USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()))
  WITH CHECK ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace members can view fronius credentials" ON public.fronius_credentials
  FOR SELECT USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_fronius_credentials_updated_at
  BEFORE UPDATE ON public.fronius_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fronius inverters
CREATE TABLE public.fronius_inverters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_sn TEXT NOT NULL,
  system_id TEXT,
  system_name TEXT,
  device_model TEXT,
  device_type TEXT DEFAULT 'inverter',
  last_data JSONB,
  last_synced_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, device_sn)
);

ALTER TABLE public.fronius_inverters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage fronius inverters" ON public.fronius_inverters
  FOR ALL USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()))
  WITH CHECK ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace members can view fronius inverters" ON public.fronius_inverters
  FOR SELECT USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_fronius_inverters_updated_at
  BEFORE UPDATE ON public.fronius_inverters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inverter alerts table
CREATE TABLE public.inverter_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  device_sn TEXT NOT NULL,
  system_type TEXT NOT NULL, -- solis, growatt, huawei, fronius
  alert_type TEXT NOT NULL, -- offline, error, warning, low_production
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT NOT NULL DEFAULT 'warning', -- info, warning, critical
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.inverter_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view alerts" ON public.inverter_alerts
  FOR SELECT USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE POLICY "Workspace admins can manage alerts" ON public.inverter_alerts
  FOR ALL USING ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()))
  WITH CHECK ((workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))) OR is_super_admin(auth.uid()));

CREATE INDEX idx_inverter_alerts_workspace ON public.inverter_alerts(workspace_id, is_resolved, created_at DESC);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.inverter_alerts;
