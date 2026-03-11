
-- =============================================
-- FIX ALL RLS POLICIES: RESTRICTIVE -> PERMISSIVE
-- =============================================

-- ===== WORKSPACES =====
DROP POLICY IF EXISTS "Anyone can view workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can update own workspace" ON public.workspaces;
DROP POLICY IF EXISTS "Super admins can manage all workspaces" ON public.workspaces;

CREATE POLICY "Anyone can view workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Owners can update own workspace" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Super admins can manage all workspaces" ON public.workspaces FOR ALL USING (is_super_admin(auth.uid()));

-- ===== WORKSPACE_MEMBERS =====
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON public.workspace_members;

CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);
CREATE POLICY "Workspace admins can manage members" ON public.workspace_members FOR ALL USING (
  has_workspace_role(auth.uid(), workspace_id, 'admin') OR is_super_admin(auth.uid())
);

-- ===== PROFILES =====
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (
  auth.uid() = user_id OR is_super_admin(auth.uid())
);

-- ===== USER_ROLES =====
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Workspace admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
CREATE POLICY "Workspace admins can manage roles" ON public.user_roles FOR ALL USING (
  has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid())
);

-- ===== LEADS =====
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can view leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can update leads" ON public.leads;
DROP POLICY IF EXISTS "Workspace members can delete leads" ON public.leads;

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

-- ===== CLIENTS =====
DROP POLICY IF EXISTS "Workspace members can manage clients" ON public.clients;
CREATE POLICY "Workspace members can manage clients" ON public.clients FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== INSTALLATIONS =====
DROP POLICY IF EXISTS "Workspace members can manage installations" ON public.installations;
CREATE POLICY "Workspace members can manage installations" ON public.installations FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== CLIENT_INSTALLMENTS =====
DROP POLICY IF EXISTS "Workspace members can manage installments" ON public.client_installments;
CREATE POLICY "Workspace members can manage installments" ON public.client_installments FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== INSTALLATION_STAGES =====
DROP POLICY IF EXISTS "Workspace members can manage stages" ON public.installation_stages;
CREATE POLICY "Workspace members can manage stages" ON public.installation_stages FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== INSTALLATION_DOCUMENTS =====
DROP POLICY IF EXISTS "Workspace members can manage installation docs" ON public.installation_documents;
CREATE POLICY "Workspace members can manage installation docs" ON public.installation_documents FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== DOCUMENTS =====
DROP POLICY IF EXISTS "Workspace members can manage documents" ON public.documents;
CREATE POLICY "Workspace members can manage documents" ON public.documents FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== NOTIFICATION_LOGS =====
DROP POLICY IF EXISTS "Workspace members can manage notification logs" ON public.notification_logs;
CREATE POLICY "Workspace members can manage notification logs" ON public.notification_logs FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== SITE_SETTINGS =====
DROP POLICY IF EXISTS "Public can view site settings by workspace" ON public.site_settings;
DROP POLICY IF EXISTS "Workspace admins can manage site settings" ON public.site_settings;

CREATE POLICY "Public can view site settings by workspace" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Workspace admins can manage site settings" ON public.site_settings FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== HERO_SLIDES =====
DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Workspace admins can manage hero slides" ON public.hero_slides;

CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Workspace admins can manage hero slides" ON public.hero_slides FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== TESTIMONIALS =====
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Workspace admins can manage testimonials" ON public.testimonials;

CREATE POLICY "Public can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Workspace admins can manage testimonials" ON public.testimonials FOR ALL USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
) WITH CHECK (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);

-- ===== SUPPORT_TICKETS =====
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Super admins can manage all tickets" ON public.support_tickets;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR is_super_admin(auth.uid())
);
CREATE POLICY "Users can insert own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can manage all tickets" ON public.support_tickets FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

-- ===== SUBSCRIPTIONS =====
DROP POLICY IF EXISTS "Members can view workspace subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Super admins can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Members can view workspace subscriptions" ON public.subscriptions FOR SELECT USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);
CREATE POLICY "Super admins can manage subscriptions" ON public.subscriptions FOR ALL USING (is_super_admin(auth.uid()));

-- ===== PAYMENT_HISTORY =====
DROP POLICY IF EXISTS "Members can view workspace payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Super admins can manage payment history" ON public.payment_history;

CREATE POLICY "Members can view workspace payment history" ON public.payment_history FOR SELECT TO authenticated USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid())) OR is_super_admin(auth.uid())
);
CREATE POLICY "Super admins can manage payment history" ON public.payment_history FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

-- ===== BLOG_POSTS =====
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Super admins can manage blog posts" ON public.blog_posts;

CREATE POLICY "Public can view published blog posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Super admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (is_super_admin(auth.uid()));

-- ===== DOWNLOAD_MATERIALS =====
DROP POLICY IF EXISTS "Public can view published materials" ON public.download_materials;
DROP POLICY IF EXISTS "Super admins can manage materials" ON public.download_materials;

CREATE POLICY "Public can view published materials" ON public.download_materials FOR SELECT USING (is_published = true);
CREATE POLICY "Super admins can manage materials" ON public.download_materials FOR ALL TO authenticated USING (is_super_admin(auth.uid()));
