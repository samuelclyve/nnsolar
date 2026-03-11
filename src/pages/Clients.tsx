import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, User, Phone, Mail, MapPin, Edit, Trash2, 
  Wrench, FileText, ChevronDown, ChevronUp, CheckCircle2, Circle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  cpf: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface ClientInstallation {
  id: string;
  status: string;
  power_kwp: number | null;
  panel_count: number | null;
  address: string | null;
  created_at: string;
}

interface ClientDocument {
  id: string;
  name: string;
  category: string;
  file_url: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  project: "Projeto",
  approval: "Aprovação",
  installation: "Instalação",
  inspection: "Vistoria",
  active: "Sistema Ativo",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  project: "bg-blue-500",
  approval: "bg-yellow-500",
  installation: "bg-purple-500",
  inspection: "bg-orange-500",
  active: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientInstallations, setClientInstallations] = useState<Record<string, ClientInstallation[]>>({});
  const [clientDocuments, setClientDocuments] = useState<Record<string, ClientDocument[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [justCreatedClientId, setJustCreatedClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "", email: "", phone: "", address: "", city: "", cpf: "", notes: "",
  });
  const { toast } = useToast();
  const { workspaceId } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (workspaceId) fetchClients();
  }, [workspaceId]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar clientes", variant: "destructive" });
      return;
    }

    const clientList = data || [];
    setClients(clientList);
    setIsLoading(false);

    // Fetch linked installations and documents for all clients
    if (clientList.length > 0) {
      const clientIds = clientList.map(c => c.id);
      
      const [instRes, docRes] = await Promise.all([
        supabase.from("installations")
          .select("id, status, power_kwp, panel_count, address, created_at, client_id")
          .eq("workspace_id", workspaceId!)
          .in("client_id", clientIds),
        supabase.from("documents")
          .select("id, name, category, file_url, created_at, client_id")
          .eq("workspace_id", workspaceId!)
          .in("client_id", clientIds),
      ]);

      const instMap: Record<string, ClientInstallation[]> = {};
      (instRes.data || []).forEach((inst: any) => {
        if (!inst.client_id) return;
        if (!instMap[inst.client_id]) instMap[inst.client_id] = [];
        instMap[inst.client_id].push(inst);
      });
      setClientInstallations(instMap);

      const docMap: Record<string, ClientDocument[]> = {};
      (docRes.data || []).forEach((doc: any) => {
        if (!doc.client_id) return;
        if (!docMap[doc.client_id]) docMap[doc.client_id] = [];
        docMap[doc.client_id].push(doc);
      });
      setClientDocuments(docMap);
    }
  };

  const openDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        full_name: client.full_name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        cpf: client.cpf || "",
        notes: client.notes || "",
      });
    } else {
      setEditingClient(null);
      setFormData({ full_name: "", email: "", phone: "", address: "", city: "", cpf: "", notes: "" });
    }
    setIsDialogOpen(true);
  };

  const saveClient = async () => {
    if (!formData.full_name) {
      toast({ title: "Preencha o nome do cliente", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Usuário não autenticado", variant: "destructive" });
      return;
    }

    const clientData = {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      cpf: formData.cpf || null,
      notes: formData.notes || null,
      user_id: user.id,
      workspace_id: workspaceId,
    };

    if (editingClient) {
      const { error } = await supabase.from("clients").update(clientData).eq("id", editingClient.id);
      if (error) { toast({ title: "Erro ao atualizar cliente", variant: "destructive" }); return; }
      toast({ title: "Cliente atualizado!" });
    } else {
      const { data, error } = await supabase.from("clients").insert(clientData).select("id").single();
      if (error) { toast({ title: "Erro ao criar cliente", variant: "destructive" }); return; }
      toast({ title: "Cliente cadastrado!" });
      if (data) {
        setJustCreatedClientId(data.id);
        setExpandedClient(data.id);
      }
    }

    setIsDialogOpen(false);
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente? Isso pode afetar instalações e documentos vinculados.")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir cliente", variant: "destructive" }); return; }
    toast({ title: "Cliente excluído!" });
    fetchClients();
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const toggleExpand = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
    setJustCreatedClientId(null);
  };

  return (
    <AppLayout title="Clientes">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, cidade ou telefone..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button variant="cta" onClick={() => openDialog()}>
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Nome Completo *</Label>
              <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Nome do cliente" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Telefone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" /></div>
              <div><Label>CPF</Label><Input value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" /></div>
            <div><Label>Endereço</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Rua, número, bairro" /></div>
            <div><Label>Cidade</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Cidade" /></div>
            <div><Label>Observações</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Notas sobre o cliente" /></div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button variant="cta" onClick={saveClient}>{editingClient ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => {
          const installations = clientInstallations[client.id] || [];
          const documents = clientDocuments[client.id] || [];
          const hasInstallation = installations.length > 0;
          const hasDocuments = documents.length > 0;
          const isExpanded = expandedClient === client.id;
          const isJustCreated = justCreatedClientId === client.id;

          return (
            <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-card rounded-xl border transition-all ${isJustCreated ? "border-primary ring-2 ring-primary/20" : "border-border hover:shadow-md"}`}>
              
              {/* Main Card */}
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(client.id)}>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground">{client.full_name}</h3>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        {client.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{client.phone}</span>}
                        {client.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</span>}
                        {client.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{client.city}</span>}
                      </div>
                      
                      {/* Mini Checklist */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5 text-xs">
                          {hasInstallation 
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" /> 
                            : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                          <span className={hasInstallation ? "text-foreground" : "text-muted-foreground"}>Instalação</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs">
                          {hasDocuments 
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" /> 
                            : <Circle className="w-4 h-4 text-muted-foreground/40" />}
                          <span className={hasDocuments ? "text-foreground" : "text-muted-foreground"}>Documentos</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleExpand(client.id)}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDialog(client)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteClient(client.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <Separator />
                    <div className="p-5 space-y-5">
                      {/* Suggestion banner for just-created clients */}
                      {isJustCreated && !hasInstallation && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Cliente criado com sucesso!</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Que tal criar uma instalação e adicionar documentos para este cliente?
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="cta" className="gap-1.5 text-xs h-8"
                                onClick={() => navigate("/installations")}>
                                <Wrench className="w-3.5 h-3.5" /> Criar Instalação
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                                onClick={() => navigate("/documents")}>
                                <FileText className="w-3.5 h-3.5" /> Adicionar Documentos
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Installations Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-primary" /> Instalações
                          </h4>
                          {!hasInstallation && (
                            <Button size="sm" variant="outline" className="text-xs h-7 gap-1"
                              onClick={() => navigate("/installations")}>
                              <Plus className="w-3 h-3" /> Criar
                            </Button>
                          )}
                        </div>
                        {hasInstallation ? (
                          <div className="space-y-2">
                            {installations.map(inst => (
                              <div key={inst.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[inst.status] || "bg-muted"}`} />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {statusLabels[inst.status] || inst.status}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {inst.power_kwp ? `${inst.power_kwp} kWp` : ""} 
                                      {inst.panel_count ? ` • ${inst.panel_count} painéis` : ""}
                                      {inst.address ? ` • ${inst.address}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px]">
                                  {new Date(inst.created_at).toLocaleDateString("pt-BR")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 text-center">
                            Nenhuma instalação vinculada
                          </p>
                        )}
                      </div>

                      {/* Documents Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Documentos
                          </h4>
                          <Button size="sm" variant="outline" className="text-xs h-7 gap-1"
                            onClick={() => navigate("/documents")}>
                            <Plus className="w-3 h-3" /> Adicionar
                          </Button>
                        </div>
                        {hasDocuments ? (
                          <div className="space-y-2">
                            {documents.map(doc => (
                              <div key={doc.id} className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
                                  </div>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="text-xs h-7">Ver</Button>
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 text-center">
                            Nenhum documento vinculado
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredClients.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground">Cadastre um novo cliente para começar.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
