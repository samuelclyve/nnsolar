import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sun, ArrowRight, ArrowLeft, Check, Globe, Users,
  Zap, BarChart3, FileText, Calendar, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkspace } from "@/hooks/useWorkspace";

const steps = [
  {
    id: "welcome",
    icon: Sun,
    title: "Bem-vindo ao Solarize! 🎉",
    description:
      "Sua conta foi criada com sucesso. Vamos configurar tudo para você começar a usar o sistema completo para sua empresa solar.",
    tips: [
      "14 dias de acesso gratuito com todas as funcionalidades",
      "Sem necessidade de cartão de crédito",
      "Configure no seu ritmo",
    ],
  },
  {
    id: "site",
    icon: Globe,
    title: "Configure seu site",
    description:
      "Você tem um site personalizável incluído na sua assinatura. Configure banners, textos e depoimentos para atrair novos clientes.",
    action: { label: "Ir ao Editor de Site", route: "/site-editor" },
    tips: [
      "Adicione banners com promoções e serviços",
      "Configure textos do hero e informações da empresa",
      "Cadastre depoimentos de clientes satisfeitos",
    ],
  },
  {
    id: "crm",
    icon: Users,
    title: "Adicione seus primeiros leads",
    description:
      "O CRM é o coração do seu negócio. Cadastre leads, acompanhe o funil de vendas e nunca perca uma oportunidade.",
    action: { label: "Abrir CRM", route: "/crm" },
    tips: [
      "Arraste leads entre colunas no Kanban",
      "Leads do site são adicionados automaticamente",
      "Use filtros para encontrar leads rapidamente",
    ],
  },
  {
    id: "installations",
    icon: Zap,
    title: "Gerencie instalações",
    description:
      "Controle todo o ciclo de instalação: do projeto à ativação. Envie notificações por WhatsApp e faça upload de documentos.",
    action: { label: "Ver Instalações", route: "/installations" },
    tips: [
      "Acompanhe cada etapa da instalação",
      "Envie atualizações automáticas por WhatsApp",
      "Upload de fotos e documentos técnicos",
    ],
  },
  {
    id: "done",
    icon: Sparkles,
    title: "Tudo pronto!",
    description:
      "Seu Solarize está configurado e pronto para usar. Explore o dashboard para ter uma visão completa do seu negócio.",
    tips: [
      "Dashboard com métricas e gráficos em tempo real",
      "Agenda para organizar visitas e instalações",
      "Documentos centralizados e organizados",
    ],
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("solarize_onboarding_done", "true");
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleAction = (route: string) => {
    localStorage.setItem("solarize_onboarding_done", "true");
    onComplete();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-0 shadow-2xl">
        <CardContent className="p-0">
          {/* Progress */}
          <div className="flex gap-1 p-6 pb-0">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <step.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                {step.title}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {step.description}
              </p>

              {/* Tips */}
              <div className="space-y-3 mb-8">
                {step.tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{tip}</span>
                  </div>
                ))}
              </div>

              {/* Workspace info on welcome */}
              {step.id === "welcome" && workspace && (
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted-foreground">Workspace criado:</p>
                  <p className="font-semibold text-foreground">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trial ativo até{" "}
                    {workspace.trial_ends_at
                      ? new Date(workspace.trial_ends_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div>
                  {!isFirst && (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep((s) => s - 1)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  {step.action && (
                    <Button
                      variant="outline"
                      onClick={() => handleAction(step.action!.route)}
                      className="gap-2"
                    >
                      {step.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="cta" onClick={handleNext} className="gap-2">
                    {isLast ? "Ir ao Dashboard" : "Próximo"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Skip */}
              {!isLast && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      localStorage.setItem("solarize_onboarding_done", "true");
                      onComplete();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pular onboarding
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
