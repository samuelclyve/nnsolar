import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Users, DollarSign, TrendingUp, Clock, 
  CheckCircle2, XCircle, MoreHorizontal, Search, Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  owner_id: string;
}

export default function SuperAdmin() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isSuperAdmin, isLoading: rolesLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!rolesLoading && !isSuperAdmin()) {
      navigate("/dashboard");
    }
  }, [rolesLoading, isSuperAdmin, navigate]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    const { data, error } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false });
    if (data) setWorkspaces(data as WorkspaceRow[]);
    setIsLoading(false);
  };

  const updateWorkspaceStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("workspaces").update({ subscription_status: status }).eq("id", id);
    if (!error) {
      toast({ title: "Status atualizado", description: `Workspace atualizado para ${status}` });
      fetchWorkspaces();
    }
  };

  const extendTrial = async (id: string) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 14);
    const { error } = await supabase.from("workspaces").update({ trial_ends_at: newDate.toISOString() }).eq("id", id);
    if (!error) {
      toast({ title: "Trial estendido", description: "+14 dias adicionados" });
      fetchWorkspaces();
    }
  };

  const filtered = workspaces.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActive = workspaces.filter(w => w.subscription_status === "active").length;
  const totalTrial = workspaces.filter(w => w.subscription_status === "trial").length;
  const mrr = workspaces.filter(w => w.subscription_status === "active").length * 179.90;

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      trial: "bg-accent/20 text-accent-foreground border-accent/30",
      active: "bg-success/20 text-success border-success/30",
      expired: "bg-destructive/20 text-destructive border-destructive/30",
      cancelled: "bg-muted text-muted-foreground border-border",
    };
    const labels: Record<string, string> = {
      trial: "Trial", active: "Ativo", expired: "Expirado", cancelled: "Cancelado"
    };
    return <Badge variant="outline" className={variants[status] || ""}>{labels[status] || status}</Badge>;
  };

  if (rolesLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Solarize</span>
            <Badge variant="outline" className="text-xs">Super Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Ir ao Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Painel Super Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Workspaces", value: workspaces.length, icon: Building2 },
            { label: "Ativos", value: totalActive, icon: CheckCircle2 },
            { label: "Em Trial", value: totalTrial, icon: Clock },
            { label: "MRR", value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search + Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Workspaces</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Slug</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plano</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Criado em</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ws => (
                    <tr key={ws.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium text-foreground">{ws.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{ws.slug}</td>
                      <td className="py-3 px-4">{statusBadge(ws.subscription_status)}</td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">{ws.plan}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(ws.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateWorkspaceStatus(ws.id, "active")}>
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Ativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => extendTrial(ws.id)}>
                              <Clock className="w-4 h-4 mr-2" /> Estender trial (+14d)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateWorkspaceStatus(ws.id, "expired")} className="text-destructive">
                              <XCircle className="w-4 h-4 mr-2" /> Desativar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum workspace encontrado</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
