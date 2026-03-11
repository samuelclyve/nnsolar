import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Search, Shield, UserPlus, Mail, Phone,
  Check, X, MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const roleConfig: Record<string, { label: string; color: string; description: string }> = {
  admin: { 
    label: "Administrador", 
    color: "bg-red-500 text-card", 
    description: "Acesso total ao sistema" 
  },
  manager: { 
    label: "Gestor", 
    color: "bg-purple-500 text-card", 
    description: "Gerencia equipe e operações" 
  },
  comercial: { 
    label: "Comercial", 
    color: "bg-blue-500 text-card", 
    description: "Acesso ao CRM e leads" 
  },
  technician: { 
    label: "Técnico", 
    color: "bg-green-500 text-card", 
    description: "Acesso às instalações" 
  },
  client: { 
    label: "Cliente", 
    color: "bg-gray-500 text-card", 
    description: "Acesso ao portal do cliente" 
  },
};

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ title: "Erro ao carregar usuários", variant: "destructive" });
      return;
    }

    setProfiles(profilesData || []);

    // Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    } else {
      const rolesMap: Record<string, string[]> = {};
      (rolesData || []).forEach((ur: UserRole) => {
        if (!rolesMap[ur.user_id]) {
          rolesMap[ur.user_id] = [];
        }
        rolesMap[ur.user_id].push(ur.role);
      });
      setUserRoles(rolesMap);
    }

    setIsLoading(false);
  };

  const addRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Usuário já possui essa role", variant: "destructive" });
      } else {
        toast({ title: "Erro ao adicionar role", variant: "destructive" });
      }
      return;
    }

    toast({ title: `Role ${roleConfig[role]?.label} adicionada!` });
    fetchData();
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast({ title: "Erro ao remover role", variant: "destructive" });
      return;
    }

    toast({ title: `Role ${roleConfig[role]?.label} removida!` });
    fetchData();
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = 
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm) ||
      profile.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter === "all") return matchesSearch;
    
    const roles = userRoles[profile.user_id] || [];
    return matchesSearch && roles.includes(roleFilter);
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(roleConfig).map(([key, value]) => {
            const count = Object.values(userRoles).filter(roles => roles.includes(key)).length;
            return (
              <div key={key} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${value.color.split(' ')[0]}`} />
                  <span className="text-sm font-medium text-foreground">{value.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Shield className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              {Object.entries(roleConfig).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Usuário</th>
                  <th className="text-left p-4 font-medium text-foreground">Contato</th>
                  <th className="text-left p-4 font-medium text-foreground">Cidade</th>
                  <th className="text-left p-4 font-medium text-foreground">Roles</th>
                  <th className="text-left p-4 font-medium text-foreground">Cadastro</th>
                  <th className="text-right p-4 font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const roles = userRoles[profile.user_id] || [];
                  
                  return (
                    <tr key={profile.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-solar-blue-light flex items-center justify-center text-primary-foreground font-bold">
                            {profile.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{profile.full_name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">ID: {profile.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {profile.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {profile.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {profile.city || "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? roles.map((role) => (
                            <Badge 
                              key={role} 
                              className={`${roleConfig[role]?.color} text-xs`}
                            >
                              {roleConfig[role]?.label}
                            </Badge>
                          )) : (
                            <span className="text-xs text-muted-foreground">Sem roles</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {Object.entries(roleConfig).map(([key, value]) => {
                              const hasRole = roles.includes(key);
                              return (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => hasRole ? removeRole(profile.user_id, key) : addRole(profile.user_id, key)}
                                  className="flex items-center gap-2"
                                >
                                  {hasRole ? (
                                    <X className="w-4 h-4 text-destructive" />
                                  ) : (
                                    <Check className="w-4 h-4 text-success" />
                                  )}
                                  {hasRole ? "Remover" : "Adicionar"} {value.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProfiles.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground">Ajuste os filtros ou aguarde novos cadastros.</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Legend */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Legenda de Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(roleConfig).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3">
                <Badge className={`${value.color} shrink-0`}>{value.label}</Badge>
                <p className="text-xs text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}