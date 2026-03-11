import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, Zap, TrendingUp, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2,
  Clock, Sun, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Onboarding } from "@/components/Onboarding";
import { TrialBanner } from "@/components/TrialBanner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO, isBefore, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, installations: 0, activeInstallations: 0, clients: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [financialSummary, setFinancialSummary] = useState({ received: 0, pending: 0, overdue: 0, overdueCount: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingInstallments, setUpcomingInstallments] = useState<any[]>([]);
  const [totalKwp, setTotalKwp] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { workspaceId } = useWorkspace();

  const today = new Date();

  useEffect(() => {
    if (!workspaceId) return;
    fetchStats();
    fetchProfile();
    fetchChartData();
  }, [workspaceId]);

  useEffect(() => {
    const done = localStorage.getItem("solarize_onboarding_done");
    if (!done) setShowOnboarding(true);
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) setProfile(data);
    }
  };

  const fetchStats = async () => {
    const [leadsRes, installationsRes, activeRes, clientsRes] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact" }).eq("workspace_id", workspaceId!),
      supabase.from("installations").select("id", { count: "exact" }).eq("workspace_id", workspaceId!),
      supabase.from("installations").select("id", { count: "exact" }).eq("workspace_id", workspaceId!).eq("status", "active"),
      supabase.from("clients").select("id", { count: "exact" }).eq("workspace_id", workspaceId!),
    ]);
    setStats({
      leads: leadsRes.count || 0,
      installations: installationsRes.count || 0,
      activeInstallations: activeRes.count || 0,
      clients: clientsRes.count || 0,
    });
  };

  const fetchChartData = async () => {
    const [leadsRes, installationsRes, installmentsRes] = await Promise.all([
      supabase.from("leads").select("created_at, status, name, phone").eq("workspace_id", workspaceId!).order("created_at", { ascending: false }),
      supabase.from("installations").select("created_at, status, power_kwp, client_name").eq("workspace_id", workspaceId!).order("created_at", { ascending: true }),
      supabase.from("client_installments").select("amount, due_date, status, installation_id").eq("workspace_id", workspaceId!).order("due_date", { ascending: true }),
    ]);

    const leads = leadsRes.data || [];
    const installations = installationsRes.data || [];
    const installments = installmentsRes.data || [];

    // Recent leads
    setRecentLeads(leads.slice(0, 5));

    // Total kWp
    const kwp = installations.reduce((sum, i) => sum + (Number(i.power_kwp) || 0), 0);
    setTotalKwp(kwp);

    // Financial summary
    const received = installments.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
    const pending = installments.filter(i => i.status === "pending").reduce((sum, i) => sum + Number(i.amount), 0);
    const overdueItems = installments.filter(i => i.status === "pending" && isBefore(parseISO(i.due_date), today));
    const overdue = overdueItems.reduce((sum, i) => sum + Number(i.amount), 0);
    setFinancialSummary({ received, pending, overdue, overdueCount: overdueItems.length });

    // Upcoming installments (next 5 pending)
    const upcoming = installments
      .filter(i => i.status === "pending")
      .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
      .slice(0, 5);
    setUpcomingInstallments(upcoming);

    // Monthly chart
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = today.getFullYear();

    const monthlyStats = months.map((month, index) => {
      const monthLeads = leads.filter(l => { const d = new Date(l.created_at); return d.getMonth() === index && d.getFullYear() === currentYear; }).length;
      const monthInstallations = installations.filter(i => { const d = new Date(i.created_at); return d.getMonth() === index && d.getFullYear() === currentYear; }).length;
      return { name: month, leads: monthLeads, instalacoes: monthInstallations };
    });
    setMonthlyData(monthlyStats);

    // Conversion funnel
    const statusCounts = {
      new: leads.filter(l => l.status === 'new').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      proposal: leads.filter(l => l.status === 'proposal').length,
      negotiation: leads.filter(l => l.status === 'negotiation').length,
      closed: leads.filter(l => l.status === 'closed').length,
    };
    setConversionData([
      { name: 'Novos', value: statusCounts.new, fill: 'hsl(var(--primary))' },
      { name: 'Qualificados', value: statusCounts.qualified, fill: 'hsl(var(--chart-2))' },
      { name: 'Proposta', value: statusCounts.proposal, fill: 'hsl(var(--chart-3))' },
      { name: 'Negociação', value: statusCounts.negotiation, fill: 'hsl(var(--chart-4))' },
      { name: 'Fechados', value: statusCounts.closed, fill: 'hsl(var(--chart-5))' },
    ]);

    // Installation status
    setStatusData([
      { name: 'Projeto', value: installations.filter(i => i.status === 'project').length },
      { name: 'Aprovação', value: installations.filter(i => i.status === 'approval').length },
      { name: 'Instalação', value: installations.filter(i => i.status === 'installation').length },
      { name: 'Vistoria', value: installations.filter(i => i.status === 'inspection').length },
      { name: 'Ativo', value: installations.filter(i => i.status === 'active').length },
    ]);

    // Revenue data
    const revenueByMonth = months.map((month, index) => {
      const paid = installments.filter(inst => { const d = parseISO(inst.due_date); return d.getMonth() === index && d.getFullYear() === currentYear && inst.status === 'paid'; }).reduce((sum, inst) => sum + Number(inst.amount), 0);
      const pendingM = installments.filter(inst => { const d = parseISO(inst.due_date); return d.getMonth() === index && d.getFullYear() === currentYear && inst.status === 'pending'; }).reduce((sum, inst) => sum + Number(inst.amount), 0);
      return { name: month, recebido: paid, pendente: pendingM };
    });
    setRevenueData(revenueByMonth);
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.recebido, 0);
  const conversionRate = stats.leads > 0 ? ((stats.installations / stats.leads) * 100).toFixed(1) : "0";
  const formatCurrency = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      <TrialBanner />

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}! ☀️
        </h1>
        <p className="text-muted-foreground text-lg">
          {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())} — Aqui está o resumo do seu negócio.
        </p>
      </motion.div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Leads", value: stats.leads.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Clientes", value: stats.clients.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Instalações", value: stats.installations.toString(), icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { label: "Potência Total", value: `${totalKwp.toFixed(1)} kWp`, icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Conversão", value: `${conversionRate}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Receita", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Financial Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-4">
              <div className="p-5 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Recebido</p>
                </div>
                <p className="text-xl font-bold text-emerald-500">{formatCurrency(financialSummary.received)}</p>
              </div>
              <div className="p-5 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">A Receber</p>
                </div>
                <p className="text-xl font-bold text-primary">{formatCurrency(financialSummary.pending)}</p>
              </div>
              <div className="p-5 border-b md:border-b-0 md:border-r border-border">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="text-xs text-muted-foreground">Inadimplente</p>
                </div>
                <p className="text-xl font-bold text-destructive">{formatCurrency(financialSummary.overdue)}</p>
                {financialSummary.overdueCount > 0 && (
                  <p className="text-xs text-destructive">{financialSummary.overdueCount} parcela(s)</p>
                )}
              </div>
              <div className="p-5 flex items-center justify-center">
                <Link to="/financeiro">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart3 className="w-4 h-4" /> Ver Financeiro
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="leads" name="Leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="instalacoes" name="Instalações" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Receita por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [formatCurrency(value), '']} />
                  <Area type="monotone" dataKey="recebido" name="Recebido" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.15)" />
                  <Area type="monotone" dataKey="pendente" name="Pendente" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Funnel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Funil de Conversão</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={conversionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-foreground text-xs">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Installation Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Status das Instalações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={80} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" name="Qtd" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions & recent */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Últimos Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-sm">Nenhum lead ainda.</p>
              ) : (
                recentLeads.map((lead, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {lead.status === 'new' ? 'Novo' : lead.status === 'qualified' ? 'Qualif.' : lead.status === 'proposal' ? 'Proposta' : lead.status === 'negotiation' ? 'Negoc.' : 'Fechado'}
                    </Badge>
                  </div>
                ))
              )}
              <Separator />
              <Link to="/crm">
                <Button variant="ghost" size="sm" className="w-full text-primary">Ver todos os leads →</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming installments */}
      {upcomingInstallments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Próximas Parcelas
              </CardTitle>
              <Link to="/financeiro">
                <Button variant="ghost" size="sm" className="text-primary">Ver todas →</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {upcomingInstallments.map(inst => {
                  const isOverdue = isBefore(parseISO(inst.due_date), today);
                  const daysInfo = isOverdue
                    ? `Vencido há ${differenceInDays(today, parseISO(inst.due_date))}d`
                    : `Vence em ${differenceInDays(parseISO(inst.due_date), today)}d`;
                  return (
                    <div key={inst.installation_id + inst.due_date} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Parcela · {format(parseISO(inst.due_date), "dd/MM/yyyy")}</p>
                        <p className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>{daysInfo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{formatCurrency(Number(inst.amount))}</span>
                        {isOverdue ? (
                          <Badge variant="destructive">Vencido</Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  );
}
