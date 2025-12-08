import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Sun, Zap, FileText, CreditCard, HelpCircle, 
  CheckCircle2, Clock, AlertCircle, Calendar, Download, LogOut,
  TrendingUp, Battery, ChevronRight, Phone, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoFundoBranco from "@/assets/logo-fundo-branco.png";

interface Installation {
  id: string;
  client_name: string;
  status: string;
  power_kwp: number | null;
  panel_count: number | null;
  created_at: string;
  address: string | null;
  city: string | null;
}

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string | null;
  paid_date: string | null;
}

interface Document {
  id: string;
  document_name: string;
  document_type: string | null;
  file_url: string;
  created_at: string | null;
}

const statusSteps = [
  { id: "project", label: "Projeto", icon: FileText, description: "Elaboração do projeto técnico" },
  { id: "approval", label: "Aprovação", icon: Clock, description: "Aprovação junto à concessionária" },
  { id: "installation", label: "Instalação", icon: Zap, description: "Instalação dos equipamentos" },
  { id: "inspection", label: "Vistoria", icon: AlertCircle, description: "Vistoria técnica final" },
  { id: "active", label: "Sistema Ativo", icon: CheckCircle2, description: "Sistema em funcionamento" },
];

export default function ClientPortal() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    await Promise.all([
      fetchProfile(session.user.id),
      fetchInstallation(session.user.id),
    ]);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    // Try clients table first
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (clientData) {
      setProfile(clientData);
      return;
    }

    // Fallback to profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(profileData);
  };

  const fetchInstallation = async (userId: string) => {
    const { data: installationData } = await supabase
      .from("installations")
      .select("*")
      .eq("client_user_id", userId)
      .maybeSingle();
    
    if (installationData) {
      setInstallation(installationData);
      await Promise.all([
        fetchInstallments(installationData.id),
        fetchDocuments(installationData.id),
      ]);
    }
  };

  const fetchInstallments = async (installationId: string) => {
    const { data } = await supabase
      .from("client_installments")
      .select("*")
      .eq("installation_id", installationId)
      .order("installment_number", { ascending: true });
    
    if (data) setInstallments(data);
  };

  const fetchDocuments = async (installationId: string) => {
    const { data } = await supabase
      .from("installation_documents")
      .select("*")
      .eq("installation_id", installationId)
      .order("created_at", { ascending: false });
    
    if (data) setDocuments(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getCurrentStatusIndex = () => {
    if (!installation) return 0;
    return statusSteps.findIndex(step => step.id === installation.status);
  };

  const totalAmount = installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
  const paidAmount = installments.filter(i => i.status === 'paid').reduce((sum, inst) => sum + Number(inst.amount), 0);
  const downPayment = installments.find(i => i.installment_number === 0)?.amount || 0;
  const paidInstallments = installments.filter(i => i.status === 'paid');

  // Simulated economy data
  const economyData = {
    monthlySavings: 847.00,
    todayGeneration: 42.8,
    todayChange: 26,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: Sun },
    { id: "timeline", label: "Instalação", icon: Zap },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "payments", label: "Parcelas", icon: CreditCard },
    { id: "support", label: "Suporte", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-r from-secondary via-secondary to-secondary/90 text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container py-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <img src={logoFundoBranco} alt="NN Energia Solar" className="h-8" />
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-secondary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-secondary-foreground/70">Olá,</p>
              <h1 className="text-2xl font-bold">{profile?.full_name || "Cliente"}</h1>
              {installation && (
                <p className="text-sm text-secondary-foreground/70 mt-1">
                  {installation.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status Badge */}
      {installation?.status === 'active' && (
        <div className="container -mt-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-4 -top-2"
          >
            <div className="bg-success text-success-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-sm">Sistema Ativo</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="container py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-2">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Economy Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Economia Mensal</p>
                      <p className="text-4xl font-bold text-foreground">
                        R$ {economyData.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Zap className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Geração Hoje</p>
                        <p className="text-2xl font-bold text-foreground">{economyData.todayGeneration} kWh</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-success flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +{economyData.todayChange}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Sun className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{installation?.panel_count || 0} Painéis</p>
                        <p className="text-xs text-muted-foreground">Ativos</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Battery className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{installation?.power_kwp || 0} kWp</p>
                        <p className="text-xs text-muted-foreground">Potência</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Status */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Status do Sistema
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStatusIndex();
                      const isCompleted = index <= currentIndex;
                      return (
                        <div
                          key={step.id}
                          className={`flex-1 h-2 rounded-full ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {installation ? statusSteps.find(s => s.id === installation.status)?.description : "Aguardando instalação"}
                  </p>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Valor Total</span>
                    <span className="font-bold text-foreground">
                      R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {Number(downPayment) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entrada</span>
                      <span className="font-medium text-foreground">
                        R$ {Number(downPayment).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pago</span>
                    <span className="font-medium text-success">
                      R$ {paidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pendente</span>
                    <span className="font-medium text-amber-600">
                      R$ {(totalAmount - paidAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Parcelas</span>
                      <span className="font-medium text-foreground">
                        {paidInstallments.length} de {installments.length} pagas
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "timeline" && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Progresso da Instalação</h3>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {statusSteps.map((step, index) => {
                      const currentIndex = getCurrentStatusIndex();
                      const isCompleted = index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <motion.div
                              initial={false}
                              animate={{ scale: isCurrent ? 1.1 : 1 }}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isCompleted ? "bg-success text-success-foreground" :
                                isCurrent ? "bg-primary text-primary-foreground" :
                                "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                <StepIcon className="w-6 h-6" />
                              )}
                            </motion.div>
                            {index < statusSteps.length - 1 && (
                              <div className={`w-0.5 h-12 mt-2 ${isCompleted ? "bg-success" : "bg-muted"}`} />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <h4 className={`font-semibold text-lg ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                              {step.label}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              {step.description}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isCompleted ? "bg-success/10 text-success" : 
                              isCurrent ? "bg-primary/10 text-primary" : 
                              "bg-muted text-muted-foreground"
                            }`}>
                              {isCompleted ? "Concluído" : isCurrent ? "Em andamento" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Documentos</h3>
              
              {documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="border-0 shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.created_at && new Date(doc.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-5 h-5" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum documento disponível</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Parcelas</h3>
              
              {installments.length > 0 ? (
                <div className="space-y-3">
                  {installments.map((inst) => (
                    <Card 
                      key={inst.id} 
                      className={`border-0 shadow-sm ${
                        inst.status === 'paid' ? 'bg-success/5' : ''
                      }`}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {inst.installment_number === 0 ? 'Entrada' : `Parcela ${inst.installment_number}`}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Vence: {new Date(inst.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            R$ {Number(inst.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            inst.status === 'paid' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inst.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma parcela cadastrada</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === "support" && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-foreground">Suporte</h3>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    Precisa de ajuda? Entre em contato conosco pelos canais abaixo:
                  </p>
                  
                  <Button variant="outline" className="w-full justify-start gap-3" asChild>
                    <a href="tel:+5500000000000">
                      <Phone className="w-5 h-5 text-primary" />
                      (00) 0000-0000
                    </a>
                  </Button>
                  
                  <Button variant="cta" className="w-full justify-start gap-3" asChild>
                    <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-2 px-4 md:hidden z-50">
        <div className="flex justify-around">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}