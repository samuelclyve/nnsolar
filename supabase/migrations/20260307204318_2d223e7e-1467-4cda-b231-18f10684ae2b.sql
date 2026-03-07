
-- 1. Create workspaces table
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  owner_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'trial',
  trial_ends_at timestamp with time zone,
  subscription_status text NOT NULL DEFAULT 'trial',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create workspace_members table
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'monthly',
  amount numeric NOT NULL DEFAULT 179.90,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Add workspace_id to all existing data tables
ALTER TABLE public.leads ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.installations ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.installation_documents ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.installation_stages ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.client_installments ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.notification_logs ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.site_settings ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.hero_slides ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.testimonials ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 5. Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Helper function: get user's workspace ids
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = _user_id
$$;

-- 7. Helper function: check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- 8. Helper function: check workspace membership with specific role
CREATE OR REPLACE FUNCTION public.has_workspace_role(_user_id uuid, _workspace_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = _user_id AND workspace_id = _workspace_id AND role = _role
  )
$$;

-- 9. Helper: check if user belongs to workspace (any role)
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id uuid, _workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  )
$$;

-- 10. Function to create workspace on signup
CREATE OR REPLACE FUNCTION public.create_workspace_for_user(
  _user_id uuid,
  _workspace_name text,
  _workspace_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _workspace_id uuid;
BEGIN
  INSERT INTO public.workspaces (name, slug, owner_id, plan, trial_ends_at, subscription_status)
  VALUES (_workspace_name, _workspace_slug, _user_id, 'trial', now() + interval '14 days', 'trial')
  RETURNING id INTO _workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (_workspace_id, _user_id, 'admin');

  RETURN _workspace_id;
END;
$$;

-- 11. RLS for workspaces
CREATE POLICY "Members can view own workspace" ON public.workspaces
  FOR SELECT USING (
    id IN (SELECT get_user_workspace_ids(auth.uid()))
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Super admins can manage all workspaces" ON public.workspaces
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Owners can update own workspace" ON public.workspaces
  FOR UPDATE USING (owner_id = auth.uid());

-- 12. RLS for workspace_members
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Workspace admins can manage members" ON public.workspace_members
  FOR ALL USING (
    has_workspace_role(auth.uid(), workspace_id, 'admin')
    OR is_super_admin(auth.uid())
  );

-- 13. RLS for subscriptions
CREATE POLICY "Members can view workspace subscriptions" ON public.subscriptions
  FOR SELECT USING (
    workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Super admins can manage subscriptions" ON public.subscriptions
  FOR ALL USING (is_super_admin(auth.uid()));
