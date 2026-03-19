import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plug, Zap, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, RefreshCw, Leaf, Sun, Snowflake, Search, MessageCircle, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SolisCredentials { id?: string; api_id: string; api_secret: string; api_url: string; station_index: number; is_active: boolean; }
interface GrowattCredentials { id?: string; api_token: string; api_url: string; is_active: boolean; }
interface HuaweiCredentials { id?: string; username: string; password: string; api_url: string; is_active: boolean; }
interface FroniusCredentials { id?: string; api_key: string; access_key_id: string; access_key_value: string; api_url: string; is_active: boolean; }

export default function InternalIntegrations() {
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Solis
  const [solisSaving, setSolisSaving] = useState(false);
  const [solisTesting, setSolisTesting] = useState(false);
  const [solisSyncing, setSolisSyncing] = useState(false);
  const [showSolisSecret, setShowSolisSecret] = useState(false);
  const [solisTestResult, setSolisTestResult] = useState<"success" | "error" | null>(null);
  const [solisCreds, setSolisCreds] = useState<SolisCredentials>({ api_id: "", api_secret: "", api_url: "https://www.soliscloud.com:13333", station_index: 0, is_active: true });
  const [solisInverterCount, setSolisInverterCount] = useState(0);

  // Growatt
  const [growattSaving, setGrowattSaving] = useState(false);
  const [growattTesting, setGrowattTesting] = useState(false);
  const [growattSyncing, setGrowattSyncing] = useState(false);
  const [showGrowattToken, setShowGrowattToken] = useState(false);
  const [growattTestResult, setGrowattTestResult] = useState<"success" | "error" | null>(null);
  const [growattCreds, setGrowattCreds] = useState<GrowattCredentials>({ api_token: "", api_url: "https://openapi.growatt.com/", is_active: true });
  const [growattDeviceCount, setGrowattDeviceCount] = useState(0);

  // Huawei
  const [huaweiSaving, setHuaweiSaving] = useState(false);
  const [huaweiTesting, setHuaweiTesting] = useState(false);
  const [huaweiSyncing, setHuaweiSyncing] = useState(false);
  const [showHuaweiPassword, setShowHuaweiPassword] = useState(false);
  const [huaweiTestResult, setHuaweiTestResult] = useState<"success" | "error" | null>(null);
  const [huaweiCreds, setHuaweiCreds] = useState<HuaweiCredentials>({ username: "", password: "", api_url: "https://intl.fusionsolar.huawei.com/thirdData", is_active: true });
  const [huaweiDeviceCount, setHuaweiDeviceCount] = useState(0);

  // Fronius
  const [froniusSaving, setFroniusSaving] = useState(false);
  const [froniusTesting, setFroniusTesting] = useState(false);
  const [froniusSyncing, setFroniusSyncing] = useState(false);
  const [showFroniusKey, setShowFroniusKey] = useState(false);
  const [froniusTestResult, setFroniusTestResult] = useState<"success" | "error" | null>(null);
  const [froniusCreds, setFroniusCreds] = useState<FroniusCredentials>({ api_key: "", access_key_id: "", access_key_value: "", api_url: "https://api.solarweb.com/swqapi", is_active: true });
  const [froniusDeviceCount, setFroniusDeviceCount] = useState(0);

  useEffect(() => { if (workspaceId) fetchAllCredentials(); }, [workspaceId]);

  const fetchAllCredentials = async () => {
    setLoading(true);
    const [solisRes, solisInvRes, growattRes, growattDevRes, huaweiRes, huaweiDevRes, froniusRes, froniusDevRes] = await Promise.all([
      supabase.from("solis_credentials").select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("solis_inverters").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
      supabase.from("growatt_credentials").select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("growatt_inverters").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
      supabase.from("huawei_credentials" as any).select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("huawei_inverters" as any).select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
      supabase.from("fronius_credentials" as any).select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("fronius_inverters" as any).select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
    ]);

    if (solisRes.data) setSolisCreds({ id: solisRes.data.id, api_id: solisRes.data.api_id, api_secret: solisRes.data.api_secret, api_url: solisRes.data.api_url, station_index: solisRes.data.station_index, is_active: solisRes.data.is_active });
    setSolisInverterCount(solisInvRes.count || 0);
    if (growattRes.data) setGrowattCreds({ id: growattRes.data.id, api_token: growattRes.data.api_token, api_url: growattRes.data.api_url, is_active: growattRes.data.is_active });
    setGrowattDeviceCount(growattDevRes.count || 0);
    if (huaweiRes.data) { const d = huaweiRes.data as any; setHuaweiCreds({ id: d.id, username: d.username, password: d.password, api_url: d.api_url, is_active: d.is_active }); }
    setHuaweiDeviceCount((huaweiDevRes as any).count || 0);
    if (froniusRes.data) { const d = froniusRes.data as any; setFroniusCreds({ id: d.id, api_key: d.api_key, access_key_id: d.access_key_id || "", access_key_value: d.access_key_value || "", api_url: d.api_url, is_active: d.is_active }); }
    setFroniusDeviceCount((froniusDevRes as any).count || 0);
    setLoading(false);
  };

  // ============ GENERIC HANDLERS ============
  const saveCredentials = async (table: string, payload: any, id: string | undefined, setLoading: (v: boolean) => void, label: string) => {
    setLoading(true);
    const { error } = id
      ? await (supabase.from(table as any) as any).update(payload).eq("id", id)
      : await (supabase.from(table as any) as any).insert(payload);
    setLoading(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else { toast({ title: `Credenciais ${label} salvas!` }); fetchAllCredentials(); }
  };

  // ============ SOLIS ============
  const handleSolisSave = () => {
    if (!workspaceId || !solisCreds.api_id || !solisCreds.api_secret) { toast({ title: "Preencha API ID e API Secret", variant: "destructive" }); return; }
    saveCredentials("solis_credentials", { workspace_id: workspaceId, api_id: solisCreds.api_id, api_secret: solisCreds.api_secret, api_url: solisCreds.api_url, station_index: solisCreds.station_index, is_active: solisCreds.is_active }, solisCreds.id, setSolisSaving, "SolisCloud");
  };
  const handleSolisTest = async () => {
    setSolisTesting(true); setSolisTestResult(null);
    try {
      const resp = await supabase.functions.invoke("solis-proxy", { body: { action: "stationList", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) { setSolisTestResult("error"); toast({ title: "Falha na conexão SolisCloud", description: resp.data?.msg || "Verifique credenciais", variant: "destructive" }); }
      else { setSolisTestResult("success"); toast({ title: "SolisCloud conectado!", description: `${resp.data?.data?.page?.records?.length || 0} estação(ões)` }); }
    } catch (e: any) { setSolisTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setSolisTesting(false);
  };
  const handleSolisSync = async () => {
    setSolisSyncing(true);
    try {
      const resp = await supabase.functions.invoke("solis-proxy", { body: { action: "syncInverters", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", variant: "destructive" });
      else { toast({ title: "Inversores Solis sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setSolisSyncing(false);
  };

  // ============ GROWATT ============
  const handleGrowattSave = () => {
    if (!workspaceId || !growattCreds.api_token) { toast({ title: "Preencha o Token da API", variant: "destructive" }); return; }
    saveCredentials("growatt_credentials", { workspace_id: workspaceId, api_token: growattCreds.api_token, api_url: growattCreds.api_url, is_active: growattCreds.is_active }, growattCreds.id, setGrowattSaving, "Growatt");
  };
  const handleGrowattTest = async () => {
    setGrowattTesting(true); setGrowattTestResult(null);
    try {
      const resp = await supabase.functions.invoke("growatt-proxy", { body: { action: "plantList", workspace_id: workspaceId } });
      if (resp.error) { setGrowattTestResult("error"); toast({ title: "Falha na conexão Growatt", variant: "destructive" }); }
      else { setGrowattTestResult("success"); const plants = resp.data?.data?.plants || resp.data?.data || []; toast({ title: "Growatt conectado!", description: `${Array.isArray(plants) ? plants.length : 0} planta(s)` }); }
    } catch (e: any) { setGrowattTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setGrowattTesting(false);
  };
  const handleGrowattSync = async () => {
    setGrowattSyncing(true);
    try {
      const resp = await supabase.functions.invoke("growatt-proxy", { body: { action: "syncDevices", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", variant: "destructive" });
      else { toast({ title: "Dispositivos Growatt sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setGrowattSyncing(false);
  };

  // ============ HUAWEI ============
  const handleHuaweiSave = () => {
    if (!workspaceId || !huaweiCreds.username || !huaweiCreds.password) { toast({ title: "Preencha usuário e senha", variant: "destructive" }); return; }
    saveCredentials("huawei_credentials", { workspace_id: workspaceId, username: huaweiCreds.username, password: huaweiCreds.password, api_url: huaweiCreds.api_url, is_active: huaweiCreds.is_active }, huaweiCreds.id, setHuaweiSaving, "Huawei FusionSolar");
  };
  const handleHuaweiTest = async () => {
    setHuaweiTesting(true); setHuaweiTestResult(null);
    try {
      const resp = await supabase.functions.invoke("huawei-proxy", { body: { action: "stationList", workspace_id: workspaceId } });
      if (resp.error) { setHuaweiTestResult("error"); toast({ title: "Falha na conexão Huawei", description: typeof resp.data === "object" ? resp.data?.error : "Verifique credenciais", variant: "destructive" }); }
      else { setHuaweiTestResult("success"); const stations = resp.data?.data?.list || []; toast({ title: "Huawei FusionSolar conectado!", description: `${stations.length} estação(ões)` }); }
    } catch (e: any) { setHuaweiTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setHuaweiTesting(false);
  };
  const handleHuaweiSync = async () => {
    setHuaweiSyncing(true);
    try {
      const resp = await supabase.functions.invoke("huawei-proxy", { body: { action: "syncDevices", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", variant: "destructive" });
      else { toast({ title: "Dispositivos Huawei sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setHuaweiSyncing(false);
  };

  // ============ FRONIUS ============
  const handleFroniusSave = () => {
    if (!workspaceId || !froniusCreds.api_key) { toast({ title: "Preencha a API Key", variant: "destructive" }); return; }
    saveCredentials("fronius_credentials", { workspace_id: workspaceId, api_key: froniusCreds.api_key, access_key_id: froniusCreds.access_key_id || null, access_key_value: froniusCreds.access_key_value || null, api_url: froniusCreds.api_url, is_active: froniusCreds.is_active }, froniusCreds.id, setFroniusSaving, "Fronius");
  };
  const handleFroniusTest = async () => {
    setFroniusTesting(true); setFroniusTestResult(null);
    try {
      const resp = await supabase.functions.invoke("fronius-proxy", { body: { action: "systemList", workspace_id: workspaceId } });
      if (resp.error) { setFroniusTestResult("error"); toast({ title: "Falha na conexão Fronius", variant: "destructive" }); }
      else { setFroniusTestResult("success"); toast({ title: "Fronius conectado!" }); }
    } catch (e: any) { setFroniusTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setFroniusTesting(false);
  };
  const handleFroniusSync = async () => {
    setFroniusSyncing(true);
    try {
      const resp = await supabase.functions.invoke("fronius-proxy", { body: { action: "syncDevices", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", variant: "destructive" });
      else { toast({ title: "Dispositivos Fronius sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setFroniusSyncing(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const IntegrationCard = ({ icon: Icon, iconColor, title, description, helpText, helpLink, credId, isActive, deviceCount, deviceLabel, saving, testing, syncing, testResult, onSave, onTest, onSync, children }: any) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${iconColor} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
              <div><CardTitle className="text-lg">{title}</CardTitle><p className="text-sm text-muted-foreground">{description}</p></div>
            </div>
            <div className="flex items-center gap-2">
              {credId && <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Ativo" : "Inativo"}</Badge>}
              {deviceCount > 0 && <Badge variant="outline">{deviceCount} {deviceLabel}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {helpText}{" "}
            {helpLink && <a href={helpLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Saiba mais</a>}
          </p>
          {children}
          <div className="flex flex-wrap gap-3">
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
              {credId ? "Atualizar" : "Salvar"}
            </Button>
            {credId && (
              <>
                <Button variant="outline" onClick={onTest} disabled={testing}>
                  {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : testResult === "success" ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : testResult === "error" ? <AlertCircle className="w-4 h-4 mr-2 text-destructive" /> : <Zap className="w-4 h-4 mr-2" />}
                  Testar
                </Button>
                <Button variant="outline" onClick={onSync} disabled={syncing}>
                  {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Sincronizar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Integration metadata for filtering
  const integrations = [
    { key: "solis", title: "SolisCloud", isConfigured: !!solisCreds.id, isActive: solisCreds.is_active },
    { key: "growatt", title: "Growatt", isConfigured: !!growattCreds.id, isActive: growattCreds.is_active },
    { key: "huawei", title: "Huawei FusionSolar", isConfigured: !!huaweiCreds.id, isActive: huaweiCreds.is_active },
    { key: "fronius", title: "Fronius Solar.web", isConfigured: !!froniusCreds.id, isActive: froniusCreds.is_active },
    { key: "whatsapp", title: "WhatsApp Business", isConfigured: false, isActive: false },
  ];

  const isVisible = (key: string) => {
    const item = integrations.find((i) => i.key === key);
    if (!item) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === "active" && (!item.isConfigured || !item.isActive)) return false;
    if (statusFilter === "inactive" && item.isConfigured && item.isActive) return false;
    return true;
  };

  const handleSuggestIntegration = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Faça login para enviar sugestões", variant: "destructive" }); return; }
    await supabase.from("support_tickets").insert({
      user_id: user.id,
      workspace_id: workspaceId || null,
      message: "[Sugestão de Integração] Gostaria de sugerir uma nova integração para o Solarize.",
      sender: "user",
    });
    toast({ title: "Sugestão enviada!", description: "Sua ideia foi enviada para o suporte. Você pode continuar a conversa no chat." });
  };

  const visibleCount = integrations.filter((i) => isVisible(i.key)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Conecte sistemas externos ao seu painel Solarize</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar integração..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="inactive">Não configuradas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {visibleCount === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-foreground">Nenhuma integração encontrada</p>
          <p className="text-sm text-muted-foreground">Tente outro termo ou altere o filtro</p>
        </div>
      )}

      {/* SolisCloud */}
      {isVisible("solis") && (
        <IntegrationCard icon={Zap} iconColor="bg-primary/10 text-primary" title="SolisCloud" description="Monitoramento de inversores Solis"
          helpText="Conecte sua conta SolisCloud. Obtenha credenciais em" helpLink="https://www.soliscloud.com"
          credId={solisCreds.id} isActive={solisCreds.is_active} deviceCount={solisInverterCount} deviceLabel="inversor(es)"
          saving={solisSaving} testing={solisTesting} syncing={solisSyncing} testResult={solisTestResult}
          onSave={handleSolisSave} onTest={handleSolisTest} onSync={handleSolisSync}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>API ID</Label><Input placeholder="Ex: 1300386381676644416" value={solisCreds.api_id} onChange={(e) => setSolisCreds({ ...solisCreds, api_id: e.target.value })} /></div>
            <div className="space-y-2"><Label>API Secret</Label>
              <div className="relative">
                <Input type={showSolisSecret ? "text" : "password"} placeholder="Sua chave secreta" value={solisCreds.api_secret} onChange={(e) => setSolisCreds({ ...solisCreds, api_secret: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowSolisSecret(!showSolisSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showSolisSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </IntegrationCard>
      )}

      {/* Growatt */}
      {isVisible("growatt") && (
        <IntegrationCard icon={Leaf} iconColor="bg-green-500/10 text-green-600" title="Growatt" description="Monitoramento de inversores Growatt"
          helpText="Conecte sua conta Growatt via API V1. Solicite seu token em" helpLink="https://www.growatt.com"
          credId={growattCreds.id} isActive={growattCreds.is_active} deviceCount={growattDeviceCount} deviceLabel="dispositivo(s)"
          saving={growattSaving} testing={growattTesting} syncing={growattSyncing} testResult={growattTestResult}
          onSave={handleGrowattSave} onTest={handleGrowattTest} onSync={handleGrowattSync}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Token da API</Label>
              <div className="relative">
                <Input type={showGrowattToken ? "text" : "password"} placeholder="Seu token" value={growattCreds.api_token} onChange={(e) => setGrowattCreds({ ...growattCreds, api_token: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowGrowattToken(!showGrowattToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showGrowattToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2"><Label>URL da API</Label><Input value={growattCreds.api_url} onChange={(e) => setGrowattCreds({ ...growattCreds, api_url: e.target.value })} /></div>
          </div>
        </IntegrationCard>
      )}

      {/* Huawei FusionSolar */}
      {isVisible("huawei") && (
        <IntegrationCard icon={Sun} iconColor="bg-red-500/10 text-red-600" title="Huawei FusionSolar" description="Monitoramento de inversores Huawei"
          helpText="Conecte via iMaster NetEco Northbound API. Solicite acesso no portal de parceiros Huawei." helpLink="https://intl.fusionsolar.huawei.com"
          credId={huaweiCreds.id} isActive={huaweiCreds.is_active} deviceCount={huaweiDeviceCount} deviceLabel="dispositivo(s)"
          saving={huaweiSaving} testing={huaweiTesting} syncing={huaweiSyncing} testResult={huaweiTestResult}
          onSave={handleHuaweiSave} onTest={handleHuaweiTest} onSync={handleHuaweiSync}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Usuário (System Code)</Label><Input placeholder="Seu usuário FusionSolar" value={huaweiCreds.username} onChange={(e) => setHuaweiCreds({ ...huaweiCreds, username: e.target.value })} /></div>
            <div className="space-y-2"><Label>Senha (System Code)</Label>
              <div className="relative">
                <Input type={showHuaweiPassword ? "text" : "password"} placeholder="Sua senha" value={huaweiCreds.password} onChange={(e) => setHuaweiCreds({ ...huaweiCreds, password: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowHuaweiPassword(!showHuaweiPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showHuaweiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2"><Label>URL da API</Label><Input value={huaweiCreds.api_url} onChange={(e) => setHuaweiCreds({ ...huaweiCreds, api_url: e.target.value })} /></div>
          </div>
        </IntegrationCard>
      )}

      {/* Fronius */}
      {isVisible("fronius") && (
        <IntegrationCard icon={Snowflake} iconColor="bg-blue-500/10 text-blue-600" title="Fronius Solar.web" description="Monitoramento de inversores Fronius"
          helpText="Conecte via Solar.web API. Solicite acesso como integrador no portal" helpLink="https://www.solarweb.com"
          credId={froniusCreds.id} isActive={froniusCreds.is_active} deviceCount={froniusDeviceCount} deviceLabel="dispositivo(s)"
          saving={froniusSaving} testing={froniusTesting} syncing={froniusSyncing} testResult={froniusTestResult}
          onSave={handleFroniusSave} onTest={handleFroniusTest} onSync={handleFroniusSync}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>API Key</Label>
              <div className="relative">
                <Input type={showFroniusKey ? "text" : "password"} placeholder="Sua API Key" value={froniusCreds.api_key} onChange={(e) => setFroniusCreds({ ...froniusCreds, api_key: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowFroniusKey(!showFroniusKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showFroniusKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2"><Label>Access Key ID (opcional)</Label><Input placeholder="Access Key ID" value={froniusCreds.access_key_id} onChange={(e) => setFroniusCreds({ ...froniusCreds, access_key_id: e.target.value })} /></div>
            <div className="space-y-2"><Label>Access Key Value (opcional)</Label><Input placeholder="Access Key Value" value={froniusCreds.access_key_value} onChange={(e) => setFroniusCreds({ ...froniusCreds, access_key_value: e.target.value })} /></div>
            <div className="space-y-2"><Label>URL da API</Label><Input value={froniusCreds.api_url} onChange={(e) => setFroniusCreds({ ...froniusCreds, api_url: e.target.value })} /></div>
          </div>
        </IntegrationCard>
      )}

      {/* Future - WhatsApp */}
      {isVisible("whatsapp") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/40 opacity-60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><MessageCircle className="w-4 h-4 text-muted-foreground" /></div>
              <div className="flex-1"><p className="font-medium text-foreground">WhatsApp Business</p><p className="text-xs text-muted-foreground">Automação de mensagens</p></div>
              <Badge variant="secondary" className="text-[10px]">Planejado</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestion CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">Quer sugerir uma nova integração?</p>
            <p className="text-sm text-muted-foreground">Envie sua ideia direto para nosso time. Sua sugestão nos ajuda a priorizar o que desenvolver.</p>
          </div>
          <Button onClick={handleSuggestIntegration} className="gap-2 shrink-0">
            <MessageCircle className="w-4 h-4" /> Enviar sugestão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
