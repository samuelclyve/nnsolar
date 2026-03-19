import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap, Sun, Thermometer, Activity, Battery, ArrowUpRight,
  ArrowDownRight, RefreshCw, Loader2, AlertCircle, Settings,
  BarChart3, Clock, Wifi, WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

interface Inverter {
  id: string;
  inverter_id: string;
  inverter_sn: string;
  station_id: string | null;
  station_name: string | null;
  inverter_model: string | null;
  last_data: any;
  last_synced_at: string | null;
  is_active: boolean;
}

export default function Monitoring() {
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [selectedInverter, setSelectedInverter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [dayData, setDayData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [hasCredentials, setHasCredentials] = useState(true);
  const [historyTab, setHistoryTab] = useState("day");

  useEffect(() => {
    if (workspaceId) loadInverters();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedInverter) refreshInverterData();
  }, [selectedInverter]);

  const loadInverters = async () => {
    setLoading(true);
    const { data: creds } = await supabase
      .from("solis_credentials")
      .select("id")
      .eq("workspace_id", workspaceId!)
      .maybeSingle();

    if (!creds) {
      setHasCredentials(false);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("solis_inverters")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .eq("is_active", true)
      .order("inverter_sn");

    if (data && data.length > 0) {
      setInverters(data as Inverter[]);
      setSelectedInverter(data[0].inverter_sn);
    }
    setLoading(false);
  };

  const refreshInverterData = useCallback(async () => {
    if (!selectedInverter || !workspaceId) return;
    setRefreshing(true);

    const inv = inverters.find((i) => i.inverter_sn === selectedInverter);
    if (!inv) { setRefreshing(false); return; }

    try {
      const [detailResp, dayResp, monthResp] = await Promise.all([
        supabase.functions.invoke("solis-proxy", {
          body: { action: "inverterDetail", workspace_id: workspaceId, inverterId: inv.inverter_id, inverterSn: inv.inverter_sn, stationId: inv.station_id },
        }),
        supabase.functions.invoke("solis-proxy", {
          body: { action: "inverterDay", workspace_id: workspaceId, inverterId: inv.inverter_id, inverterSn: inv.inverter_sn },
        }),
        supabase.functions.invoke("solis-proxy", {
          body: { action: "inverterMonth", workspace_id: workspaceId, inverterId: inv.inverter_id, inverterSn: inv.inverter_sn },
        }),
      ]);

      if (detailResp.data?.success) {
        setDetail(detailResp.data.data);
      }

      if (dayResp.data?.success && dayResp.data?.data) {
        const records = dayResp.data.data || [];
        setDayData(
          Array.isArray(records)
            ? records.map((r: any) => ({ time: r.dataTimestamp ? new Date(r.dataTimestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "", power: r.pac ? Math.round(r.pac * 1000) : 0 }))
            : []
        );
      }

      if (monthResp.data?.success && monthResp.data?.data) {
        const records = monthResp.data.data || [];
        setMonthData(
          Array.isArray(records)
            ? records.map((r: any) => ({ day: r.dataTimestamp ? new Date(r.dataTimestamp).getDate() : "", energy: r.energy || 0 }))
            : []
        );
      }
    } catch (e: any) {
      toast({ title: "Erro ao buscar dados", description: e.message, variant: "destructive" });
    }

    setRefreshing(false);
  }, [selectedInverter, workspaceId, inverters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasCredentials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Monitoramento não configurado</h2>
        <p className="text-muted-foreground max-w-md">
          Configure suas credenciais de monitoramento na página de Integrações para começar a acompanhar seus inversores.
        </p>
        <Link to="/integrations">
          <Button className="gap-2">
            <Settings className="w-4 h-4" /> Configurar Integrações
          </Button>
        </Link>
      </div>
    );
  }

  if (inverters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Zap className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Nenhum inversor encontrado</h2>
        <p className="text-muted-foreground max-w-md">
          Sincronize seus inversores na página de Integrações para que apareçam aqui.
        </p>
        <Link to="/integrations">
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" /> Ir para Integrações
          </Button>
        </Link>
      </div>
    );
  }

  const currentPower = detail ? Math.round((detail.pac || 0) * 1000) : 0;
  const todayEnergy = detail ? (detail.eToday || 0) : 0;
  const monthEnergy = detail ? (detail.eMonth || 0) : 0;
  const totalEnergy = detail ? (detail.eTotal || 0) : 0;
  const temperature = detail ? (detail.inverterTemperature || 0) : 0;
  const batterySOC = detail?.batteryCapacitySoc || null;
  const gridPower = detail ? Math.round((detail.psum || 0) * 1000) : 0;
  const familyLoad = detail ? Math.round((detail.familyLoadPower || 0) * 1000) : 0;
  const dcVoltage = detail ? ((detail.uPv1 || 0) + (detail.uPv2 || 0) + (detail.uPv3 || 0) + (detail.uPv4 || 0)).toFixed(1) : "0";
  const acVoltage = detail ? Math.max(detail.uAc1 || 0, detail.uAc2 || 0, detail.uAc3 || 0).toFixed(1) : "0";
  const isOnline = detail?.state === 1;

  const selectedInv = inverters.find((i) => i.inverter_sn === selectedInverter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoramento Solar</h1>
          <p className="text-muted-foreground">Acompanhe em tempo real a geração dos seus inversores</p>
        </div>
        <div className="flex items-center gap-3">
          {inverters.length > 1 && (
            <Select value={selectedInverter || ""} onValueChange={setSelectedInverter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecionar inversor" />
              </SelectTrigger>
              <SelectContent>
                {inverters.map((inv) => (
                  <SelectItem key={inv.inverter_sn} value={inv.inverter_sn}>
                    {inv.inverter_sn} {inv.station_name ? `(${inv.station_name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" onClick={refreshInverterData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* System Badge */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <Zap className="w-3.5 h-3.5 text-primary" />
          SolisCloud
        </Badge>
        {selectedInv?.inverter_model && (
          <Badge variant="secondary">{selectedInv.inverter_model}</Badge>
        )}
        <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
        {selectedInv?.last_synced_at && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Atualizado: {new Date(selectedInv.last_synced_at).toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Potência Atual</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{currentPower} <span className="text-sm font-normal text-muted-foreground">W</span></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Energia Hoje</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{todayEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-success" />
                <span className="text-xs text-muted-foreground">Energia Mês</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{monthEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground">Total Gerado</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalEnergy >= 1000 ? (totalEnergy / 1000).toFixed(1) : totalEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{totalEnergy >= 1000 ? "MWh" : "kWh"}</span></p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Thermometer className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Temperatura</p>
            <p className="text-lg font-bold">{temperature}°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <ArrowUpRight className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Tensão DC</p>
            <p className="text-lg font-bold">{dcVoltage} V</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <ArrowDownRight className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Tensão AC</p>
            <p className="text-lg font-bold">{acVoltage} V</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Activity className="w-4 h-4 text-secondary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Rede</p>
            <p className="text-lg font-bold">{gridPower} W</p>
          </CardContent>
        </Card>
        {batterySOC !== null && (
          <Card>
            <CardContent className="p-3 text-center">
              <Battery className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Bateria</p>
              <p className="text-lg font-bold">{batterySOC}%</p>
            </CardContent>
          </Card>
        )}
        {batterySOC === null && (
          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Consumo</p>
              <p className="text-lg font-bold">{familyLoad} W</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <Tabs value={historyTab} onValueChange={setHistoryTab}>
        <TabsList>
          <TabsTrigger value="day">Hoje</TabsTrigger>
          <TabsTrigger value="month">Mês</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Geração ao Longo do Dia (W)</CardTitle>
            </CardHeader>
            <CardContent>
              {dayData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dayData}>
                    <defs>
                      <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="power" stroke="hsl(var(--primary))" fill="url(#powerGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {refreshing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sem dados disponíveis para hoje"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Energia Diária no Mês (kWh)</CardTitle>
            </CardHeader>
            <CardContent>
              {monthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="energy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  {refreshing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sem dados disponíveis para o mês"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
