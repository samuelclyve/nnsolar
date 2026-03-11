import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Zap, Calendar, MapPin, 
  CheckCircle2, Clock, AlertCircle, Upload, FileText, 
  Image, X, Eye, Download, Camera, MessageCircle, Send, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { useWorkspace } from "@/hooks/useWorkspace";

interface Installation {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  address: string | null;
  city: string | null;
  power_kwp: number | null;
  panel_count: number | null;
  status: string;
  estimated_start: string | null;
  estimated_end: string | null;
  created_at: string;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string | null;
  file_url: string;
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

const whatsappTemplates: Record<string, { title: string; template: string; dateField?: string }> = {
  project: {
    title: "Abertura do Projeto",
    template: `Olá {nome}! 🌞

Bem-vindo(a) à NN Energia Solar!

Seu projeto solar foi iniciado com os seguintes dados:
📍 Endereço: {endereco}, {cidade}
⚡ Potência: {potencia} kWp
🔲 Painéis: {paineis} unidades

Previsão de início: {data_inicio}
Previsão de conclusão: {data_fim}

Em breve entraremos em contato para as próximas etapas.

Dúvidas? Responda esta mensagem! ☀️`,
  },
  approval: {
    title: "Agendamento de Aprovação",
    dateField: "Data da Reunião",
    template: `Olá {nome}! 📋

Temos novidades sobre seu projeto solar!

Estamos agendando a reunião de aprovação junto à concessionária.

📅 Data prevista: {data}

Aguarde nosso contato para confirmar detalhes.

NN Energia Solar ☀️`,
  },
  installation: {
    title: "Dia da Instalação",
    dateField: "Data da Instalação",
    template: `Olá {nome}! 🚚

Boas notícias!

Nossa equipe técnica está a caminho para realizar a instalação do seu sistema solar.

📍 Local: {endereco}
📅 Data: {data}

Por favor, certifique-se de que haja acesso ao local.

Até logo! ⚡ NN Energia Solar`,
  },
  inspection: {
    title: "Agendamento de Vistoria",
    dateField: "Data da Vistoria",
    template: `Olá {nome}! 🔍

Seu sistema solar está quase pronto!

A vistoria técnica está agendada para:
📅 Data: {data}

Após a aprovação, seu sistema será ativado junto à rede.

Estamos quase lá! ☀️ NN Energia Solar`,
  },
  active: {
    title: "Sistema Ativo!",
    template: `🎉 Parabéns {nome}!

Seu sistema solar está ATIVO e gerando energia!

⚡ {potencia} kWp de potência
🔲 {paineis} painéis instalados

A partir de agora você economizará até 95% na sua conta de luz!

Obrigado por confiar na NN Energia Solar! ☀️`,
  },
};

interface NotificationLog {
  id: string;
  message_type: string;
  message_content: string | null;
  sent_at: string;
  sent_by: string | null;
  sender_name?: string;
}

interface ClientOption {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
}

export default function Installations() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customDate, setCustomDate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newInstallation, setNewInstallation] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    address: "",
    city: "",
    power_kwp: "",
    panel_count: "",
  });
  const { toast } = useToast();
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (workspaceId) {
      fetchInstallations();
      fetchClients();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (selectedInstallation) {
      fetchDocuments(selectedInstallation.id);
      fetchNotificationLogs(selectedInstallation.id);
    }
  }, [selectedInstallation]);

  useEffect(() => {
    if (selectedInstallation && selectedTemplate) {
      const message = generateMessage(selectedInstallation, selectedTemplate, customDate);
      setCustomMessage(message);
    }
  }, [selectedInstallation, selectedTemplate, customDate]);

  const fetchInstallations = async () => {
    const { data, error } = await supabase
      .from("installations")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar instalações", variant: "destructive" });
      return;
    }

    setInstallations(data || []);
    setIsLoading(false);
  };

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, full_name, phone, email, address, city")
      .eq("workspace_id", workspaceId!)
      .order("full_name");
    if (data) setClients(data);
  };

  const fetchDocuments = async (installationId: string) => {
    const { data, error } = await supabase
      .from("installation_documents")
      .select("*")
      .eq("installation_id", installationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return;
    }

    setDocuments(data || []);
  };

  const fetchNotificationLogs = async (installationId: string) => {
    const { data, error } = await supabase
      .from("notification_logs")
      .select(`
        *,
        profiles:sent_by (full_name)
      `)
      .eq("installation_id", installationId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Error fetching notification logs:", error);
      return;
    }

    setNotificationLogs((data || []).map((log: any) => ({
      ...log,
      sender_name: log.profiles?.full_name || "Sistema",
    })));
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setNewInstallation(prev => ({
        ...prev,
        client_name: client.full_name,
        client_phone: client.phone || "",
        client_email: client.email || "",
        address: client.address || prev.address,
        city: client.city || prev.city,
      }));
    }
  };

  const createInstallation = async () => {
    if (!selectedClientId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    if (!newInstallation.client_name) {
      toast({ title: "Preencha o nome do cliente", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("installations").insert({
      client_id: selectedClientId,
      client_name: newInstallation.client_name,
      client_phone: newInstallation.client_phone || null,
      client_email: newInstallation.client_email || null,
      address: newInstallation.address || null,
      city: newInstallation.city || null,
      power_kwp: newInstallation.power_kwp ? parseFloat(newInstallation.power_kwp) : null,
      panel_count: newInstallation.panel_count ? parseInt(newInstallation.panel_count) : null,
      workspace_id: workspaceId,
    });

    if (error) {
      toast({ title: "Erro ao criar instalação", variant: "destructive" });
      return;
    }

    toast({ title: "Instalação criada com sucesso!" });
    setNewInstallation({ client_name: "", client_phone: "", client_email: "", address: "", city: "", power_kwp: "", panel_count: "" });
    setSelectedClientId("");
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !selectedInstallation) return;
    
    setIsUploading(true);
    const files = Array.from(event.target.files);

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedInstallation.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        toast({ title: `Erro ao fazer upload: ${file.name}`, variant: "destructive" });
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const docType = file.type.startsWith('image/') ? 'photo' : 'document';
      const { error: docError } = await supabase.from('installation_documents').insert({
        installation_id: selectedInstallation.id,
        document_name: file.name,
        document_type: docType,
        file_url: urlData.publicUrl,
      });

      if (docError) {
        toast({ title: `Erro ao salvar registro: ${file.name}`, variant: "destructive" });
      }
    }

    toast({ title: "Arquivos enviados com sucesso!" });
    setIsUploading(false);
    fetchDocuments(selectedInstallation.id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteDocument = async (docId: string, fileUrl: string) => {
    const pathMatch = fileUrl.match(/documents\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from('documents').remove([pathMatch[1]]);
    }

    const { error } = await supabase
      .from('installation_documents')
      .delete()
      .eq('id', docId);

    if (error) {
      toast({ title: "Erro ao excluir documento", variant: "destructive" });
      return;
    }

    toast({ title: "Documento excluído!" });
    if (selectedInstallation) {
      fetchDocuments(selectedInstallation.id);
    }
  };

  const generateMessage = (inst: Installation, templateKey: string, date?: string): string => {
    const template = whatsappTemplates[templateKey]?.template || "";
    
    return template
      .replace(/{nome}/g, inst.client_name || "Cliente")
      .replace(/{endereco}/g, inst.address || "Endereço não informado")
      .replace(/{cidade}/g, inst.city || "Cidade não informada")
      .replace(/{potencia}/g, inst.power_kwp?.toString() || "N/A")
      .replace(/{paineis}/g, inst.panel_count?.toString() || "N/A")
      .replace(/{data_inicio}/g, inst.estimated_start ? new Date(inst.estimated_start).toLocaleDateString("pt-BR") : "A definir")
      .replace(/{data_fim}/g, inst.estimated_end ? new Date(inst.estimated_end).toLocaleDateString("pt-BR") : "A definir")
      .replace(/{data}/g, date || "A definir");
  };

  const openWhatsApp = async () => {
    if (!selectedInstallation?.client_phone) {
      toast({ title: "Cliente não possui telefone cadastrado", variant: "destructive" });
      return;
    }

    // Get current user's profile for logging
    const { data: { user } } = await supabase.auth.getUser();
    let profileId = null;
    
    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      profileId = profileData?.id;
    }

    // Save notification log
    await supabase.from("notification_logs").insert({
      installation_id: selectedInstallation.id,
      message_type: selectedTemplate,
      message_content: customMessage,
      sent_by: profileId,
    });

    const phone = selectedInstallation.client_phone.replace(/\D/g, "");
    const phoneWithCountry = phone.startsWith("55") ? phone : `55${phone}`;
    const encodedMessage = encodeURIComponent(customMessage);
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
    setIsWhatsAppOpen(false);
    toast({ title: "Notificação enviada e registrada!" });
    
    // Refresh logs if viewing details
    if (selectedInstallation) {
      fetchNotificationLogs(selectedInstallation.id);
    }
  };

  const openWhatsAppDialog = (inst: Installation) => {
    setSelectedInstallation(inst);
    setSelectedTemplate(inst.status);
    setCustomDate("");
    setIsWhatsAppOpen(true);
  };

  const filteredInstallations = installations.filter((inst) => {
    const matchesSearch = inst.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
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
                <Label>Cliente *</Label>
                <Select value={selectedClientId} onValueChange={handleClientSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente cadastrado" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Nenhum cliente cadastrado. Cadastre um cliente primeiro.
                  </p>
                )}
              </div>
              {selectedClientId && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{newInstallation.client_name}</p>
                  {newInstallation.client_phone && <p>📱 {newInstallation.client_phone}</p>}
                  {newInstallation.client_email && <p>✉️ {newInstallation.client_email}</p>}
                </div>
              )}
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
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => { setSelectedInstallation(inst); setIsDetailsOpen(true); }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{inst.client_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-card ${status.color}`}>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => { e.stopPropagation(); openWhatsAppDialog(inst); }}
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    Notificar
                  </Button>
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

      {/* Installation Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedInstallation?.client_name}
              {selectedInstallation && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-card ${statusConfig[selectedInstallation.status]?.color}`}>
                  {statusConfig[selectedInstallation.status]?.label}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedInstallation && (
            <div className="space-y-6 mt-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedInstallation.client_phone || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedInstallation.client_email || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Endereço</p>
                  <p className="font-medium">{selectedInstallation.address || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cidade</p>
                  <p className="font-medium">{selectedInstallation.city || "Não informada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Potência</p>
                  <p className="font-medium">{selectedInstallation.power_kwp ? `${selectedInstallation.power_kwp} kWp` : "Não informada"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Painéis</p>
                  <p className="font-medium">{selectedInstallation.panel_count || "Não informado"}</p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={() => openWhatsAppDialog(selectedInstallation)}
                >
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  Enviar Notificação WhatsApp
                </Button>
              </div>

              {/* Upload Section */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Fotos e Documentos</h3>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>Enviando...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Enviar Arquivos
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="relative group bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors"
                    >
                      {doc.document_type === 'photo' ? (
                        <div className="aspect-video mb-2 rounded overflow-hidden bg-background">
                          <img 
                            src={doc.file_url} 
                            alt={doc.document_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video mb-2 rounded bg-background flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs text-foreground truncate">{doc.document_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                      </p>

                      {/* Actions overlay */}
                      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card rounded-full hover:bg-card/80"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="p-2 bg-card rounded-full hover:bg-card/80"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteDocument(doc.id, doc.file_url)}
                          className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Nenhum arquivo enviado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification History */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">Histórico de Notificações</h3>
                </div>

                <div className="space-y-3">
                  {notificationLogs.map((log) => (
                    <div 
                      key={log.id}
                      className="bg-muted/50 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {whatsappTemplates[log.message_type]?.title || log.message_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.sent_at).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enviado por: {log.sender_name}
                      </p>
                    </div>
                  ))}

                  {notificationLogs.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma notificação enviada</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Message Dialog */}
      <Dialog open={isWhatsAppOpen} onOpenChange={setIsWhatsAppOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              Notificar Cliente via WhatsApp
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Tipo de Mensagem</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(whatsappTemplates).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {whatsappTemplates[selectedTemplate]?.dateField && (
              <div>
                <Label>{whatsappTemplates[selectedTemplate].dateField}</Label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value).toLocaleDateString("pt-BR") : "";
                    setCustomDate(date);
                  }}
                />
              </div>
            )}

            <div>
              <Label>Prévia da Mensagem</Label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>📱 Telefone: {selectedInstallation?.client_phone || "Não cadastrado"}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWhatsAppOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="cta" 
              onClick={openWhatsApp}
              disabled={!selectedInstallation?.client_phone}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
