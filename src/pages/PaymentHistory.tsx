import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, ArrowDownLeft, XCircle } from "lucide-react";

interface PaymentRecord {
  id: string;
  cakto_transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
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

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (!workspaceId) return;
    fetchPayments();
  }, [workspaceId]);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payment_history")
      .select("id, cakto_transaction_id, amount, currency, status, payment_method, created_at")
      .eq("workspace_id", workspaceId!)
      .order("created_at", { ascending: false });

    if (!error && data) setPayments(data);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CreditCard className="w-4 h-4" />;
      case "refunded": return <ArrowDownLeft className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <AppLayout title="Histórico de Pagamentos">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Carregando...</p>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma transação registrada ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => {
                  const cfg = statusConfig[p.status] || { label: p.status, variant: "secondary" as const };
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getStatusIcon(p.status)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {methodLabels[p.payment_method || "unknown"] || p.payment_method}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
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
