import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plug, Zap, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, RefreshCw, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useToast } from "@/hooks/use-toast";

interface SolisCredentials {
  id?: string;
  api_id: string;
  api_secret: string;
  api_url: string;
  station_index: number;
  is_active: boolean;
}

interface GrowattCredentials {
  id?: string;
  api_token: string;
  api_url: string;
  is_active: boolean;
}

export default function InternalIntegrations() {
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Solis state
  const [solisSaving, setSolisSaving] = useState(false);
  const [solisTesting, setSolisTesting] = useState(false);
  const [solisSyncing, setSolisSyncing] = useState(false);
  const [showSolisSecret, setShowSolisSecret] = useState(false);
  const [solisTestResult, setSolisTestResult] = useState<"success" | "error" | null>(null);
  const [solisCreds, setSolisCreds] = useState<SolisCredentials>({
    api_id: "", api_secret: "", api_url: "https://www.soliscloud.com:13333", station_index: 0, is_active: true,
  });
  const [solisInverterCount, setSolisInverterCount] = useState(0);

  // Growatt state
  const [growattSaving, setGrowattSaving] = useState(false);
  const [growattTesting, setGrowattTesting] = useState(false);
  const [growattSyncing, setGrowattSyncing] = useState(false);
  const [showGrowattToken, setShowGrowattToken] = useState(false);
  const [growattTestResult, setGrowattTestResult] = useState<"success" | "error" | null>(null);
  const [growattCreds, setGrowattCreds] = useState<GrowattCredentials>({
    api_token: "", api_url: "https://openapi.growatt.com/", is_active: true,
  });
  const [growattDeviceCount, setGrowattDeviceCount] = useState(0);

  useEffect(() => {
    if (workspaceId) fetchAllCredentials();
  }, [workspaceId]);

  const fetchAllCredentials = async () => {
    setLoading(true);
    const [solisRes, solisInvRes, growattRes, growattDevRes] = await Promise.all([
      supabase.from("solis_credentials").select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("solis_inverters").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
      supabase.from("growatt_credentials").select("*").eq("workspace_id", workspaceId!).maybeSingle(),
      supabase.from("growatt_inverters").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId!),
    ]);

    if (solisRes.data) {
      setSolisCreds({ id: solisRes.data.id, api_id: solisRes.data.api_id, api_secret: solisRes.data.api_secret, api_url: solisRes.data.api_url, station_index: solisRes.data.station_index, is_active: solisRes.data.is_active });
    }
    setSolisInverterCount(solisInvRes.count || 0);

    if (growattRes.data) {
      setGrowattCreds({ id: growattRes.data.id, api_token: growattRes.data.api_token, api_url: growattRes.data.api_url, is_active: growattRes.data.is_active });
    }
    setGrowattDeviceCount(growattDevRes.count || 0);

    setLoading(false);
  };

  // ============ SOLIS HANDLERS ============
  const handleSolisSave = async () => {
    if (!workspaceId || !solisCreds.api_id || !solisCreds.api_secret) {
      toast({ title: "Preencha API ID e API Secret", variant: "destructive" });
      return;
    }
    setSolisSaving(true);
    const payload = { workspace_id: workspaceId, api_id: solisCreds.api_id, api_secret: solisCreds.api_secret, api_url: solisCreds.api_url, station_index: solisCreds.station_index, is_active: solisCreds.is_active };
    const { error } = solisCreds.id
      ? await supabase.from("solis_credentials").update(payload).eq("id", solisCreds.id)
      : await supabase.from("solis_credentials").insert(payload);
    setSolisSaving(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else { toast({ title: "Credenciais SolisCloud salvas!" }); fetchAllCredentials(); }
  };

  const handleSolisTest = async () => {
    setSolisTesting(true); setSolisTestResult(null);
    try {
      const resp = await supabase.functions.invoke("solis-proxy", { body: { action: "stationList", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) {
        setSolisTestResult("error");
        toast({ title: "Falha na conexão SolisCloud", description: resp.data?.msg || "Verifique suas credenciais", variant: "destructive" });
      } else {
        setSolisTestResult("success");
        toast({ title: "SolisCloud conectado!", description: `${resp.data?.data?.page?.records?.length || 0} estação(ões)` });
      }
    } catch (e: any) { setSolisTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setSolisTesting(false);
  };

  const handleSolisSync = async () => {
    setSolisSyncing(true);
    try {
      const resp = await supabase.functions.invoke("solis-proxy", { body: { action: "syncInverters", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", description: resp.data?.error || "Tente novamente", variant: "destructive" });
      else { toast({ title: "Inversores Solis sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setSolisSyncing(false);
  };

  // ============ GROWATT HANDLERS ============
  const handleGrowattSave = async () => {
    if (!workspaceId || !growattCreds.api_token) {
      toast({ title: "Preencha o Token da API", variant: "destructive" });
      return;
    }
    setGrowattSaving(true);
    const payload = { workspace_id: workspaceId, api_token: growattCreds.api_token, api_url: growattCreds.api_url, is_active: growattCreds.is_active };
    const { error } = growattCreds.id
      ? await supabase.from("growatt_credentials").update(payload).eq("id", growattCreds.id)
      : await supabase.from("growatt_credentials").insert(payload);
    setGrowattSaving(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else { toast({ title: "Credenciais Growatt salvas!" }); fetchAllCredentials(); }
  };

  const handleGrowattTest = async () => {
    setGrowattTesting(true); setGrowattTestResult(null);
    try {
      const resp = await supabase.functions.invoke("growatt-proxy", { body: { action: "plantList", workspace_id: workspaceId } });
      if (resp.error) {
        setGrowattTestResult("error");
        toast({ title: "Falha na conexão Growatt", description: "Verifique seu token", variant: "destructive" });
      } else {
        setGrowattTestResult("success");
        const plants = resp.data?.data?.plants || resp.data?.data || [];
        toast({ title: "Growatt conectado!", description: `${Array.isArray(plants) ? plants.length : 0} planta(s)` });
      }
    } catch (e: any) { setGrowattTestResult("error"); toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setGrowattTesting(false);
  };

  const handleGrowattSync = async () => {
    setGrowattSyncing(true);
    try {
      const resp = await supabase.functions.invoke("growatt-proxy", { body: { action: "syncDevices", workspace_id: workspaceId } });
      if (resp.error || !resp.data?.success) toast({ title: "Erro ao sincronizar", description: resp.data?.msg || "Tente novamente", variant: "destructive" });
      else { toast({ title: "Dispositivos Growatt sincronizados!", description: `${resp.data.data.synced} encontrado(s)` }); fetchAllCredentials(); }
    } catch (e: any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    setGrowattSyncing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
        <p className="text-muted-foreground">Conecte sistemas externos ao seu painel Solarize</p>
      </div>

      {/* SolisCloud Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">SolisCloud</CardTitle>
                  <p className="text-sm text-muted-foreground">Monitoramento de inversores Solis</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {solisCreds.id && <Badge variant={solisCreds.is_active ? "default" : "secondary"}>{solisCreds.is_active ? "Ativo" : "Inativo"}</Badge>}
                {solisInverterCount > 0 && <Badge variant="outline">{solisInverterCount} inversor(es)</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conecte sua conta SolisCloud para monitorar a geração de energia em tempo real.
              Obtenha credenciais em{" "}
              <a href="https://www.soliscloud.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">soliscloud.com</a>
              {" "}→ Configurações → Gerenciamento de API.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API ID</Label>
                <Input placeholder="Ex: 1300386381676644416" value={solisCreds.api_id} onChange={(e) => setSolisCreds({ ...solisCreds, api_id: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>API Secret</Label>
                <div className="relative">
                  <Input type={showSolisSecret ? "text" : "password"} placeholder="Sua chave secreta" value={solisCreds.api_secret} onChange={(e) => setSolisCreds({ ...solisCreds, api_secret: e.target.value })} className="pr-10" />
                  <button type="button" onClick={() => setShowSolisSecret(!showSolisSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showSolisSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSolisSave} disabled={solisSaving}>
                {solisSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
                {solisCreds.id ? "Atualizar" : "Salvar"}
              </Button>
              {solisCreds.id && (
                <>
                  <Button variant="outline" onClick={handleSolisTest} disabled={solisTesting}>
                    {solisTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : solisTestResult === "success" ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : solisTestResult === "error" ? <AlertCircle className="w-4 h-4 mr-2 text-destructive" /> : <Zap className="w-4 h-4 mr-2" />}
                    Testar
                  </Button>
                  <Button variant="outline" onClick={handleSolisSync} disabled={solisSyncing}>
                    {solisSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sincronizar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Growatt Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Growatt</CardTitle>
                  <p className="text-sm text-muted-foreground">Monitoramento de inversores Growatt</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {growattCreds.id && <Badge variant={growattCreds.is_active ? "default" : "secondary"}>{growattCreds.is_active ? "Ativo" : "Inativo"}</Badge>}
                {growattDeviceCount > 0 && <Badge variant="outline">{growattDeviceCount} dispositivo(s)</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conecte sua conta Growatt para monitorar inversores via API V1.
              Solicite seu token de API entrando em contato com a{" "}
              <a href="https://www.growatt.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Growatt</a>
              {" "}ou acesse o portal ShineServer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token da API</Label>
                <div className="relative">
                  <Input type={showGrowattToken ? "text" : "password"} placeholder="Seu token de autenticação" value={growattCreds.api_token} onChange={(e) => setGrowattCreds({ ...growattCreds, api_token: e.target.value })} className="pr-10" />
                  <button type="button" onClick={() => setShowGrowattToken(!showGrowattToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showGrowattToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL da API</Label>
                <Input value={growattCreds.api_url} onChange={(e) => setGrowattCreds({ ...growattCreds, api_url: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGrowattSave} disabled={growattSaving}>
                {growattSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
                {growattCreds.id ? "Atualizar" : "Salvar"}
              </Button>
              {growattCreds.id && (
                <>
                  <Button variant="outline" onClick={handleGrowattTest} disabled={growattTesting}>
                    {growattTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : growattTestResult === "success" ? <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> : growattTestResult === "error" ? <AlertCircle className="w-4 h-4 mr-2 text-destructive" /> : <Leaf className="w-4 h-4 mr-2" />}
                    Testar
                  </Button>
                  <Button variant="outline" onClick={handleGrowattSync} disabled={growattSyncing}>
                    {growattSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sincronizar
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Future Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Fronius", desc: "Monitoramento de inversores Fronius", status: "Aguardando Doc" },
          { name: "Huawei FusionSolar", desc: "Monitoramento de inversores Huawei", status: "Aguardando Doc" },
          { name: "WhatsApp Business", desc: "Automação de mensagens e notificações", status: "Planejado" },
        ].map((item) => (
          <Card key={item.name} className="border-border/40 opacity-60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Zap className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">{item.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
