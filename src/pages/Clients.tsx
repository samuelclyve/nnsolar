import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Plus, Search, Filter, 
  Phone, Mail, MapPin, Calendar, Zap, CreditCard, Link2, MessageCircle, Copy, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface Client {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
}

interface Installation {
  id: string;
  client_name: string;
  client_user_id: string | null;
  status: string;
  power_kwp: number | null;
  panel_count: number | null;
  city: string | null;
  created_at: string;
}

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string | null;
  paid_date: string | null;
}

interface CreateClientResult {
  success: boolean;
  user_id: string;
  temp_password: string;
  whatsapp_link: string;
  message: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [availableInstallations, setAvailableInstallations] = useState<Installation[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientInstallation, setClientInstallation] = useState<Installation | null>(null);
  const [clientInstallments, setClientInstallments] = useState<Installment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedInstallationId, setSelectedInstallationId] = useState<string>("");
  const [createdUserInfo, setCreatedUserInfo] = useState<CreateClientResult | null>(null);
  const [clientForm, setClientForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cpf: "",
    address: "",
    city: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
    fetchAvailableInstallations();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setClients(data);
    setIsLoading(false);
  };

  const fetchAvailableInstallations = async () => {
    // Fetch installations that are not linked to any client
    const { data } = await supabase
      .from("installations")
      .select("*")
      .is("client_user_id", null)
      .order("created_at", { ascending: false });
    
    if (data) setAvailableInstallations(data);
  };

  const fetchClientDetails = async (client: Client) => {
    setSelectedClient(client);
    setIsSheetOpen(true);

    // Fetch installation linked to this client
    const { data: installation } = await supabase
      .from("installations")
      .select("*")
      .eq("client_user_id", client.user_id)
      .maybeSingle();
    
    setClientInstallation(installation);

    if (installation) {
      const { data: installments } = await supabase
        .from("client_installments")
        .select("*")
        .eq("installation_id", installation.id)
        .order("installment_number", { ascending: true });
      
      setClientInstallments(installments || []);
    } else {
      setClientInstallments([]);
    }
  };

  const createClient = async () => {
    if (!clientForm.full_name || !clientForm.email) {
      toast({ title: "Preencha nome e email", variant: "destructive" });
      return;
    }

    setIsCreating(true);

    try {
      // Call edge function to create user with temporary password
      const { data, error } = await supabase.functions.invoke('create-client-user', {
        body: {
          email: clientForm.email,
          full_name: clientForm.full_name,
          phone: clientForm.phone || undefined,
          cpf: clientForm.cpf || undefined,
          address: clientForm.address || undefined,
          city: clientForm.city || undefined,
        }
      });

      if (error) {
        console.error("Error creating client:", error);
        toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
        setIsCreating(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Erro ao criar cliente", description: data.error, variant: "destructive" });
        setIsCreating(false);
        return;
      }

      // Show success with WhatsApp link
      setCreatedUserInfo(data as CreateClientResult);
      toast({ title: "Cliente criado com sucesso!" });
      fetchClients();
      
    } catch (err: any) {
      console.error("Error:", err);
      toast({ title: "Erro ao criar cliente", description: err.message, variant: "destructive" });
    }

    setIsCreating(false);
  };

  const linkInstallationToClient = async () => {
    if (!selectedClient || !selectedInstallationId) {
      toast({ title: "Selecione uma instalação", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("installations")
      .update({ client_user_id: selectedClient.user_id })
      .eq("id", selectedInstallationId);

    if (error) {
      toast({ title: "Erro ao vincular instalação", variant: "destructive" });
      return;
    }

    toast({ title: "Instalação vinculada com sucesso!" });
    setIsLinkDialogOpen(false);
    setSelectedInstallationId("");
    fetchClientDetails(selectedClient);
    fetchAvailableInstallations();
  };

  const unlinkInstallation = async () => {
    if (!clientInstallation) return;

    const { error } = await supabase
      .from("installations")
      .update({ client_user_id: null })
      .eq("id", clientInstallation.id);

    if (error) {
      toast({ title: "Erro ao desvincular instalação", variant: "destructive" });
      return;
    }

    toast({ title: "Instalação desvinculada!" });
    if (selectedClient) fetchClientDetails(selectedClient);
    fetchAvailableInstallations();
  };

  const updateClientInstallation = async (updates: Partial<Installation>) => {
    if (!clientInstallation) return;

    const { error } = await supabase
      .from("installations")
      .update(updates)
      .eq("id", clientInstallation.id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
      return;
    }

    toast({ title: "Instalação atualizada!" });
    if (selectedClient) fetchClientDetails(selectedClient);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!" });
  };

  const resetForm = () => {
    setClientForm({ full_name: "", email: "", phone: "", cpf: "", address: "", city: "" });
    setCreatedUserInfo(null);
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      project: "Projeto",
      approval: "Aprovação",
      installation: "Instalação",
      inspection: "Vistoria",
      active: "Sistema Ativo"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      project: "bg-muted text-muted-foreground",
      approval: "bg-amber-100 text-amber-700",
      installation: "bg-blue-100 text-blue-700",
      inspection: "bg-purple-100 text-purple-700",
      active: "bg-emerald-100 text-emerald-700"
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <AppLayout title="Gerenciamento de Clientes">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerencie os clientes e seus portais</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="cta">
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {createdUserInfo ? "Cliente Criado!" : "Cadastrar Novo Cliente"}
                </DialogTitle>
              </DialogHeader>

              {createdUserInfo ? (
                <div className="space-y-4 pt-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-emerald-700 font-medium mb-2">✓ Cliente criado com sucesso!</p>
                    <p className="text-sm text-emerald-600">
                      Envie a mensagem de boas-vindas pelo WhatsApp com os dados de acesso.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={clientForm.email} readOnly className="bg-muted" />
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(clientForm.email)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Senha Temporária</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={createdUserInfo.temp_password} readOnly className="bg-muted font-mono" />
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdUserInfo.temp_password)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="cta"
                    className="w-full"
                    onClick={() => window.open(createdUserInfo.whatsapp_link, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar via WhatsApp
                    <ExternalLink className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Nome Completo *</Label>
                    <Input
                      value={clientForm.full_name}
                      onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })}
                      placeholder="Nome do cliente"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Telefone (WhatsApp)</Label>
                      <Input
                        value={clientForm.phone}
                        onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>CPF</Label>
                      <Input
                        value={clientForm.cpf}
                        onChange={(e) => setClientForm({ ...clientForm, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input
                      value={clientForm.address}
                      onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                      placeholder="Rua, número, bairro"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={clientForm.city}
                      onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                      placeholder="Cidade/UF"
                      className="mt-1.5"
                    />
                  </div>
                  <Button 
                    variant="cta" 
                    className="w-full" 
                    onClick={createClient}
                    disabled={isCreating}
                  >
                    {isCreating ? "Criando..." : "Cadastrar Cliente"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Clients Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow border-border"
              onClick={() => fetchClientDetails(client)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {client.full_name.charAt(0)}
                  </div>
                  <Badge variant={client.is_active ? "default" : "secondary"}>
                    {client.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{client.full_name}</h3>
                {client.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </p>
                )}
                {client.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                    <Phone className="w-3 h-3" />
                    {client.phone}
                  </p>
                )}
                {client.city && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {client.city}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredClients.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">Cadastre novos clientes para gerenciar seus portais.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Client Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {selectedClient?.full_name.charAt(0)}
              </div>
              {selectedClient?.full_name}
            </SheetTitle>
          </SheetHeader>

          {selectedClient && (
            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Dados</TabsTrigger>
                <TabsTrigger value="installation">Instalação</TabsTrigger>
                <TabsTrigger value="payments">Parcelas</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    {selectedClient.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.address}</span>
                      </div>
                    )}
                    {selectedClient.city && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedClient.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Cliente desde {new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="installation" className="space-y-4 mt-4">
                {clientInstallation ? (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Sistema Solar</span>
                        <Badge className={getStatusColor(clientInstallation.status)}>
                          {getStatusLabel(clientInstallation.status)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Zap className="w-4 h-4" />
                            Potência
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {clientInstallation.power_kwp || 0} kWp
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-3">
                          <div className="text-muted-foreground text-sm mb-1">Painéis</div>
                          <p className="text-xl font-bold text-foreground">
                            {clientInstallation.panel_count || 0}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Atualizar Status</Label>
                        <select
                          value={clientInstallation.status}
                          onChange={(e) => updateClientInstallation({ status: e.target.value })}
                          className="w-full mt-1.5 h-10 px-3 rounded-lg border border-input bg-background"
                        >
                          <option value="project">Projeto</option>
                          <option value="approval">Aprovação</option>
                          <option value="installation">Instalação</option>
                          <option value="inspection">Vistoria</option>
                          <option value="active">Sistema Ativo</option>
                        </select>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={unlinkInstallation}
                      >
                        <Link2 className="w-4 h-4" />
                        Desvincular Instalação
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Nenhuma instalação vinculada</p>
                    <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Link2 className="w-4 h-4" />
                          Vincular Instalação
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Vincular Instalação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            Selecione uma instalação existente para vincular a este cliente.
                          </p>
                          
                          {availableInstallations.length > 0 ? (
                            <>
                              <Select
                                value={selectedInstallationId}
                                onValueChange={setSelectedInstallationId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma instalação" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableInstallations.map((inst) => (
                                    <SelectItem key={inst.id} value={inst.id}>
                                      {inst.client_name} - {inst.power_kwp || 0} kWp ({inst.city || 'Sem cidade'})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="cta" 
                                className="w-full"
                                onClick={linkInstallationToClient}
                                disabled={!selectedInstallationId}
                              >
                                Vincular
                              </Button>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">
                                Não há instalações disponíveis para vincular.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Crie uma nova instalação na aba "Instalações".
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-4 mt-4">
                {clientInstallments.length > 0 ? (
                  <>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold text-foreground">
                              R$ {clientInstallments.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2">
                      {clientInstallments.map((inst) => (
                        <div 
                          key={inst.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            inst.status === 'paid' ? 'bg-emerald-50 border-emerald-200' : 'bg-card border-border'
                          }`}
                        >
                          <div>
                            <p className="font-medium">
                              {inst.installment_number === 0 ? 'Entrada' : `Parcela ${inst.installment_number}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vence: {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <Badge variant={inst.status === 'paid' ? 'default' : 'secondary'}>
                              {inst.status === 'paid' ? 'Pago' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma parcela cadastrada</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
