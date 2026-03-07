import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useUserRole } from "@/hooks/useUserRole";
import { Sun, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { isExpired, isTrial, daysLeft, isLoading: wsLoading } = useWorkspace();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();

  if (wsLoading || roleLoading) return null;

  // Super admins bypass subscription checks
  if (isSuperAdmin()) return <>{children}</>;

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Assinatura expirada
            </h2>
            <p className="text-muted-foreground mb-6">
              Seu período de acesso expirou. Para continuar usando o Solarize, 
              ative sua assinatura.
            </p>
            <div className="space-y-3">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Plano Mensal</p>
                <p className="text-2xl font-bold text-foreground">R$ 179,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Plano Anual <span className="text-primary font-medium">-20%</span></p>
                <p className="text-2xl font-bold text-foreground">R$ 143,92<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Entre em contato com o suporte para ativar sua assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
