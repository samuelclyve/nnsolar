import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string;
  trial_ends_at: string | null;
  subscription_status: string;
  owner_id: string;
  created_at: string | null;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaceId: string | null;
  isLoading: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeft: number;
  refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaceId: null,
  isLoading: true,
  isTrial: false,
  isExpired: false,
  daysLeft: 0,
  refetch: async () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slugify = (value: string) => {
    const normalized = value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || "empresa";
  };

  const fetchWorkspace = async () => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setWorkspace(null);
        return;
      }

      const userId = session.user.id;

      // 1) Try membership first
      const { data: member } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      let resolvedWorkspaceId: string | null = member?.workspace_id ?? null;

      // 2) Fallback: user might be owner but missing membership row
      if (!resolvedWorkspaceId) {
        const { data: ownedWorkspace } = await supabase
          .from("workspaces")
          .select("id")
          .eq("owner_id", userId)
          .limit(1)
          .maybeSingle();

        if (ownedWorkspace?.id) {
          resolvedWorkspaceId = ownedWorkspace.id;
          await supabase.from("workspace_members").insert({
            workspace_id: ownedWorkspace.id,
            user_id: userId,
            role: "admin",
          } as any);
        }
      }

      // 3) Auto-heal: if no workspace exists, create one
      if (!resolvedWorkspaceId) {
        const fullName = (session.user.user_metadata?.full_name as string | undefined)?.trim();
        const emailPrefix = session.user.email?.split("@")[0]?.trim();
        const workspaceName = fullName || emailPrefix || "Minha Empresa";
        const workspaceSlug = `${slugify(workspaceName)}-${Math.random().toString(36).slice(2, 8)}`;

        const { data: createdWorkspaceId, error: createError } = await supabase.rpc("create_workspace_for_user", {
          _user_id: userId,
          _workspace_name: workspaceName,
          _workspace_slug: workspaceSlug,
        });

        if (!createError && createdWorkspaceId) {
          resolvedWorkspaceId = createdWorkspaceId as string;
        }
      }

      if (!resolvedWorkspaceId) {
        setWorkspace(null);
        return;
      }

      const { data: ws } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", resolvedWorkspaceId)
        .maybeSingle();

      setWorkspace((ws as Workspace) ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const isTrial = workspace?.subscription_status === "trial";
  const isExpired = (() => {
    if (!workspace) return false;
    if (workspace.subscription_status === "expired" || workspace.subscription_status === "cancelled") return true;
    if (isTrial && workspace.trial_ends_at) {
      return new Date(workspace.trial_ends_at) < new Date();
    }
    return false;
  })();

  const daysLeft = (() => {
    if (!workspace?.trial_ends_at || !isTrial) return 0;
    const diff = new Date(workspace.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  return (
    <WorkspaceContext.Provider value={{
      workspace,
      workspaceId: workspace?.id || null,
      isLoading,
      isTrial,
      isExpired,
      daysLeft,
      refetch: fetchWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => useContext(WorkspaceContext);
