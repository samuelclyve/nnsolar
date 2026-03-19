import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Zap, Sun, Thermometer, Activity, Battery, ArrowUpRight,
  ArrowDownRight, RefreshCw, Loader2, AlertCircle, Settings,
  BarChart3, Clock, Wifi, WifiOff, Leaf, Snowflake, Bell,
  CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type SystemType = "solis" | "growatt" | "huawei" | "fronius";

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

interface InverterAlert {
  id: string;
  device_sn: string;
  system_type: string;
  alert_type: string;
  title: string;
  message: string | null;
  severity: string;
  is_resolved: boolean;
  created_at: string;
}

const SYSTEM_CONFIG: Record<SystemType, { label: string; icon: typeof Zap; color: string }> = {
  solis: { label: "SolisCloud", icon: Zap, color: "text-primary" },
  growatt: { label: "Growatt", icon: Leaf, color: "text-green-600" },
  huawei: { label: "Huawei FusionSolar", icon: Sun, color: "text-red-600" },
  fronius: { label: "Fronius", icon: Snowflake, color: "text-blue-600" },
};

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
  const [alerts, setAlerts] = useState<InverterAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      loadDevices();
      loadAlerts();
      subscribeToAlerts();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (selectedDevice) refreshDeviceData();
  }, [selectedDevice]);

  const loadAlerts = async () => {
    const { data } = await (supabase.from("inverter_alerts" as any) as any)
      .select("*")
      .eq("workspace_id", workspaceId!)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setAlerts(data);
  };

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel("inverter-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inverter_alerts" }, (payload) => {
        setAlerts((prev) => [payload.new as InverterAlert, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const resolveAlert = async (alertId: string) => {
    await (supabase.from("inverter_alerts" as any) as any)
      .update({ is_resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const checkDeviceAlerts = async (dev: MonitorDevice, metrics: any) => {
    if (!workspaceId) return;

    // Check offline
    if (!metrics.isOnline) {
      await (supabase.from("inverter_alerts" as any) as any).upsert({
        workspace_id: workspaceId,
        device_sn: dev.sn,
        system_type: dev.system,
        alert_type: "offline",
        title: "Inversor Offline",
        message: `${dev.sn} (${SYSTEM_CONFIG[dev.system].label}) está offline${dev.stationName ? ` - ${dev.stationName}` : ""}`,
        severity: "critical",
        is_resolved: false,
      }, { onConflict: "id" });
    }

    // Check high temperature (>80°C)
    if (metrics.temperature > 80) {
      await (supabase.from("inverter_alerts" as any) as any).insert({
        workspace_id: workspaceId,
        device_sn: dev.sn,
        system_type: dev.system,
        alert_type: "warning",
        title: "Temperatura Alta",
        message: `${dev.sn} - Temperatura: ${metrics.temperature}°C (acima de 80°C)`,
        severity: "warning",
      });
    }

    // Check zero production during daytime (8-17h)
    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 17 && metrics.isOnline && metrics.currentPower === 0 && metrics.todayEnergy === 0) {
      await (supabase.from("inverter_alerts" as any) as any).insert({
        workspace_id: workspaceId,
        device_sn: dev.sn,
        system_type: dev.system,
        alert_type: "low_production",
        title: "Sem Geração",
        message: `${dev.sn} está online mas sem gerar energia durante horário solar`,
        severity: "warning",
      });
    }
  };

  const loadDevices = async () => {
    setLoading(true);

    const [solisCreds, growattCreds, huaweiCreds, froniusCreds, solisInverters, growattInverters, huaweiInverters, froniusInverters] = await Promise.all([
      supabase.from("solis_credentials").select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("growatt_credentials").select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      (supabase.from("huawei_credentials" as any) as any).select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      (supabase.from("fronius_credentials" as any) as any).select("id").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("solis_inverters").select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("inverter_sn"),
      supabase.from("growatt_inverters").select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("device_sn"),
      (supabase.from("huawei_inverters" as any) as any).select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("device_sn"),
      (supabase.from("fronius_inverters" as any) as any).select("*").eq("workspace_id", workspaceId!).eq("is_active", true).order("device_sn"),
    ]);

    if (!solisCreds.data && !growattCreds.data && !huaweiCreds.data && !froniusCreds.data) {
      setHasCredentials(false);
      setLoading(false);
      return;
    }

    const allDevices: MonitorDevice[] = [];

    (solisInverters.data || []).forEach((inv: any) => {
      allDevices.push({ id: inv.id, sn: inv.inverter_sn, stationId: inv.station_id, stationName: inv.station_name, model: inv.inverter_model, lastData: inv.last_data, lastSyncedAt: inv.last_synced_at, isActive: inv.is_active, system: "solis" });
    });
    (growattInverters.data || []).forEach((dev: any) => {
      allDevices.push({ id: dev.id, sn: dev.device_sn, stationId: dev.plant_id, stationName: dev.plant_name, model: dev.device_model, lastData: dev.last_data, lastSyncedAt: dev.last_synced_at, isActive: dev.is_active, system: "growatt" });
    });
    (huaweiInverters.data || []).forEach((dev: any) => {
      allDevices.push({ id: dev.id, sn: dev.device_sn, stationId: dev.station_code, stationName: dev.station_name, model: dev.device_model, lastData: dev.last_data, lastSyncedAt: dev.last_synced_at, isActive: dev.is_active, system: "huawei" });
    });
    (froniusInverters.data || []).forEach((dev: any) => {
      allDevices.push({ id: dev.id, sn: dev.device_sn, stationId: dev.system_id, stationName: dev.system_name, model: dev.device_model, lastData: dev.last_data, lastSyncedAt: dev.last_synced_at, isActive: dev.is_active, system: "fronius" });
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
      switch (dev.system) {
        case "solis": await refreshSolisData(dev); break;
        case "growatt": await refreshGrowattData(dev); break;
        case "huawei": await refreshHuaweiData(dev); break;
        case "fronius": await refreshFroniusData(dev); break;
      }
      // Check alerts after refresh
      const m = getMetrics();
      checkDeviceAlerts(dev, m);
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
      setDayData(Array.isArray(records) ? records.map((r: any) => ({ time: r.dataTimestamp ? new Date(r.dataTimestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "", power: r.pac ? Math.round(r.pac * 1000) : 0 })) : []);
    }
    if (monthResp.data?.success && monthResp.data?.data) {
      const records = monthResp.data.data || [];
      setMonthData(Array.isArray(records) ? records.map((r: any) => ({ day: r.dataTimestamp ? new Date(r.dataTimestamp).getDate() : "", energy: r.energy || 0 })) : []);
    }
  };

  const refreshGrowattData = async (dev: MonitorDevice) => {
    const [detailResp, energyDayResp, energyMonthResp] = await Promise.all([
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceDetail", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId } }),
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceEnergy", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId, type: "day" } }),
      supabase.functions.invoke("growatt-proxy", { body: { action: "deviceEnergy", workspace_id: workspaceId, deviceSn: dev.sn, plantId: dev.stationId, type: "month" } }),
    ]);
    if (detailResp.data) { const d = detailResp.data?.data || detailResp.data; setDetail({ ...d, _system: "growatt" }); }
    if (energyDayResp.data) {
      const records = energyDayResp.data?.data?.charts || energyDayResp.data?.data || [];
      if (Array.isArray(records)) setDayData(records.map((r: any) => ({ time: r.time || r.hour || "", power: Math.round((r.pac || r.power || r.ppv || 0) * 1000) })));
    }
    if (energyMonthResp.data) {
      const records = energyMonthResp.data?.data?.charts || energyMonthResp.data?.data || [];
      if (Array.isArray(records)) setMonthData(records.map((r: any) => ({ day: r.date || r.day || "", energy: r.energy || r.epv || 0 })));
    }
  };

  const refreshHuaweiData = async (dev: MonitorDevice) => {
    const [detailResp, histResp] = await Promise.all([
      supabase.functions.invoke("huawei-proxy", { body: { action: "deviceDetail", workspace_id: workspaceId, deviceId: dev.sn, devTypeId: 1 } }),
      supabase.functions.invoke("huawei-proxy", { body: { action: "deviceHistory", workspace_id: workspaceId, stationCode: dev.stationId, collectTime: Date.now() } }),
    ]);
    if (detailResp.data) {
      const devData = detailResp.data?.data || [];
      const d = Array.isArray(devData) && devData.length > 0 ? devData[0]?.dataItemMap || devData[0] : devData;
      setDetail({ ...d, _system: "huawei" });
    }
    if (histResp.data?.data) {
      const records = histResp.data.data || [];
      if (Array.isArray(records)) {
        setDayData(records.map((r: any) => ({
          time: r.collectTime ? new Date(r.collectTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
          power: Math.round((r.dataItemMap?.inverter_power || r.inverter_power || 0) * 1000),
        })));
      }
    }
  };

  const refreshFroniusData = async (dev: MonitorDevice) => {
    const [flowResp, aggResp] = await Promise.all([
      supabase.functions.invoke("fronius-proxy", { body: { action: "systemFlow", workspace_id: workspaceId, systemId: dev.stationId } }),
      supabase.functions.invoke("fronius-proxy", { body: { action: "systemAggData", workspace_id: workspaceId, systemId: dev.stationId, period: "day" } }),
    ]);
    if (flowResp.data) {
      const d = flowResp.data?.data || flowResp.data;
      setDetail({ ...d, _system: "fronius" });
    }
    if (aggResp.data?.data) {
      const records = aggResp.data.data || [];
      if (Array.isArray(records)) {
        setDayData(records.map((r: any) => ({
          time: r.logDateTime ? new Date(r.logDateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "",
          power: Math.round((r.power || r.energyReal || 0) * 1000),
        })));
      }
    }
  };

  const getMetrics = () => {
    if (!detail) return { currentPower: 0, todayEnergy: 0, monthEnergy: 0, totalEnergy: 0, temperature: 0, dcVoltage: "0", acVoltage: "0", gridPower: 0, familyLoad: 0, batterySOC: null as number | null, isOnline: false };

    if (detail._system === "solis") {
      return {
        currentPower: Math.round((detail.pac || 0) * 1000), todayEnergy: detail.eToday || 0, monthEnergy: detail.eMonth || 0, totalEnergy: detail.eTotal || 0,
        temperature: detail.inverterTemperature || 0, dcVoltage: ((detail.uPv1 || 0) + (detail.uPv2 || 0) + (detail.uPv3 || 0) + (detail.uPv4 || 0)).toFixed(1),
        acVoltage: Math.max(detail.uAc1 || 0, detail.uAc2 || 0, detail.uAc3 || 0).toFixed(1),
        gridPower: Math.round((detail.psum || 0) * 1000), familyLoad: Math.round((detail.familyLoadPower || 0) * 1000),
        batterySOC: detail.batteryCapacitySoc ?? null, isOnline: detail.state === 1,
      };
    }

    if (detail._system === "huawei") {
      return {
        currentPower: Math.round((detail.active_power || detail.inverter_power || 0) * 1000),
        todayEnergy: detail.day_cap || detail.day_power || 0, monthEnergy: detail.month_cap || 0, totalEnergy: detail.total_cap || 0,
        temperature: detail.temperature || detail.inverter_temperature || 0,
        dcVoltage: (detail.pv1_u || detail.mppt_1_cap || 0).toFixed ? (detail.pv1_u || 0).toFixed(1) : "0",
        acVoltage: (detail.a_u || detail.ab_u || 0).toFixed ? (detail.a_u || detail.ab_u || 0).toFixed(1) : "0",
        gridPower: Math.round((detail.grid_power || detail.active_grid_power_factor || 0) * 1000),
        familyLoad: Math.round((detail.active_power_consumption || 0) * 1000),
        batterySOC: detail.battery_soc ?? null,
        isOnline: detail.run_state === 1 || detail.inverter_state === "1",
      };
    }

    if (detail._system === "fronius") {
      return {
        currentPower: Math.round((detail.P_PV || detail.currentPower || detail.pac || 0)),
        todayEnergy: (detail.E_Day || detail.energyDay || 0) / 1000,
        monthEnergy: (detail.E_Month || detail.energyMonth || 0) / 1000,
        totalEnergy: (detail.E_Total || detail.energyTotal || 0) / 1000,
        temperature: detail.temperature || 0,
        dcVoltage: (detail.UDC || detail.vpv || 0).toFixed ? (detail.UDC || 0).toFixed(1) : "0",
        acVoltage: (detail.UAC || detail.vac || 0).toFixed ? (detail.UAC || 0).toFixed(1) : "0",
        gridPower: Math.round(detail.P_Grid || detail.gridPower || 0),
        familyLoad: Math.round(detail.P_Load || detail.loadPower || 0),
        batterySOC: detail.SOC || null,
        isOnline: detail.status?.InverterState === "Running" || detail.P_PV > 0,
      };
    }

    // Growatt
    return {
      currentPower: Math.round((detail.pac || detail.ppv || detail.power || 0) * 1000),
      todayEnergy: detail.eToday || detail.epvToday || 0, monthEnergy: detail.eMonth || detail.epvMonth || 0, totalEnergy: detail.eTotal || detail.epvTotal || 0,
      temperature: detail.temperature || detail.tempperature || 0,
      dcVoltage: (detail.vpv1 || detail.vpv || 0).toFixed ? (detail.vpv1 || detail.vpv || 0).toFixed(1) : "0",
      acVoltage: (detail.vac1 || detail.vac || 0).toFixed ? (detail.vac1 || detail.vac || 0).toFixed(1) : "0",
      gridPower: Math.round((detail.pGrid || detail.pgrid || 0) * 1000),
      familyLoad: Math.round((detail.pLocal || detail.pload || 0) * 1000),
      batterySOC: detail.SOC || detail.soc || null,
      isOnline: detail.status === 1 || detail.state === 1 || detail.lost === false,
    };
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!hasCredentials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Monitoramento não configurado</h2>
        <p className="text-muted-foreground max-w-md">Configure suas credenciais na página de Integrações para começar a acompanhar seus inversores.</p>
        <Link to="/integrations"><Button className="gap-2"><Settings className="w-4 h-4" /> Configurar Integrações</Button></Link>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Zap className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Nenhum inversor encontrado</h2>
        <p className="text-muted-foreground max-w-md">Sincronize seus inversores na página de Integrações.</p>
        <Link to="/integrations"><Button className="gap-2"><RefreshCw className="w-4 h-4" /> Ir para Integrações</Button></Link>
      </div>
    );
  }

  const selectedDev = devices.find((d) => d.sn === selectedDevice);
  const m = getMetrics();
  const sysConfig = selectedDev ? SYSTEM_CONFIG[selectedDev.system] : SYSTEM_CONFIG.solis;
  const SystemIcon = sysConfig.icon;
  const unresolvedAlerts = alerts.filter((a) => !a.is_resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoramento Solar</h1>
          <p className="text-muted-foreground">Acompanhe em tempo real a geração dos seus inversores</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Alerts button */}
          <Button variant={unresolvedAlerts.length > 0 ? "destructive" : "outline"} size="sm" onClick={() => setShowAlerts(!showAlerts)} className="gap-2 relative">
            <Bell className="w-4 h-4" />
            {unresolvedAlerts.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                {unresolvedAlerts.length}
              </Badge>
            )}
            Alertas
          </Button>

          {devices.length > 1 && (
            <Select value={selectedDevice || ""} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Selecionar inversor" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((dev) => {
                  const cfg = SYSTEM_CONFIG[dev.system];
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={dev.sn} value={dev.sn}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-3 h-3" />
                        {dev.sn} {dev.stationName ? `(${dev.stationName})` : ""}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon" onClick={refreshDeviceData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Alerts Panel */}
      {showAlerts && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <Card className="border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-destructive" />
                Alertas Ativos ({unresolvedAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unresolvedAlerts.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                  Nenhum alerta ativo. Tudo funcionando normalmente!
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-2">
                    {unresolvedAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{alert.title}</p>
                            <Badge variant="outline" className="text-[10px]">{alert.system_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(alert.created_at), { locale: ptBR, addSuffix: true })}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => resolveAlert(alert.id)} className="text-xs h-7">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolver
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="gap-1.5 px-3 py-1">
          <SystemIcon className={`w-3.5 h-3.5 ${sysConfig.color}`} />
          {sysConfig.label}
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
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-accent" /><span className="text-xs text-muted-foreground">Energia Hoje</span></div>
            <p className="text-2xl font-bold text-foreground">{m.todayEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
          </CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Energia Mês</span></div>
            <p className="text-2xl font-bold text-foreground">{m.monthEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kWh</span></p>
          </CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-secondary" /><span className="text-xs text-muted-foreground">Total Gerado</span></div>
            <p className="text-2xl font-bold text-foreground">{m.totalEnergy >= 1000 ? (m.totalEnergy / 1000).toFixed(1) : m.totalEnergy.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">{m.totalEnergy >= 1000 ? "MWh" : "kWh"}</span></p>
          </CardContent></Card>
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
