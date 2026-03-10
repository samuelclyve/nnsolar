import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Check, Crown, Zap, ArrowLeft, Shield, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    id: "monthly",
    name: "Mensal",
    price: "R$ 179,90",
    priceDetail: "/mês",
    totalLabel: null,
    highlight: false,
    features: [
      "Dashboard completo com métricas",
      "CRM com Kanban de leads",
      "Gestão de instalações",
      "Site personalizável",
      "Documentos e contratos",
      "Agenda de instalações",
      "Gestão de equipe",
      "Notificações WhatsApp",
      "Suporte por email",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: "R$ 143,92",
    priceDetail: "/mês",
    totalLabel: "R$ 1.727,04/ano (economia de R$ 431,76)",
    highlight: true,
    badge: "-20%",
    features: [
      "Tudo do plano mensal",
      "20% de desconto",
      "Prioridade no suporte",
      "Onboarding personalizado",
      "Integrações avançadas",
      "Relatórios detalhados",
      "Multi-usuários ilimitados",
      "Backup automático",
      "Suporte prioritário",
    ],
  },
];

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [isLoading, setIsLoading] = useState(false);
  const { workspace } = useWorkspace();

  const handleCheckout = async (planId: string) => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        // User not logged in — open checkout URL directly with no email prefill
        const offerIds: Record<string, string> = {
          monthly: "gcwi2tz_800072",
          annual: "3daq6qh_800085",
        };
        window.open(`https://pay.cakto.com.br/${offerIds[planId]}`, "_blank");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cakto-webhook?action=generate-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan_id: planId }),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.checkout_url) {
        throw new Error(result.error || "Erro ao gerar checkout");
      }

      window.open(result.checkout_url, "_blank");
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error("Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Solarize</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            Pagamento seguro via Cakto
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {workspace?.subscription_status === "trial"
              ? "Seu período de teste está ativo. Assine agora para garantir acesso contínuo."
              : "Ative sua assinatura para continuar usando todas as funcionalidades do Solarize."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  plan.highlight
                    ? "border-primary shadow-primary/10 shadow-lg"
                    : "border-border"
                } ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                )}
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    {plan.highlight ? (
                      <Crown className="w-6 h-6 text-primary" />
                    ) : (
                      <Zap className="w-6 h-6 text-muted-foreground" />
                    )}
                    <h3 className="text-xl font-display font-bold text-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.priceDetail}</span>
                  </div>
                  {plan.totalLabel && (
                    <p className="text-sm text-primary font-medium mb-6">{plan.totalLabel}</p>
                  )}
                  {!plan.totalLabel && <div className="mb-6" />}

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlight ? "cta" : "outline"}
                    size="lg"
                    className="w-full gap-2"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckout(plan.id);
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    {plan.highlight ? "Assinar Plano Anual" : "Assinar Plano Mensal"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Pagamento seguro
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              PIX, Cartão ou Boleto
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Cancele quando quiser
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
