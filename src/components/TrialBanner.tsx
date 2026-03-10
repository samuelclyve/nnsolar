import { Link } from "react-router-dom";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner() {
  const { isTrial, isExpired, daysLeft } = useWorkspace();

  if (!isTrial || isExpired) return null;

  return (
    <div className="mb-6 rounded-xl bg-primary/10 border border-primary/20 p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">
            Período de teste — {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}
          </p>
          <p className="text-xs text-muted-foreground">
            Assine agora para não perder acesso às funcionalidades.
          </p>
        </div>
      </div>
      <Link to="/checkout">
        <Button variant="cta" size="sm" className="gap-2">
          <CreditCard className="w-4 h-4" />
          Assinar agora
        </Button>
      </Link>
    </div>
  );
}
