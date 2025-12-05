import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Sun, Zap, TrendingUp, Users, FileText, Settings, 
  LogOut, Menu, X, Home, BarChart3, Calendar, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoNn from "@/assets/logo-nn-energia-solar.png";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ leads: 0, installations: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchProfile(session.user.id);
      fetchStats();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchStats = async () => {
    const [leadsRes, installationsRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }),
      supabase.from("installations").select("id", { count: "exact" }),
    ]);

    setStats({
      leads: leadsRes.count || 0,
      installations: installationsRes.count || 0,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { icon: Home, label: "Visão Geral", href: "/dashboard", active: true },
    { icon: BarChart3, label: "CRM", href: "/crm" },
    { icon: Wrench, label: "Instalações", href: "/installations" },
    { icon: Users, label: "Portal Cliente", href: "/portal" },
    { icon: Calendar, label: "Agenda", href: "#", coming: true },
    { icon: FileText, label: "Documentos", href: "#", coming: true },
    { icon: Settings, label: "Configurações", href: "#", coming: true },
  ];

  const statsCards = [
    { label: "Leads Ativos", value: stats.leads.toString(), icon: Users, color: "bg-primary" },
    { label: "Instalações", value: stats.installations.toString(), icon: Zap, color: "bg-secondary" },
    { label: "Taxa de Conversão", value: "32%", icon: TrendingUp, color: "bg-success" },
    { label: "Economia Gerada", value: "R$ 847k", icon: Sun, color: "bg-solar-orange" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Link to="/">
              <img src={logoNn} alt="NN Energia Solar" className="h-10" />
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.coming && (
                  <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full">
                    Breve
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-solar-blue-light rounded-full flex items-center justify-center text-primary-foreground font-bold">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-foreground"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

            <div className="flex items-center gap-3">
              <Button variant="cta" size="sm" asChild>
                <Link to="/">Ver Site</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}! 👋
            </h2>
            <p className="text-muted-foreground">
              Aqui está o resumo do seu painel hoje.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <h3 className="text-lg font-bold text-foreground mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/crm">
                  <Users className="w-6 h-6" />
                  <span>CRM / Leads</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/installations">
                  <Wrench className="w-6 h-6" />
                  <span>Instalações</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                <Link to="/portal">
                  <Sun className="w-6 h-6" />
                  <span>Portal Cliente</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 opacity-50" disabled>
                <Calendar className="w-6 h-6" />
                <span>Agenda</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
