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
import logoNn from "@/assets/logo-nn-energia-solar.png";

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchInstallation = async (userId: string) => {
    // Get installation linked to the logged-in client user
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
  const pendingInstallments = installments.filter(i => i.status !== 'paid');
  const paidInstallments = installments.filter(i => i.status === 'paid');

  // Simulated economy data (in a real app, this would come from inverter telemetry)
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
      <header className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container py-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <Link to="/">
              <img src={logoNn} alt="NN Energia Solar" className="h-8" />
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Olá,</p>
              <h1 className="text-2xl font-bold">{profile?.full_name || "Cliente"}</h1>
              {installation && (
                <p className="text-sm text-primary-foreground/70 mt-1">
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
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-sm">Sistema Ativo</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="container py-6">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Economy Card - Main Feature */}
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
                        <span className="text-sm font-medium text-emerald-500 flex items-center gap-1">
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
                    {installation ? statusSteps.find(s => s.id === installation.status)?.description : "Carregando..."}
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
                    <span className="font-medium text-emerald-600">
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
                                isCompleted ? "bg-emerald-500 text-white" :
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
                              <div className={`w-0.5 h-12 mt-2 ${isCompleted ? "bg-emerald-500" : "bg-muted"}`} />
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
                              isCompleted ? "bg-emerald-100 text-emerald-700" : 
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
                <div className="grid gap-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="border-0 shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.document_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.document_type || 'Documento'} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : ''}
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
                    <p className="text-muted-foreground">Nenhum documento disponível ainda.</p>
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
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card className="border-0 shadow-sm bg-emerald-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{paidInstallments.length}</p>
                    <p className="text-xs text-emerald-700">Pagas</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-amber-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{pendingInstallments.length}</p>
                    <p className="text-xs text-amber-700">Pendentes</p>
                  </CardContent>
                </Card>
              </div>

              {installments.length > 0 ? (
                <div className="grid gap-3">
                  {installments.map((inst) => (
                    <Card key={inst.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              inst.status === "paid" ? "bg-emerald-100" : "bg-amber-100"
                            }`}>
                              {inst.status === "paid" ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                              ) : (
                                <Clock className="w-6 h-6 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {inst.installment_number === 0 ? 'Entrada' : `Parcela ${inst.installment_number}`}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Venc: {new Date(inst.due_date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-foreground">
                              R$ {Number(inst.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              inst.status === "paid" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {inst.status === "paid" ? "Pago" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma parcela cadastrada.</p>
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
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-2">Precisa de ajuda?</h4>
                  <p className="text-muted-foreground mb-6">
                    Nossa equipe está disponível para ajudar você com qualquer dúvida.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="w-full" asChild>
                      <a href="https://wa.me/5588998471511" className="flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <a href="tel:+5588998471511" className="flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        Ligar Agora
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Perguntas Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { q: "Como acompanho minha geração?", a: "Através do app do inversor ou pelo monitoramento que instalamos." },
                    { q: "Quanto tempo dura a garantia?", a: "Os painéis têm garantia de 25 anos e o inversor de 5 a 10 anos." },
                    { q: "Preciso fazer manutenção?", a: "Recomendamos limpeza semestral dos painéis." },
                  ].map((faq, i) => (
                    <div key={i} className="border-b border-border pb-3 last:border-0">
                      <p className="font-medium text-foreground mb-1">{faq.q}</p>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border">
        <div className="flex flex-col items-center py-6 gap-2 h-full">
          <Link to="/" className="mb-6">
            <img src={logoNn} alt="Logo" className="w-10 h-10 object-contain" />
          </Link>
          
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === tab.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="w-14 h-14 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}