import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, Zap, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, installations: 0, activeInstallations: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchProfile();
    fetchChartData();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setProfile(data);
    }
  };

  const fetchStats = async () => {
    const [leadsRes, installationsRes, activeRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }),
      supabase.from("installations").select("id", { count: "exact" }),
      supabase.from("installations").select("id", { count: "exact" }).eq("status", "active"),
    ]);

    setStats({
      leads: leadsRes.count || 0,
      installations: installationsRes.count || 0,
      activeInstallations: activeRes.count || 0,
    });
  };

  const fetchChartData = async () => {
    // Fetch leads by month
    const { data: leads } = await supabase
      .from("leads")
      .select("created_at, status")
      .order("created_at", { ascending: true });

    // Fetch installations by month
    const { data: installations } = await supabase
      .from("installations")
      .select("created_at, status, power_kwp")
      .order("created_at", { ascending: true });

    // Fetch installments for revenue
    const { data: installments } = await supabase
      .from("client_installments")
      .select("amount, due_date, status")
      .order("due_date", { ascending: true });

    // Process monthly data
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    const monthlyStats = months.map((month, index) => {
      const monthLeads = leads?.filter(l => {
        const date = new Date(l.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length || 0;
      
      const monthInstallations = installations?.filter(i => {
        const date = new Date(i.created_at);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      }).length || 0;

      const monthRevenue = installments?.filter(inst => {
        const date = new Date(inst.due_date);
        return date.getMonth() === index && date.getFullYear() === currentYear && inst.status === 'paid';
      }).reduce((sum, inst) => sum + Number(inst.amount), 0) || 0;

      return {
        name: month,
        leads: monthLeads,
        instalacoes: monthInstallations,
        receita: monthRevenue,
      };
    });

    setMonthlyData(monthlyStats);

    // Process conversion funnel data
    const statusCounts = {
      new: leads?.filter(l => l.status === 'new').length || 0,
      qualified: leads?.filter(l => l.status === 'qualified').length || 0,
      proposal: leads?.filter(l => l.status === 'proposal').length || 0,
      negotiation: leads?.filter(l => l.status === 'negotiation').length || 0,
      closed: leads?.filter(l => l.status === 'closed').length || 0,
    };

    setConversionData([
      { name: 'Novos', value: statusCounts.new, fill: 'hsl(var(--primary))' },
      { name: 'Qualificados', value: statusCounts.qualified, fill: 'hsl(var(--chart-2))' },
      { name: 'Proposta', value: statusCounts.proposal, fill: 'hsl(var(--chart-3))' },
      { name: 'Negociação', value: statusCounts.negotiation, fill: 'hsl(var(--chart-4))' },
      { name: 'Fechados', value: statusCounts.closed, fill: 'hsl(var(--chart-5))' },
    ]);

    // Process installation status data
    const installationStatusCounts = {
      project: installations?.filter(i => i.status === 'project').length || 0,
      approval: installations?.filter(i => i.status === 'approval').length || 0,
      installation: installations?.filter(i => i.status === 'installation').length || 0,
      inspection: installations?.filter(i => i.status === 'inspection').length || 0,
      active: installations?.filter(i => i.status === 'active').length || 0,
    };

    setStatusData([
      { name: 'Projeto', value: installationStatusCounts.project },
      { name: 'Aprovação', value: installationStatusCounts.approval },
      { name: 'Instalação', value: installationStatusCounts.installation },
      { name: 'Vistoria', value: installationStatusCounts.inspection },
      { name: 'Ativo', value: installationStatusCounts.active },
    ]);

    // Revenue over time
    const revenueByMonth = months.map((month, index) => {
      const paid = installments?.filter(inst => {
        const date = new Date(inst.due_date);
        return date.getMonth() === index && date.getFullYear() === currentYear && inst.status === 'paid';
      }).reduce((sum, inst) => sum + Number(inst.amount), 0) || 0;

      const pending = installments?.filter(inst => {
        const date = new Date(inst.due_date);
        return date.getMonth() === index && date.getFullYear() === currentYear && inst.status === 'pending';
      }).reduce((sum, inst) => sum + Number(inst.amount), 0) || 0;

      return {
        name: month,
        recebido: paid,
        pendente: pending,
      };
    });

    setRevenueData(revenueByMonth);
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.recebido, 0);
  const pendingRevenue = revenueData.reduce((sum, item) => sum + item.pendente, 0);
  const conversionRate = stats.leads > 0 ? ((stats.installations / stats.leads) * 100).toFixed(1) : 0;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

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
      label: "Instalações", 
      value: stats.installations.toString(), 
      icon: Zap,
      trend: `${stats.activeInstallations} ativos`,
      trendUp: true,
      description: "no total"
    },
    { 
      label: "Receita Recebida", 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign,
      trend: "+7.2%",
      trendUp: true,
      description: "este ano"
    },
    { 
      label: "Taxa de Conversão", 
      value: `${conversionRate}%`, 
      icon: TrendingUp,
      trend: "leads → instalações",
      trendUp: true,
      description: "média geral"
    },
  ];

  const scheduleItems = [
    { time: "09:30", title: "Visita Técnica - João Silva", subtitle: "Rua das Flores, 123", checked: true },
    { time: "10:35", title: "Instalação Residencial", subtitle: "Cliente Maria Santos", checked: false },
    { time: "13:15", title: "Reunião Comercial", subtitle: "Proposta novo cliente", checked: false },
    { time: "14:45", title: "Vistoria Final", subtitle: "Sistema 8.5kWp", checked: false },
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
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Leads & Installations Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Leads e Instalações por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="leads" name="Leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="instalacoes" name="Instalações" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Receita por Mês</CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Recebido</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--chart-3))' }} />
                  <span className="text-muted-foreground">Pendente</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                  />
                  <Area type="monotone" dataKey="recebido" name="Recebido" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                  <Area type="monotone" dataKey="pendente" name="Pendente" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Installation Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Status das Instalações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" name="Quantidade" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule & Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-muted-foreground text-xs py-2">{day}</div>
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
              {scheduleItems.slice(0, 3).map((item, index) => (
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
        transition={{ delay: 0.9 }}
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
                <Link to="/users">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm">Usuários</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-dashed" asChild>
                <Link to="/site-editor">
                  <TrendingUp className="w-5 h-5 text-primary" />
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