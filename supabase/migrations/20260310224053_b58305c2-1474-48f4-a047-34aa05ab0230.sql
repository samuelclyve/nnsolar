CREATE OR REPLACE FUNCTION public.create_workspace_for_user(_user_id uuid, _workspace_name text, _workspace_slug text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _workspace_id uuid;
BEGIN
  INSERT INTO public.workspaces (name, slug, owner_id, plan, trial_ends_at, subscription_status)
  VALUES (_workspace_name, _workspace_slug, _user_id, 'trial', now() + interval '14 days', 'trial')
  RETURNING id INTO _workspace_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (_workspace_id, _user_id, 'admin');

  -- Assign admin role to the user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN _workspace_id;
END;
$$;