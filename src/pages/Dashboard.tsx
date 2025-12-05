import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sun, Zap, TrendingUp, Users, Calendar, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, installations: 0 });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (data) setProfile(data);
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

  const statsCards = [
    { label: "Leads Ativos", value: stats.leads.toString(), icon: Users, color: "bg-primary" },
    { label: "Instalações", value: stats.installations.toString(), icon: Zap, color: "bg-secondary" },
    { label: "Taxa de Conversão", value: "32%", icon: TrendingUp, color: "bg-success" },
    { label: "Economia Gerada", value: "R$ 847k", icon: Sun, color: "bg-solar-orange" },
  ];

  return (
    <AppLayout title="Dashboard">
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
    </AppLayout>
  );
}
