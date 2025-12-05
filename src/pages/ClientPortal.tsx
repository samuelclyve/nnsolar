import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Sun, Zap, FileText, CreditCard, HelpCircle, User,
  CheckCircle2, Clock, AlertCircle, Calendar, Download, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

interface Installment {
  id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: string;
}

const statusSteps = [
  { id: "project", label: "Projeto", icon: FileText },
  { id: "approval", label: "Aprovação", icon: Clock },
  { id: "installation", label: "Instalação", icon: Zap },
  { id: "inspection", label: "Vistoria", icon: AlertCircle },
  { id: "active", label: "Sistema Ativo", icon: CheckCircle2 },
];

export default function ClientPortal() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [activeTab, setActiveTab] = useState("timeline");
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
    fetchProfile(session.user.id);
    fetchInstallation();
    fetchInstallments();
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  const fetchInstallation = async () => {
    // For demo, get the first installation
    const { data } = await supabase
      .from("installations")
      .select("*")
      .limit(1)
      .single();
    setInstallation(data);
  };

  const fetchInstallments = async () => {
    // Demo data since we don't have real installments yet
    setInstallments([
      { id: "1", installment_number: 1, amount: 1500, due_date: "2024-01-15", status: "paid" },
      { id: "2", installment_number: 2, amount: 1500, due_date: "2024-02-15", status: "paid" },
      { id: "3", installment_number: 3, amount: 1500, due_date: "2024-03-15", status: "pending" },
      { id: "4", installment_number: 4, amount: 1500, due_date: "2024-04-15", status: "pending" },
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getCurrentStatusIndex = () => {
    if (!installation) return 0;
    return statusSteps.findIndex(step => step.id === installation.status);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [
    { id: "timeline", label: "Instalação", icon: Zap },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "payments", label: "Parcelas", icon: CreditCard },
    { id: "support", label: "Suporte", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-solar-blue-light text-primary-foreground">
        <div className="container py-6">
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
            <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-primary-foreground/70">Olá,</p>
              <h1 className="text-xl font-bold">{profile?.full_name || "Cliente"}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Status Card */}
      <div className="container -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Status do Sistema</p>
              <h2 className="text-2xl font-bold text-foreground">
                {installation ? statusSteps.find(s => s.id === installation.status)?.label : "Carregando..."}
              </h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              installation?.status === "active" ? "bg-success/20" : "bg-secondary/20"
            }`}>
              {installation?.status === "active" ? (
                <CheckCircle2 className="w-6 h-6 text-success" />
              ) : (
                <Clock className="w-6 h-6 text-secondary" />
              )}
            </div>
          </div>

          {installation && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Potência</p>
                <p className="font-semibold text-foreground">{installation.power_kwp || "-"} kWp</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Painéis</p>
                <p className="font-semibold text-foreground">{installation.panel_count || "-"} unidades</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="container py-6">
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Progresso da Instalação</h3>
            
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const currentIndex = getCurrentStatusIndex();
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-success text-success-foreground" :
                          isCurrent ? "bg-secondary text-secondary-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`w-0.5 h-12 ${isCompleted ? "bg-success" : "bg-muted"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className={`font-semibold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isCompleted ? "Concluído" : isCurrent ? "Em andamento" : "Pendente"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Documentos</h3>
            
            <div className="grid gap-3">
              {["Contrato", "ART", "Projeto Técnico", "Nota Fiscal"].map((doc) => (
                <div key={doc} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc}</p>
                      <p className="text-xs text-muted-foreground">PDF • Disponível</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Parcelas</h3>
            
            <div className="grid gap-3">
              {installments.map((inst) => (
                <div key={inst.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        inst.status === "paid" ? "bg-success/20" : "bg-secondary/20"
                      }`}>
                        {inst.status === "paid" ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Parcela {inst.installment_number}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Venc: {new Date(inst.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        R$ {inst.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inst.status === "paid" 
                          ? "bg-success/20 text-success" 
                          : "bg-secondary/20 text-secondary"
                      }`}>
                        {inst.status === "paid" ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "support" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Suporte</h3>
            
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-primary mb-4" />
              <h4 className="font-semibold text-foreground mb-2">Precisa de ajuda?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa equipe está disponível para ajudar você.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="cta" asChild>
                  <a href="https://wa.me/5588998471511">WhatsApp</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:+5588998471511">Ligar Agora</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                activeTab === tab.id 
                  ? "text-secondary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
