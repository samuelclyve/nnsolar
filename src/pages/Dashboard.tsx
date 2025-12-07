import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, Zap, TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    { 
      label: "Total de Leads", 
      value: stats.leads.toString(), 
      icon: Users,
      trend: "+15%",
      trendUp: true,
      description: "desde o último mês"
    },
    { 
      label: "Instalações Ativas", 
      value: stats.installations.toString(), 
      icon: Zap,
      trend: "-9%",
      trendUp: false,
      description: "desde o último mês"
    },
    { 
      label: "Receita Total", 
      value: "R$ 64.981,97", 
      icon: DollarSign,
      trend: "+7.2%",
      trendUp: true,
      description: "desde o último mês"
    },
    { 
      label: "Economia Gerada", 
      value: "R$ 18.158,21", 
      icon: TrendingUp,
      trend: "-2%",
      trendUp: false,
      description: "desde o último mês"
    },
  ];

  const scheduleItems = [
    { time: "09:30", title: "Visita Técnica - João Silva", subtitle: "Rua das Flores, 123", checked: true },
    { time: "10:35", title: "Instalação Residencial", subtitle: "Cliente Maria Santos + 5 mais", checked: false },
    { time: "13:15", title: "Reunião Comercial", subtitle: "Proposta novo cliente + 6 mais", checked: false },
    { time: "14:45", title: "Vistoria Final", subtitle: "Sistema 8.5kWp + 32 mais", checked: false },
  ];

  return (
    <AppLayout title="Dashboard">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Aqui está o resumo do seu negócio!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${
                    stat.trendUp ? 'text-primary' : 'text-destructive'
                  }`}>
                    {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Overview Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Visão de Vendas</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Lucro</span>
                  <span className="font-semibold">9.2K</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 bg-muted rounded-full" />
                  <span className="text-muted-foreground">Despesas</span>
                  <span className="font-semibold">2.6K</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chart placeholder - you can integrate recharts here */}
              <div className="h-64 flex items-end justify-between gap-2 pt-4">
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, i) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-primary rounded-t-md transition-all" 
                      style={{ height: `${Math.random() * 150 + 50}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar & Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          {/* Mini Calendar */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Dezembro 2024</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-muted-foreground text-xs py-2">{day}</div>
                ))}
                {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                  <div
                    key={day}
                    className={`py-2 rounded-full text-sm font-medium ${
                      day === 7 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted cursor-pointer'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Agenda do Dia</CardTitle>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                    item.checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                  }`}>
                    {item.checked && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-dashed" asChild>
                <Link to="/crm">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm">CRM / Leads</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-dashed" asChild>
                <Link to="/installations">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm">Instalações</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-dashed" asChild>
                <Link to="/portal">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm">Portal Cliente</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-dashed" asChild>
                <Link to="/site-editor">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm">Editar Site</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
