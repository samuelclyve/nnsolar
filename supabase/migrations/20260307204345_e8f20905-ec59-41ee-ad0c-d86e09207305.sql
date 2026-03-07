
-- Drop old permissive policies and replace with workspace-aware ones

-- LEADS: drop old, create new
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;

CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Workspace members can view leads" ON public.leads FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);
CREATE POLICY "Workspace members can update leads" ON public.leads FOR UPDATE USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);
CREATE POLICY "Workspace members can delete leads" ON public.leads FOR DELETE USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- INSTALLATIONS
DROP POLICY IF EXISTS "Admins and managers can manage installations" ON public.installations;
DROP POLICY IF EXISTS "Clients can view their own installations" ON public.installations;
DROP POLICY IF EXISTS "Technicians can update assigned installations" ON public.installations;

CREATE POLICY "Workspace members can manage installations" ON public.installations FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- CLIENTS
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Staff can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Staff can view all clients" ON public.clients;

CREATE POLICY "Workspace members can manage clients" ON public.clients FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- DOCUMENTS
DROP POLICY IF EXISTS "Staff can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can view all documents" ON public.documents;

CREATE POLICY "Workspace members can manage documents" ON public.documents FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- INSTALLATION_DOCUMENTS
DROP POLICY IF EXISTS "Staff can manage documents" ON public.installation_documents;
DROP POLICY IF EXISTS "Users can view documents" ON public.installation_documents;

CREATE POLICY "Workspace members can manage installation docs" ON public.installation_documents FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- INSTALLATION_STAGES
DROP POLICY IF EXISTS "Staff can manage stages" ON public.installation_stages;
DROP POLICY IF EXISTS "Users can view stages" ON public.installation_stages;

CREATE POLICY "Workspace members can manage stages" ON public.installation_stages FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- CLIENT_INSTALLMENTS
DROP POLICY IF EXISTS "Admins can manage installments" ON public.client_installments;
DROP POLICY IF EXISTS "Users can view installments" ON public.client_installments;

CREATE POLICY "Workspace members can manage installments" ON public.client_installments FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- NOTIFICATION_LOGS
DROP POLICY IF EXISTS "Staff can create notification logs" ON public.notification_logs;
DROP POLICY IF EXISTS "Staff can view notification logs" ON public.notification_logs;

CREATE POLICY "Workspace members can manage notification logs" ON public.notification_logs FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- SITE_SETTINGS
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can manage site settings" ON public.site_settings;

CREATE POLICY "Public can view site settings by workspace" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Workspace admins can manage site settings" ON public.site_settings FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- HERO_SLIDES
DROP POLICY IF EXISTS "Anyone can view active hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Authenticated can manage hero slides" ON public.hero_slides;

CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Workspace admins can manage hero slides" ON public.hero_slides FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- TESTIMONIALS
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated can manage testimonials" ON public.testimonials;

CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Workspace admins can manage testimonials" ON public.testimonials FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- PROFILES: keep existing policies, add super_admin view
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id OR is_super_admin(auth.uid())
);

-- USER_ROLES: add super_admin access
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workspace admins can manage roles" ON public.user_roles FOR ALL USING (
  has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid())
);
