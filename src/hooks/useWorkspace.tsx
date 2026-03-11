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

  const fetchWorkspace = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoading(false);
      return;
    }

    // Get workspace membership
    const { data: members } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .limit(1);

    if (members && members.length > 0) {
      const { data: ws } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", members[0].workspace_id)
        .single();

      if (ws) {
        setWorkspace(ws as Workspace);
      }
    }
    setIsLoading(false);
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
