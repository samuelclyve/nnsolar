import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, Clock, Calendar, Receipt, ArrowUpRight,
  ArrowDownRight, Filter, Search, Eye, FileText, Ban
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { format, differenceInDays, startOfMonth, endOfMonth, parseISO, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from "recharts";

interface Installment {
  id: string;
  installation_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string | null;
  payment_proof_url: string | null;
  workspace_id: string | null;
}

interface InstallationInfo {
  id: string;
  client_name: string;
  power_kwp: number | null;
  status: string | null;
}

export default function Financeiro() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installations, setInstallations] = useState<InstallationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { workspaceId, isLoading: wsLoading } = useWorkspace();

  useEffect(() => {
    if (wsLoading) return;
    if (workspaceId) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [workspaceId, wsLoading]);

  const fetchData = async () => {
    const [installmentsRes, installationsRes] = await Promise.all([
      supabase
        .from("client_installments")
        .select("*")
        .eq("workspace_id", workspaceId!)
        .order("due_date", { ascending: true }),
      supabase
        .from("installations")
        .select("id, client_name, power_kwp, status")
        .eq("workspace_id", workspaceId!),
    ]);
    setInstallments(installmentsRes.data || []);
    setInstallations(installationsRes.data || []);
    setIsLoading(false);
  };

  const getClientName = (installationId: string) => {
    return installations.find(i => i.id === installationId)?.client_name || "—";
  };

  const getPowerKwp = (installationId: string) => {
    return installations.find(i => i.id === installationId)?.power_kwp || 0;
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Financial calculations
  const totalReceivable = installments.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalReceived = installments.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
  const totalPending = installments.filter(i => i.status === "pending").reduce((sum, i) => sum + Number(i.amount), 0);
  const totalOverdue = installments.filter(i => {
    return i.status === "pending" && isBefore(parseISO(i.due_date), today);
  }).reduce((sum, i) => sum + Number(i.amount), 0);
  const overdueCount = installments.filter(i => i.status === "pending" && isBefore(parseISO(i.due_date), today)).length;

  // This month
  const thisMonthInstallments = installments.filter(i => {
    const d = parseISO(i.due_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthReceived = thisMonthInstallments.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
  const thisMonthPending = thisMonthInstallments.filter(i => i.status === "pending").reduce((sum, i) => sum + Number(i.amount), 0);

  // Collection rate
  const collectionRate = totalReceivable > 0 ? ((totalReceived / totalReceivable) * 100).toFixed(1) : "0";

  // Average ticket per installation
  const uniqueInstallationIds = [...new Set(installments.map(i => i.installation_id))];
  const avgTicket = uniqueInstallationIds.length > 0 ? totalReceivable / uniqueInstallationIds.length : 0;

  // Monthly chart data
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthlyChartData = months.map((month, index) => {
    const monthInstallments = installments.filter(i => {
      const d = parseISO(i.due_date);
      return d.getMonth() === index && d.getFullYear() === currentYear;
    });
    const received = monthInstallments.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
    const pending = monthInstallments.filter(i => i.status === "pending" && !isBefore(parseISO(i.due_date), today)).reduce((sum, i) => sum + Number(i.amount), 0);
    const overdue = monthInstallments.filter(i => i.status === "pending" && isBefore(parseISO(i.due_date), today)).reduce((sum, i) => sum + Number(i.amount), 0);
    return { name: month, recebido: received, pendente: pending, vencido: overdue };
  });

  // Status distribution for pie chart
  const statusDistribution = [
    { name: "Recebido", value: totalReceived, fill: "hsl(142 76% 36%)" },
    { name: "Pendente", value: totalPending - totalOverdue, fill: "hsl(var(--primary))" },
    { name: "Vencido", value: totalOverdue, fill: "hsl(0 84% 60%)" },
  ].filter(d => d.value > 0);

  // Cumulative cash flow
  const cumulativeData = months.map((month, index) => {
    const cumulativeReceived = installments
      .filter(i => i.status === "paid" && parseISO(i.due_date).getMonth() <= index && parseISO(i.due_date).getFullYear() === currentYear)
      .reduce((sum, i) => sum + Number(i.amount), 0);
    const cumulativeExpected = installments
      .filter(i => parseISO(i.due_date).getMonth() <= index && parseISO(i.due_date).getFullYear() === currentYear)
      .reduce((sum, i) => sum + Number(i.amount), 0);
    return { name: month, realizado: cumulativeReceived, previsto: cumulativeExpected };
  });

  // Filter installments
  const filteredInstallments = installments.filter(i => {
    const clientName = getClientName(i.installation_id).toLowerCase();
    const matchesSearch = clientName.includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "paid") matchesStatus = i.status === "paid";
    else if (statusFilter === "pending") matchesStatus = i.status === "pending" && !isBefore(parseISO(i.due_date), today);
    else if (statusFilter === "overdue") matchesStatus = i.status === "pending" && isBefore(parseISO(i.due_date), today);

    let matchesPeriod = true;
    if (periodFilter === "this_month") {
      const d = parseISO(i.due_date);
      matchesPeriod = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    } else if (periodFilter === "next_month") {
      const d = parseISO(i.due_date);
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      matchesPeriod = d.getMonth() === nextMonth && d.getFullYear() === nextYear;
    } else if (periodFilter === "overdue_only") {
      matchesPeriod = i.status === "pending" && isBefore(parseISO(i.due_date), today);
    }

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const markAsPaid = async (installment: Installment) => {
    const { error } = await supabase
      .from("client_installments")
      .update({ status: "paid", paid_date: format(today, "yyyy-MM-dd") })
      .eq("id", installment.id);

    if (error) {
      toast.error("Erro ao atualizar parcela");
    } else {
      toast.success("Parcela marcada como paga!");
      fetchData();
      setDetailOpen(false);
    }
  };

  const markAsUnpaid = async (installment: Installment) => {
    const { error } = await supabase
      .from("client_installments")
      .update({ status: "pending", paid_date: null })
      .eq("id", installment.id);

    if (error) {
      toast.error("Erro ao atualizar parcela");
    } else {
      toast.success("Parcela revertida para pendente");
      fetchData();
      setDetailOpen(false);
    }
  };

  const getStatusBadge = (installment: Installment) => {
    if (installment.status === "paid") {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800">Pago</Badge>;
    }
    if (isBefore(parseISO(installment.due_date), today)) {
      const daysOverdue = differenceInDays(today, parseISO(installment.due_date));
      return <Badge variant="destructive">Vencido há {daysOverdue}d</Badge>;
    }
    const daysUntilDue = differenceInDays(parseISO(installment.due_date), today);
    if (daysUntilDue <= 7) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">Vence em {daysUntilDue}d</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Financeiro</h1>
        <p className="text-muted-foreground">Controle completo de receitas, parcelas e inadimplência.</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Recebido",
            value: formatCurrency(totalReceived),
            icon: CheckCircle2,
            trend: `${collectionRate}% recebido`,
            trendUp: true,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
          },
          {
            label: "A Receber",
            value: formatCurrency(totalPending),
            icon: Clock,
            trend: `${installments.filter(i => i.status === "pending").length} parcelas`,
            trendUp: true,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            label: "Inadimplência",
            value: formatCurrency(totalOverdue),
            icon: AlertTriangle,
            trend: `${overdueCount} parcelas vencidas`,
            trendUp: false,
            color: "text-destructive",
            bgColor: "bg-destructive/10",
          },
          {
            label: "Ticket Médio",
            value: formatCurrency(avgTicket),
            icon: Receipt,
            trend: `${uniqueInstallationIds.length} projetos`,
            trendUp: true,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 mb-1 ${stat.trendUp ? stat.color : 'text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </span>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* This month summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {format(today, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                </h3>
              </div>
              <Separator orientation="vertical" className="hidden md:block h-10" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground">Recebido</p>
                  <p className="text-lg font-bold text-emerald-500">{formatCurrency(thisMonthReceived)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pendente</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(thisMonthPending)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Previsto</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(thisMonthReceived + thisMonthPending)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parcelas</p>
                  <p className="text-lg font-bold text-foreground">{thisMonthInstallments.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="installments">Parcelas</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        {/* TAB: Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Revenue by month */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Receita por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [formatCurrency(value), '']} />
                    <Legend />
                    <Bar dataKey="recebido" name="Recebido" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="pendente" name="Pendente" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} stackId="a" />
                    <Bar dataKey="vencido" name="Vencido" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [formatCurrency(value), '']} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary below the chart */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {statusDistribution.map(item => (
                    <div key={item.name} className="text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.fill }} />
                      <p className="text-xs text-muted-foreground">{item.name}</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top clients by revenue */}
            <Card className="border-0 shadow-sm xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Maiores Projetos por Valor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uniqueInstallationIds
                    .map(instId => {
                      const total = installments.filter(i => i.installation_id === instId).reduce((sum, i) => sum + Number(i.amount), 0);
                      const paid = installments.filter(i => i.installation_id === instId && i.status === "paid").reduce((sum, i) => sum + Number(i.amount), 0);
                      const parcelas = installments.filter(i => i.installation_id === instId).length;
                      return { instId, clientName: getClientName(instId), kwp: getPowerKwp(instId), total, paid, parcelas };
                    })
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 8)
                    .map((project, index) => {
                      const progress = project.total > 0 ? (project.paid / project.total) * 100 : 0;
                      return (
                        <div key={project.instId} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{project.clientName}</p>
                              <p className="text-xs text-muted-foreground">{project.kwp} kWp · {project.parcelas} parcelas</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden md:block w-32">
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                              <p className="text-[10px] text-muted-foreground text-right mt-0.5">{progress.toFixed(0)}% recebido</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-foreground">{formatCurrency(project.total)}</p>
                              <p className="text-xs text-emerald-500">{formatCurrency(project.paid)} recebido</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {uniqueInstallationIds.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Nenhum projeto financeiro registrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Installments */}
        <TabsContent value="installments">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full md:w-44">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                <SelectItem value="this_month">Este mês</SelectItem>
                <SelectItem value="next_month">Próximo mês</SelectItem>
                <SelectItem value="overdue_only">Apenas vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Installments list */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {filteredInstallments.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Nenhuma parcela encontrada.</p>
              ) : (
                <div className="divide-y divide-border">
                  {filteredInstallments.map(inst => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => { setSelectedInstallment(inst); setDetailOpen(true); }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          inst.status === "paid" ? "bg-emerald-500/10" : isBefore(parseISO(inst.due_date), today) ? "bg-destructive/10" : "bg-primary/10"
                        }`}>
                          {inst.status === "paid" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isBefore(parseISO(inst.due_date), today) ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : (
                            <Clock className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{getClientName(inst.installation_id)}</p>
                          <p className="text-xs text-muted-foreground">Parcela {inst.installment_number} · Vence {format(parseISO(inst.due_date), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground">{formatCurrency(Number(inst.amount))}</p>
                          {inst.paid_date && <p className="text-[10px] text-emerald-500">Pago em {format(parseISO(inst.paid_date), "dd/MM")}</p>}
                        </div>
                        {getStatusBadge(inst)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Cash Flow */}
        <TabsContent value="cashflow">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Fluxo de Caixa Acumulado — {currentYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [formatCurrency(value), '']} />
                    <Legend />
                    <Area type="monotone" dataKey="previsto" name="Previsto" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted)/0.3)" strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="realizado" name="Realizado" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.15)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aging Analysis */}
            <Card className="border-0 shadow-sm xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Análise de Inadimplência
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overdueCount === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-foreground">Nenhuma parcela vencida!</p>
                    <p className="text-muted-foreground text-sm">Todos os pagamentos estão em dia.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Aging buckets */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "1-15 dias", min: 1, max: 15 },
                        { label: "16-30 dias", min: 16, max: 30 },
                        { label: "31-60 dias", min: 31, max: 60 },
                        { label: "+60 dias", min: 61, max: 9999 },
                      ].map(bucket => {
                        const bucketInstallments = installments.filter(i => {
                          if (i.status !== "pending") return false;
                          const days = differenceInDays(today, parseISO(i.due_date));
                          return days >= bucket.min && days <= bucket.max;
                        });
                        const bucketTotal = bucketInstallments.reduce((sum, i) => sum + Number(i.amount), 0);
                        return (
                          <div key={bucket.label} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                            <p className="text-xs text-muted-foreground mb-1">{bucket.label}</p>
                            <p className="text-lg font-bold text-destructive">{formatCurrency(bucketTotal)}</p>
                            <p className="text-xs text-muted-foreground">{bucketInstallments.length} parcela(s)</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overdue list */}
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {installments
                        .filter(i => i.status === "pending" && isBefore(parseISO(i.due_date), today))
                        .sort((a, b) => parseISO(a.due_date).getTime() - parseISO(b.due_date).getTime())
                        .slice(0, 10)
                        .map(inst => (
                          <div key={inst.id} className="flex items-center justify-between p-3 hover:bg-muted/30">
                            <div>
                              <p className="font-medium text-foreground text-sm">{getClientName(inst.installation_id)}</p>
                              <p className="text-xs text-destructive">Venceu em {format(parseISO(inst.due_date), "dd/MM/yyyy")} — {differenceInDays(today, parseISO(inst.due_date))} dias</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-bold text-sm text-destructive">{formatCurrency(Number(inst.amount))}</p>
                              <Button size="sm" variant="outline" onClick={() => markAsPaid(inst)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Dar baixa
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Installment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Parcela</DialogTitle>
          </DialogHeader>
          {selectedInstallment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Cliente</Label>
                  <p className="font-medium text-foreground">{getClientName(selectedInstallment.installation_id)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Potência</Label>
                  <p className="font-medium text-foreground">{getPowerKwp(selectedInstallment.installation_id)} kWp</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Parcela</Label>
                  <p className="font-medium text-foreground">{selectedInstallment.installment_number}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor</Label>
                  <p className="font-bold text-foreground text-lg">{formatCurrency(Number(selectedInstallment.amount))}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vencimento</Label>
                  <p className="font-medium text-foreground">{format(parseISO(selectedInstallment.due_date), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedInstallment)}</div>
                </div>
                {selectedInstallment.paid_date && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Data do Pagamento</Label>
                    <p className="font-medium text-emerald-500">{format(parseISO(selectedInstallment.paid_date), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex gap-2">
                {selectedInstallment.status === "pending" ? (
                  <Button className="flex-1" onClick={() => markAsPaid(selectedInstallment)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Pago
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" onClick={() => markAsUnpaid(selectedInstallment)}>
                    <Ban className="w-4 h-4 mr-2" /> Reverter para Pendente
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
