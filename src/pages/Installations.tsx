import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Search, Zap, Calendar, MapPin, 
  CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";

interface Installation {
  id: string;
  client_name: string;
  client_phone: string | null;
  address: string | null;
  city: string | null;
  power_kwp: number | null;
  panel_count: number | null;
  status: string;
  estimated_start: string | null;
  estimated_end: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  project: { label: "Projeto", color: "bg-blue-500", icon: Clock },
  approval: { label: "Aprovação", color: "bg-yellow-500", icon: AlertCircle },
  installation: { label: "Instalação", color: "bg-purple-500", icon: Zap },
  inspection: { label: "Vistoria", color: "bg-orange-500", icon: AlertCircle },
  active: { label: "Sistema Ativo", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-500", icon: AlertCircle },
};

export default function Installations() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInstallation, setNewInstallation] = useState({
    client_name: "",
    client_phone: "",
    address: "",
    city: "",
    power_kwp: "",
    panel_count: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInstallations();
  }, []);

  const fetchInstallations = async () => {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar instalações", variant: "destructive" });
      return;
    }

    setInstallations(data || []);
    setIsLoading(false);
  };

  const createInstallation = async () => {
    if (!newInstallation.client_name) {
      toast({ title: "Preencha o nome do cliente", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("installations").insert({
      client_name: newInstallation.client_name,
      client_phone: newInstallation.client_phone || null,
      address: newInstallation.address || null,
      city: newInstallation.city || null,
      power_kwp: newInstallation.power_kwp ? parseFloat(newInstallation.power_kwp) : null,
      panel_count: newInstallation.panel_count ? parseInt(newInstallation.panel_count) : null,
    });

    if (error) {
      toast({ title: "Erro ao criar instalação", variant: "destructive" });
      return;
    }

    toast({ title: "Instalação criada com sucesso!" });
    setNewInstallation({ client_name: "", client_phone: "", address: "", city: "", power_kwp: "", panel_count: "" });
    setIsDialogOpen(false);
    fetchInstallations();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("installations")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
      return;
    }

    toast({ title: "Status atualizado!" });
    fetchInstallations();
  };

  const filteredInstallations = installations.filter((inst) => {
    const matchesSearch = inst.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout title="Instalações">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(statusConfig).map(([key, value]) => (
              <SelectItem key={key} value={key}>{value.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="cta">
              <Plus className="w-4 h-4" />
              Nova Instalação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Instalação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={newInstallation.client_name}
                  onChange={(e) => setNewInstallation({ ...newInstallation, client_name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={newInstallation.client_phone}
                  onChange={(e) => setNewInstallation({ ...newInstallation, client_phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input
                  value={newInstallation.address}
                  onChange={(e) => setNewInstallation({ ...newInstallation, address: e.target.value })}
                  placeholder="Rua, número"
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={newInstallation.city}
                  onChange={(e) => setNewInstallation({ ...newInstallation, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Potência (kWp)</Label>
                  <Input
                    type="number"
                    value={newInstallation.power_kwp}
                    onChange={(e) => setNewInstallation({ ...newInstallation, power_kwp: e.target.value })}
                    placeholder="Ex: 7.2"
                  />
                </div>
                <div>
                  <Label>Nº de Painéis</Label>
                  <Input
                    type="number"
                    value={newInstallation.panel_count}
                    onChange={(e) => setNewInstallation({ ...newInstallation, panel_count: e.target.value })}
                    placeholder="Ex: 12"
                  />
                </div>
              </div>
              <Button variant="cta" className="w-full" onClick={createInstallation}>
                Criar Instalação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredInstallations.map((inst) => {
          const status = statusConfig[inst.status] || statusConfig.project;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{inst.client_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {inst.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {inst.city}
                      </div>
                    )}
                    {inst.power_kwp && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {inst.power_kwp} kWp
                      </div>
                    )}
                    {inst.panel_count && (
                      <div className="flex items-center gap-1">
                        {inst.panel_count} painéis
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(inst.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={inst.status}
                    onValueChange={(value) => updateStatus(inst.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <StatusIcon className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${value.color}`} />
                            {value.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timeline Progress */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  {Object.entries(statusConfig).slice(0, 5).map(([key, value], index) => {
                    const statusOrder = Object.keys(statusConfig).indexOf(inst.status);
                    const isCompleted = index <= statusOrder;
                    const isCurrent = key === inst.status;

                    return (
                      <div key={key} className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-full h-1 rounded ${isCompleted ? value.color : "bg-muted"}`} />
                        </div>
                        <p className={`text-xs mt-1 ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {value.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredInstallations.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma instalação encontrada</h3>
            <p className="text-muted-foreground">Crie uma nova instalação para começar.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
