
CREATE TABLE public.portfolio_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'case',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active portfolio images"
ON public.portfolio_images
FOR SELECT
USING (is_active = true);

CREATE POLICY "Workspace admins can manage portfolio images"
ON public.portfolio_images
FOR ALL
USING (
  (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (workspace_id IN (SELECT get_user_workspace_ids(auth.uid())))
  OR is_super_admin(auth.uid())
);

CREATE INDEX idx_portfolio_images_workspace ON public.portfolio_images(workspace_id);
CREATE INDEX idx_portfolio_images_category ON public.portfolio_images(category);
