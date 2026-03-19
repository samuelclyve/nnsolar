import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap, Sun, Thermometer, Activity, Battery, ArrowUpRight,
  ArrowDownRight, RefreshCw, Loader2, AlertCircle, Settings,
  BarChart3, Clock, Wifi, WifiOff, Leaf
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

type SystemType = "solis" | "growatt";

interface MonitorDevice {
  id: string;
  sn: string;
  stationId: string | null;
  stationName: string | null;
  model: string | null;
  lastData: any;
  lastSyncedAt: string | null;
  isActive: boolean;
  system: SystemType;
}

export default function Monitoring() {
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();
  const [devices, setDevices] = useState<MonitorDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [dayData, setDayData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [hasCredentials, setHasCredentials] = useState(true);
  const [historyTab, setHistoryTab] = useState("day");

  useEffect(() => {
    if (workspaceId) loadDevices();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedDevice) refreshDeviceData();
  }, [selectedDevice]);

  const loadDevices = async () => {
    setLoading(true);

    const [solisCreds, growattCreds, solisInverters, growattInverters] = await Promise.all([
      supabase.from("solis_credentials").select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("growatt_credentials").select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("solis_inverters").select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("inverter_sn"),
      supabase.from("growatt_inverters").select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("device_sn"),
    ]);

    if (!solisCreds.data && !growattCreds.data) {
      setHasCredentials(false);
      setLoading(false);
      return;
    }

    const allDevices: MonitorDevice[] = [];

    (solisInverters.data || []).forEach((inv: any) => {
      allDevices.push({
        id: inv.id, sn: inv.inverter_sn, stationId: inv.station_id, stationName: inv.station_name,
        model: inv.inverter_model, lastData: inv.last_data, lastSyncedAt: inv.last_synced_at,
        isActive: inv.is_active, system: "solis",
      });
    });

    (growattInverters.data || []).forEach((dev: any) => {
      allDevices.push({
        id: dev.id, sn: dev.device_sn, stationId: dev.plant_id, stationName: dev.plant_name,
        model: dev.device_model, lastData: dev.last_data, lastSyncedAt: dev.last_synced_at,
        isActive: dev.is_active, system: "growatt",
      });
    });

    setDevices(allDevices);
    if (allDevices.length > 0) setSelectedDevice(allDevices[0].sn);
    setLoading(false);
  };

  const refreshDeviceData = useCallback(async () => {
    if (!selectedDevice || !workspaceId) return;
    setRefreshing(true);

    const dev = devices.find((d) => d.sn === selectedDevice);
    if (!dev) { setRefreshing(false); return; }

    try {
      if (dev.system === "solis") {
        await refreshSolisData(dev);
      } else {
        await refreshGrowattData(dev);
      }
    } catch (e: any) {
      toast({ title: "Erro ao buscar dados", description: e.message, variant: "destructive" });
    }

    setRefreshing(false);
  }, [selectedDevice, workspaceId, devices]);

  const refreshSolisData = async (dev: MonitorDevice) => {
    const [detailResp, dayResp, monthResp] = await Promise.all([
      supabase.functions.invoke("solis-proxy", { body: { action: "inverterDetail", workspace_id: workspaceId, inverterId: dev.stationId ? undefined : dev.sn, inverterSn: dev.sn, stationId: dev.stationId } }),
      supabase.functions.invoke("solis-proxy", { body: { action: "inverterDay", workspace_id: workspaceId, inverterId: dev.stationId ? undefined : dev.sn, inverterSn: dev.sn } }),
      supabase.functions.invoke("solis-proxy", { body: { action: "inverterMonth", workspace_id: workspaceId, inverterId: dev.stationId ? undefined : dev.sn, inverterSn: dev.sn } }),
    ]);

    if (detailResp.data?.success) setDetail({ ...detailResp.data.data, _system: "solis" });

    if (dayResp.data?.success && dayResp.data?.data) {
      const records = dayResp.data.data || [];
      setDayData(Array.isArray(records)
        ? records.map((r: any) => ({ time: r.dataTimestamp ? new Date(r.dataTimestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "", power: r.pac ? Math.round(r.pac * 1000) : 0 }))
        : []);
    }

    if (monthResp.data?.success && monthResp.data?.data) {
      const records = monthResp.data.data || [];
      setMonthData(Array.isArray(records)
        ? records.map((r: any) => ({ day: r.dataTimestamp ? new Date(r.dataTimestamp).getDate() : "", energy: r.energy || 0 }))
        : []);
    }
  };

  const refreshGrowattData = async (dev: MonitorDevice) => {
    const [detailResp, energyDayResp, energyMonthResp] = await Promise.all([
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceDetail", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId } }),
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceEnergy", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId, type: "day" } }),
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceEnergy", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId, type: "month" } }),
    ]);

    if (detailResp.data) {
      const d = detailResp.data?.data || detailResp.data;
      setDetail({ ...d, _system: "growatt" });
    }

    if (energyDayResp.data) {
      const records = energyDayResp.data?.data?.charts || energyDayResp.data?.data || [];
      if (Array.isArray(records)) {
        setDayData(records.map((r: any) => ({
          time: r.time || r.hour || "",
          power: Math.round((r.pac || r.power || r.ppv || 0) * 1000),
        })));
      }
    }

    if (energyMonthResp.data) {
      const records = energyMonthResp.data?.data?.charts || energyMonthResp.data?.data || [];
      if (Array.isArray(records)) {
        setMonthData(records.map((r: any) => ({
          day: r.date || r.day || "",
          energy: r.energy || r.epv || 0,
        })));
      }
    }
  };

  // Extract metrics from detail (normalized for both systems)
  const getMetrics = () => {
    if (!detail) return { currentPower: 0, todayEnergy: 0, monthEnergy: 0, totalEnergy: 0, temperature: 0, dcVoltage: "0", acVoltage: "0", gridPower: 0, familyLoad: 0, batterySOC: null as number | null, isOnline: false };

    if (detail._system === "solis") {
      return {
        currentPower: Math.round((detail.pac || 0) * 1000),
        todayEnergy: detail.eToday || 0,
        monthEnergy: detail.eMonth || 0,
        totalEnergy: detail.eTotal || 0,
        temperature: detail.inverterTemperature || 0,
        dcVoltage: ((detail.uPv1 || 0) + (detail.uPv2 || 0) + (detail.uPv3 || 0) + (detail.uPv4 || 0)).toFixed(1),
        acVoltage: Math.max(detail.uAc1 || 0, detail.uAc2 || 0, detail.uAc3 || 0).toFixed(1),
        gridPower: Math.round((detail.psum || 0) * 1000),
        familyLoad: Math.round((detail.familyLoadPower || 0) * 1000),
        batterySOC: detail.batteryCapacitySoc ?? null,
        isOnline: detail.state === 1,
      };
    }

    // Growatt
    return {
      currentPower: Math.round((detail.pac || detail.ppv || detail.power || 0) * 1000),
      todayEnergy: detail.eToday || detail.epvToday || 0,
      monthEnergy: detail.eMonth || detail.epvMonth || 0,
      totalEnergy: detail.eTotal || detail.epvTotal || 0,
      temperature: detail.temperature || detail.tempperature || 0,
      dcVoltage: (detail.vpv1 || detail.vpv || 0).toFixed ? (detail.vpv1 || detail.vpv || 0).toFixed(1) : "0",
      acVoltage: (detail.vac1 || detail.vac || 0).toFixed ? (detail.vac1 || detail.vac || 0).toFixed(1) : "0",
      gridPower: Math.round((detail.pGrid || detail.pgrid || 0) * 1000),
      familyLoad: Math.round((detail.pLocal || detail.pload || 0) * 1000),
      batterySOC: detail.SOC || detail.soc || null,
      isOnline: detail.status === 1 || detail.state === 1 || detail.lost === false,
    };
  };

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
          <Button className="gap-2"><Settings className="w-4 h-4" /> Configurar Integrações</Button>
        </Link>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Zap className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Nenhum inversor encontrado</h2>
        <p className="text-muted-foreground max-w-md">Sincronize seus inversores na página de Integrações.</p>
        <Link to="/integrations">
          <Button className="gap-2"><RefreshCw className="w-4 h-4" /> Ir para Integrações</Button>
        </Link>
      </div>
    );
  }

  const selectedDev = devices.find((d) => d.sn === selectedDevice);
  const m = getMetrics();

  const systemLabel = selectedDev?.system === "growatt" ? "Growatt" : "SolisCloud";
  const SystemIcon = selectedDev?.system === "growatt" ? Leaf : Zap;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoramento Solar</h1>
          <p className="text-muted-foreground">Acompanhe em tempo real a geração dos seus inversores</p>
        </div>
        <div className="flex items-center gap-3">
          {devices.length > 1 && (
            <Select value={selectedDevice || ""} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Selecionar inversor" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((dev) => (
                  <SelectItem key={dev.sn} value={dev.sn}>
                    <span className="flex items-center gap-2">
                      {dev.system === "growatt" ? <Leaf className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {dev.sn} {dev.stationName ? `(${dev.stationName})` : ""}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" onClick={refreshDeviceData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* System Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <SystemIcon className="w-3.5 h-3.5 text-primary" />
          {systemLabel}
        </Badge>
        {selectedDev?.model && <Badge variant="secondary">{selectedDev.model}</Badge>}
        <Badge variant={m.isOnline ? "default" : "destructive"} className="gap-1">
          {m.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {m.isOnline ? "Online" : "Offline"}
        </Badge>
        {selectedDev?.lastSyncedAt && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Atualizado: {new Date(selectedDev.lastSyncedAt).toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><Sun className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Potência Atual</span></div>
              <p className="text-2xl font-bold text-foreground">{m.currentPower} <span className="text-sm font-normal text-muted-foreground">W</span></p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-accent" /><span className="text-xs text-muted-foreground">Energia Hoje</span></div>
              <p className="text-2xl font-bold text-foreground">{m.todayEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Energia Mês</span></div>
              <p className="text-2xl font-bold text-foreground">{m.monthEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-secondary" /><span className="text-xs text-muted-foreground">Total Gerado</span></div>
              <p className="text-2xl font-bold text-foreground">{m.totalEnergy >= 1000 ? (m.totalEnergy / 1000).toFixed(1) : m.totalEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{m.totalEnergy >= 1000 ? "MWh" : "kWh"}</span></p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><Thermometer className="w-4 h-4 text-destructive mx-auto mb-1" /><p className="text-xs text-muted-foreground">Temperatura</p><p className="text-lg font-bold">{m.temperature}°C</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ArrowUpRight className="w-4 h-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Tensão DC</p><p className="text-lg font-bold">{m.dcVoltage} V</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><ArrowDownRight className="w-4 h-4 text-accent mx-auto mb-1" /><p className="text-xs text-muted-foreground">Tensão AC</p><p className="text-lg font-bold">{m.acVoltage} V</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Activity className="w-4 h-4 text-secondary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Rede</p><p className="text-lg font-bold">{m.gridPower} W</p></CardContent></Card>
        {m.batterySOC !== null ? (
          <Card><CardContent className="p-3 text-center"><Battery className="w-4 h-4 text-primary mx-auto mb-1" /><p className="text-xs text-muted-foreground">Bateria</p><p className="text-lg font-bold">{m.batterySOC}%</p></CardContent></Card>
        ) : (
          <Card><CardContent className="p-3 text-center"><Zap className="w-4 h-4 text-muted-foreground mx-auto mb-1" /><p className="text-xs text-muted-foreground">Consumo</p><p className="text-lg font-bold">{m.familyLoad} W</p></CardContent></Card>
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
            <CardHeader className="pb-2"><CardTitle className="text-base">Geração ao Longo do Dia (W)</CardTitle></CardHeader>
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
            <CardHeader className="pb-2"><CardTitle className="text-base">Energia Diária no Mês (kWh)</CardTitle></CardHeader>
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
