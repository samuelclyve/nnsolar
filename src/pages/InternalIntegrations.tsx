import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plug, Zap, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
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

export default function InternalIntegrations() {
  const { workspaceId } = useWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [creds, setCreds] = useState<SolisCredentials>({
    api_id: "",
    api_secret: "",
    api_url: "https://www.soliscloud.com:13333",
    station_index: 0,
    is_active: true,
  });
  const [inverterCount, setInverterCount] = useState(0);

  useEffect(() => {
    if (workspaceId) fetchCredentials();
  }, [workspaceId]);

  const fetchCredentials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("solis_credentials")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .maybeSingle();

    if (data) {
      setCreds({
        id: data.id,
        api_id: data.api_id,
        api_secret: data.api_secret,
        api_url: data.api_url,
        station_index: data.station_index,
        is_active: data.is_active,
      });
    }

    const { count } = await supabase
      .from("solis_inverters")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId!);

    setInverterCount(count || 0);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!workspaceId || !creds.api_id || !creds.api_secret) {
      toast({ title: "Preencha API ID e API Secret", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      workspace_id: workspaceId,
      api_id: creds.api_id,
      api_secret: creds.api_secret,
      api_url: creds.api_url,
      station_index: creds.station_index,
      is_active: creds.is_active,
    };

    const { error } = creds.id
      ? await supabase.from("solis_credentials").update(payload).eq("id", creds.id)
      : await supabase.from("solis_credentials").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Credenciais salvas com sucesso!" });
      fetchCredentials();
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke("solis-proxy", {
        body: { action: "stationList", workspace_id: workspaceId },
      });

      if (resp.error || !resp.data?.success) {
        setTestResult("error");
        toast({ title: "Falha na conexão", description: resp.data?.msg || "Verifique suas credenciais", variant: "destructive" });
      } else {
        setTestResult("success");
        const stationCount = resp.data?.data?.page?.records?.length || 0;
        toast({ title: "Conexão bem-sucedida!", description: `${stationCount} estação(ões) encontrada(s)` });
      }
    } catch (e: any) {
      setTestResult("error");
      toast({ title: "Erro de conexão", description: e.message, variant: "destructive" });
    }
    setTesting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const resp = await supabase.functions.invoke("solis-proxy", {
        body: { action: "syncInverters", workspace_id: workspaceId },
      });

      if (resp.error || !resp.data?.success) {
        toast({ title: "Erro ao sincronizar", description: resp.data?.error || "Tente novamente", variant: "destructive" });
      } else {
        toast({ title: "Inversores sincronizados!", description: `${resp.data.data.synced} inversor(es) encontrado(s)` });
        fetchCredentials();
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSyncing(false);
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
                {creds.id && (
                  <Badge variant={creds.is_active ? "default" : "secondary"}>
                    {creds.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                )}
                {inverterCount > 0 && (
                  <Badge variant="outline">{inverterCount} inversor(es)</Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Conecte sua conta SolisCloud para monitorar em tempo real a geração de energia, 
              status dos inversores e histórico de produção. Obtenha suas credenciais em{" "}
              <a href="https://www.soliscloud.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                soliscloud.com
              </a>{" "}
              → Conta → Configurações Básicas → Gerenciamento de API.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>API ID</Label>
                <Input
                  placeholder="Ex: 1300386381676644416"
                  value={creds.api_id}
                  onChange={(e) => setCreds({ ...creds, api_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>API Secret</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    placeholder="Sua chave secreta"
                    value={creds.api_secret}
                    onChange={(e) => setCreds({ ...creds, api_secret: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
                {creds.id ? "Atualizar Credenciais" : "Salvar Credenciais"}
              </Button>

              {creds.id && (
                <>
                  <Button variant="outline" onClick={handleTest} disabled={testing}>
                    {testing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : testResult === "success" ? (
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    ) : testResult === "error" ? (
                      <AlertCircle className="w-4 h-4 mr-2 text-destructive" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>

                  <Button variant="outline" onClick={handleSync} disabled={syncing}>
                    {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sincronizar Inversores
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
          { name: "Growatt", desc: "Monitoramento de inversores Growatt", status: "Planejado" },
          { name: "Fronius", desc: "Monitoramento de inversores Fronius", status: "Planejado" },
          { name: "Huawei FusionSolar", desc: "Monitoramento de inversores Huawei", status: "Planejado" },
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
