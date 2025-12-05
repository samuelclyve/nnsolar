import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "manager" | "comercial" | "technician" | "client";

export function useUserRole() {
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (data) {
        setRoles(data.map(r => r.role));
      }
      setIsLoading(false);
    };

    fetchRoles();
  }, []);

  const hasRole = (role: UserRole | UserRole[]) => {
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r));
    }
    return roles.includes(role);
  };

  const isAdmin = () => hasRole("admin");
  const isManager = () => hasRole(["admin", "manager"]);
  const isComercial = () => hasRole(["admin", "manager", "comercial"]);
  const isTechnician = () => hasRole(["admin", "manager", "technician"]);
  const isClient = () => hasRole("client") || roles.length === 0;

  return {
    roles,
    isLoading,
    userId,
    hasRole,
    isAdmin,
    isManager,
    isComercial,
    isTechnician,
    isClient,
  };
}
