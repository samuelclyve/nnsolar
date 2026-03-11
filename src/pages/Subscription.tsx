import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Calendar, CheckCircle2, AlertTriangle, Clock,
  Receipt, ArrowDownLeft, XCircle, Zap
} from "lucide-react";

interface PaymentRecord {
  id: string;
  cakto_transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary"; color: string }> = {
  trial: { label: "Trial", variant: "secondary", color: "text-accent" },
  active: { label: "Ativo", variant: "default", color: "text-primary" },
  expired: { label: "Expirado", variant: "destructive", color: "text-destructive" },
  cancelled: { label: "Cancelado", variant: "outline", color: "text-muted-foreground" },
};

const paymentStatusConfig: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  completed: { label: "Aprovado", variant: "default" },
  refunded: { label: "Reembolsado", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

const methodLabels: Record<string, string> = {
  credit_card: "Cartão de Crédito",
  pix: "PIX",
  boleto: "Boleto",
  refund: "Reembolso",
  cancellation: "Cancelamento",
  unknown: "Não informado",
};

export default function Subscription() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { workspace, workspaceId, isTrial, isExpired, daysLeft } = useWorkspace();

  useEffect(() => {
    if (workspaceId) fetchPayments();
  }, [workspaceId]);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payment_history")
      .select("id, cakto_transaction_id, amount, currency, status, payment_method, created_at")
      .eq("workspace_id", workspaceId!)
      .order("created_at", { ascending: false });

    if (data) setPayments(data);
    setIsLoading(false);
  };

  const subscriptionStatus = workspace?.subscription_status || "trial";
  const config = statusConfig[subscriptionStatus] || statusConfig.trial;
  const planLabel = workspace?.plan === "annual" ? "Anual" : workspace?.plan === "monthly" ? "Mensal" : "Trial";
  const planAmount = workspace?.plan === "annual" ? "R$ 143,92/mês" : "R$ 179,90/mês";
  const trialEnd = workspace?.trial_ends_at ? new Date(workspace.trial_ends_at) : null;
  const createdAt = workspace?.created_at ? new Date(workspace.created_at) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CreditCard className="w-4 h-4" />;
      case "refunded": return <ArrowDownLeft className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <AppLayout title="Assinatura">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Assinatura</h1>
        <p className="text-muted-foreground">Gerencie seu plano e veja o histórico de pagamentos.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Plan Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-2">
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">Plano {planLabel}</h3>
                  <p className="text-sm text-muted-foreground">{workspace?.name || "Workspace"}</p>
                </div>
              </div>
              <Badge variant={config.variant} className="text-sm px-3 py-1">{config.label}</Badge>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor</p>
                  <p className="text-lg font-bold text-foreground">
                    {subscriptionStatus === "trial" ? "Grátis" : planAmount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {isTrial ? "Trial expira em" : "Membro desde"}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {isTrial && trialEnd
                      ? trialEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                      : createdAt
                        ? createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {isTrial ? "Dias restantes" : "Plano"}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {isTrial ? `${daysLeft} dias` : planLabel}
                  </p>
                </div>
              </div>

              {/* Trial progress bar */}
              {isTrial && daysLeft > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Período de trial
                    </span>
                    <span className="font-medium text-accent">{daysLeft} de 14 dias</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-accent to-primary h-2.5 rounded-full transition-all"
                      style={{ width: `${((14 - daysLeft) / 14) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              {(isTrial || isExpired) && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {isExpired ? (
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {isExpired ? "Seu acesso expirou" : "Aproveite todas as funcionalidades"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isExpired
                            ? "Ative sua assinatura para continuar usando o Solarize."
                            : "Assine agora e garanta acesso ilimitado após o trial."
                          }
                        </p>
                      </div>
                    </div>
                    <Link to="/checkout">
                      <Button variant="cta" className="gap-2 whitespace-nowrap">
                        <CreditCard className="w-4 h-4" />
                        Assinar Agora
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {subscriptionStatus === "active" && (
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Sua assinatura está ativa. Aproveite todos os recursos do Solarize!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Planos disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${workspace?.plan === "monthly" ? "border-primary bg-primary/5" : "border-border"}`}>
                <p className="text-xs text-muted-foreground mb-1">Mensal</p>
                <p className="text-2xl font-bold text-foreground">R$ 179,90<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
              </div>
              <div className={`p-4 rounded-xl border-2 ${workspace?.plan === "annual" ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">Anual</p>
                  <Badge className="bg-primary/20 text-primary text-[9px] px-1.5 h-4">-20%</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">R$ 143,92<span className="text-xs font-normal text-muted-foreground">/mês</span></p>
                <p className="text-[10px] text-muted-foreground mt-1">R$ 1.727,04 pagamento único</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> CRM completo</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Gestão de instalações</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Site personalizado</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Relatórios e exportação</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Usuários ilimitados</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="w-5 h-5 text-primary" />
              Histórico de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">
                Nenhuma transação registrada ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => {
                  const cfg = paymentStatusConfig[p.status] || { label: p.status, variant: "secondary" as const };
                  return (
                    <div key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          {getStatusIcon(p.status)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {methodLabels[p.payment_method || "unknown"] || p.payment_method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "long", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${p.amount < 0 ? "text-destructive" : "text-foreground"}`}>
                          {p.amount < 0 ? "- " : ""}R$ {Math.abs(p.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
