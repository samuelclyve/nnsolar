import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileDown, FileSpreadsheet, Calendar, TrendingUp,
  Users, Wrench, DollarSign, BarChart3, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from "recharts";

interface ReportData {
  leads: any[];
  installations: any[];
  installments: any[];
  profiles: any[];
}

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))"
];

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function Reports() {
  const [data, setData] = useState<ReportData>({ leads: [], installations: [], installments: [], profiles: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("year");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();

  useEffect(() => {
    if (workspaceId) fetchData();
  }, [workspaceId, period, year]);

  const fetchData = async () => {
    setIsLoading(true);
    const [leadsRes, installationsRes, installmentsRes, profilesRes] = await Promise.all([
      supabase.from("leads").select("*").eq("workspace_id", workspaceId!),
      supabase.from("installations").select("*").eq("workspace_id", workspaceId!),
      supabase.from("client_installments").select("*").eq("workspace_id", workspaceId!),
      supabase.from("profiles").select("*"),
    ]);
    setData({
      leads: leadsRes.data || [],
      installations: installationsRes.data || [],
      installments: installmentsRes.data || [],
      profiles: profilesRes.data || [],
    });
    setIsLoading(false);
  };

  const filterByYear = (items: any[], dateField: string) => {
    const y = parseInt(year);
    return items.filter(i => new Date(i[dateField]).getFullYear() === y);
  };

  // Sales report data
  const salesMonthly = months.map((m, idx) => {
    const y = parseInt(year);
    const monthLeads = data.leads.filter(l => {
      const d = new Date(l.created_at);
      return d.getMonth() === idx && d.getFullYear() === y;
    });
    const closed = monthLeads.filter(l => l.status === "closed").length;
    return { name: m, novos: monthLeads.length, fechados: closed };
  });

  const totalLeads = filterByYear(data.leads, "created_at").length;
  const closedLeads = filterByYear(data.leads, "created_at").filter(l => l.status === "closed").length;
  const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : "0";

  // Installations report data
  const installationsMonthly = months.map((m, idx) => {
    const y = parseInt(year);
    const monthInst = data.installations.filter(i => {
      const d = new Date(i.created_at);
      return d.getMonth() === idx && d.getFullYear() === y;
    });
    return {
      name: m,
      total: monthInst.length,
      concluidas: monthInst.filter(i => i.status === "active").length,
    };
  });

  const installationsByStatus = [
    { name: "Projeto", value: data.installations.filter(i => i.status === "project").length },
    { name: "Aprovação", value: data.installations.filter(i => i.status === "approval").length },
    { name: "Instalação", value: data.installations.filter(i => i.status === "installation").length },
    { name: "Vistoria", value: data.installations.filter(i => i.status === "inspection").length },
    { name: "Ativo", value: data.installations.filter(i => i.status === "active").length },
  ];

  const totalKwp = data.installations.reduce((sum, i) => sum + (Number(i.power_kwp) || 0), 0);

  // Financial report data
  const financialMonthly = months.map((m, idx) => {
    const y = parseInt(year);
    const monthInst = data.installments.filter(inst => {
      const d = new Date(inst.due_date);
      return d.getMonth() === idx && d.getFullYear() === y;
    });
    return {
      name: m,
      recebido: monthInst.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0),
      pendente: monthInst.filter(i => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0),
      vencido: monthInst.filter(i => i.status === "overdue" || (i.status === "pending" && new Date(i.due_date) < new Date())).reduce((s, i) => s + Number(i.amount), 0),
    };
  });

  const totalReceived = data.installments.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = data.installments.filter(i => i.status === "pending").reduce((s, i) => s + Number(i.amount), 0);

  // Team performance
  const teamPerformance = (() => {
    const techMap = new Map<string, { name: string; installations: number; completed: number }>();
    data.installations.forEach(inst => {
      if (!inst.assigned_technician) return;
      const profile = data.profiles.find(p => p.id === inst.assigned_technician);
      const name = profile?.full_name || "Sem nome";
      const existing = techMap.get(inst.assigned_technician) || { name, installations: 0, completed: 0 };
      existing.installations++;
      if (inst.status === "active") existing.completed++;
      techMap.set(inst.assigned_technician, existing);
    });

    const sellerMap = new Map<string, { name: string; leads: number; closed: number }>();
    data.leads.forEach(lead => {
      if (!lead.assigned_to) return;
      const profile = data.profiles.find(p => p.id === lead.assigned_to);
      const name = profile?.full_name || "Sem nome";
      const existing = sellerMap.get(lead.assigned_to) || { name, leads: 0, closed: 0 };
      existing.leads++;
      if (lead.status === "closed") existing.closed++;
      sellerMap.set(lead.assigned_to, existing);
    });

    return {
      technicians: Array.from(techMap.values()),
      sellers: Array.from(sellerMap.values()),
    };
  })();

  // Export functions
  const exportPDF = async (reportType: string) => {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF() as any;
    
    doc.setFontSize(18);
    doc.text(`Relatório de ${reportType}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} | Ano: ${year}`, 14, 30);

    if (reportType === "Vendas") {
      doc.autoTable({
        startY: 40,
        head: [["Mês", "Novos Leads", "Fechados"]],
        body: salesMonthly.map(row => [row.name, row.novos, row.fechados]),
        styles: { fontSize: 9 },
      });
      doc.text(`Taxa de Conversão: ${conversionRate}%`, 14, doc.lastAutoTable.finalY + 10);
    } else if (reportType === "Instalações") {
      doc.autoTable({
        startY: 40,
        head: [["Mês", "Total", "Concluídas"]],
        body: installationsMonthly.map(row => [row.name, row.total, row.concluidas]),
        styles: { fontSize: 9 },
      });
      doc.text(`Potência Total: ${totalKwp.toFixed(1)} kWp`, 14, doc.lastAutoTable.finalY + 10);
    } else if (reportType === "Financeiro") {
      doc.autoTable({
        startY: 40,
        head: [["Mês", "Recebido (R$)", "Pendente (R$)", "Vencido (R$)"]],
        body: financialMonthly.map(row => [
          row.name,
          row.recebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          row.pendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          row.vencido.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        ]),
        styles: { fontSize: 9 },
      });
    } else if (reportType === "Equipe") {
      if (teamPerformance.sellers.length > 0) {
        doc.text("Vendedores", 14, 38);
        doc.autoTable({
          startY: 42,
          head: [["Nome", "Leads", "Fechados", "Conversão"]],
          body: teamPerformance.sellers.map(s => [
            s.name, s.leads, s.closed, s.leads > 0 ? `${((s.closed / s.leads) * 100).toFixed(0)}%` : "0%"
          ]),
          styles: { fontSize: 9 },
        });
      }
      if (teamPerformance.technicians.length > 0) {
        const startY = teamPerformance.sellers.length > 0 ? doc.lastAutoTable.finalY + 15 : 42;
        doc.text("Técnicos", 14, startY - 4);
        doc.autoTable({
          startY,
          head: [["Nome", "Instalações", "Concluídas", "Taxa"]],
          body: teamPerformance.technicians.map(t => [
            t.name, t.installations, t.completed,
            t.installations > 0 ? `${((t.completed / t.installations) * 100).toFixed(0)}%` : "0%"
          ]),
          styles: { fontSize: 9 },
        });
      }
    }

    doc.save(`relatorio-${reportType.toLowerCase()}-${year}.pdf`);
    toast({ title: "PDF exportado com sucesso!" });
  };

  const exportExcel = async (reportType: string) => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    let ws;

    if (reportType === "Vendas") {
      ws = XLSX.utils.json_to_sheet(salesMonthly.map(r => ({ Mês: r.name, "Novos Leads": r.novos, Fechados: r.fechados })));
    } else if (reportType === "Instalações") {
      ws = XLSX.utils.json_to_sheet(installationsMonthly.map(r => ({ Mês: r.name, Total: r.total, Concluídas: r.concluidas })));
    } else if (reportType === "Financeiro") {
      ws = XLSX.utils.json_to_sheet(financialMonthly.map(r => ({
        Mês: r.name, "Recebido (R$)": r.recebido, "Pendente (R$)": r.pendente, "Vencido (R$)": r.vencido
      })));
    } else {
      const sellersData = teamPerformance.sellers.map(s => ({
        Tipo: "Vendedor", Nome: s.name, Leads: s.leads, Fechados: s.closed,
        Conversão: s.leads > 0 ? `${((s.closed / s.leads) * 100).toFixed(0)}%` : "0%"
      }));
      const techData = teamPerformance.technicians.map(t => ({
        Tipo: "Técnico", Nome: t.name, Instalações: t.installations, Concluídas: t.completed,
        Taxa: t.installations > 0 ? `${((t.completed / t.installations) * 100).toFixed(0)}%` : "0%"
      }));
      ws = XLSX.utils.json_to_sheet([...sellersData, ...techData]);
    }

    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, `relatorio-${reportType.toLowerCase()}-${year}.xlsx`);
    toast({ title: "Excel exportado com sucesso!" });
  };

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  if (isLoading) {
    return (
      <AppLayout title="Relatórios">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatórios">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Análises detalhadas do seu negócio com exportação em PDF e Excel.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-32">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="vendas" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="vendas" className="gap-1.5"><TrendingUp className="w-4 h-4" />Vendas</TabsTrigger>
          <TabsTrigger value="instalacoes" className="gap-1.5"><Wrench className="w-4 h-4" />Instalações</TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1.5"><DollarSign className="w-4 h-4" />Financeiro</TabsTrigger>
          <TabsTrigger value="equipe" className="gap-1.5"><Users className="w-4 h-4" />Equipe</TabsTrigger>
        </TabsList>

        {/* VENDAS */}
        <TabsContent value="vendas" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportPDF("Vendas")}>
              <FileDown className="w-4 h-4 mr-1" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel("Vendas")}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Total de Leads</p>
                <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Leads Fechados</p>
                <p className="text-3xl font-bold text-primary">{closedLeads}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-foreground">{conversionRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>Leads por Mês</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesMonthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="novos" name="Novos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fechados" name="Fechados" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INSTALAÇÕES */}
        <TabsContent value="instalacoes" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportPDF("Instalações")}>
              <FileDown className="w-4 h-4 mr-1" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel("Instalações")}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Total de Instalações</p>
                <p className="text-3xl font-bold text-foreground">{data.installations.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Concluídas</p>
                <p className="text-3xl font-bold text-primary">{data.installations.filter(i => i.status === "active").length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Potência Total</p>
                <p className="text-3xl font-bold text-foreground">{totalKwp.toFixed(1)} kWp</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Instalações por Mês</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={installationsMonthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="total" name="Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4 }} />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Por Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={installationsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {installationsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportPDF("Financeiro")}>
              <FileDown className="w-4 h-4 mr-1" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel("Financeiro")}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                <p className="text-3xl font-bold text-primary">R$ {totalReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Pendente</p>
                <p className="text-3xl font-bold text-foreground">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground mb-1">Total Parcelas</p>
                <p className="text-3xl font-bold text-foreground">{data.installments.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle>Receita por Mês</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financialMonthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={chartTooltipStyle}
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, ""]} />
                  <Area type="monotone" dataKey="recebido" name="Recebido" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                  <Area type="monotone" dataKey="pendente" name="Pendente" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3)/0.2)" />
                  <Area type="monotone" dataKey="vencido" name="Vencido" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.15)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EQUIPE */}
        <TabsContent value="equipe" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => exportPDF("Equipe")}>
              <FileDown className="w-4 h-4 mr-1" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportExcel("Equipe")}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Performance de Vendedores</CardTitle></CardHeader>
              <CardContent>
                {teamPerformance.sellers.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">Nenhum vendedor com leads atribuídos.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance.sellers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="leads" name="Leads" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="closed" name="Fechados" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Performance de Técnicos</CardTitle></CardHeader>
              <CardContent>
                {teamPerformance.technicians.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">Nenhum técnico com instalações atribuídas.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teamPerformance.technicians} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="installations" name="Instalações" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="completed" name="Concluídas" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
