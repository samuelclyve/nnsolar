import { Link } from "react-router-dom";
import { 
  ArrowRight, Target, Wrench, Globe, Calendar, 
  FileText, Users, BarChart3, ChevronRight, Shield, Bell, Lock
} from "lucide-react";

interface FeaturesMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const categories = [
  {
    title: "Vendas",
    color: "bg-primary/10 border-primary/20",
    iconColor: "text-primary",
    items: [
      { icon: Target, name: "CRM com Kanban", description: "Pipeline visual de vendas", href: "/funcionalidades/crm" },
      { icon: BarChart3, name: "Dashboard & Relatórios", description: "Métricas e performance", href: "/funcionalidades/dashboard" },
      { icon: Users, name: "Gestão de Clientes", description: "Base completa com histórico", href: "/funcionalidades/clientes" },
    ],
  },
  {
    title: "Operação",
    color: "bg-success/10 border-success/20",
    iconColor: "text-success",
    items: [
      { icon: Wrench, name: "Gestão de Instalações", description: "Acompanhe cada etapa", href: "/funcionalidades/instalacoes" },
      { icon: Calendar, name: "Agenda Inteligente", description: "Calendário drag-and-drop", href: "/funcionalidades/agenda" },
      { icon: Bell, name: "Notificações Automáticas", description: "Alertas por e-mail e WhatsApp", href: "/funcionalidades/notificacoes" },
    ],
  },
  {
    title: "Marketing",
    color: "bg-secondary/10 border-secondary/20",
    iconColor: "text-secondary",
    items: [
      { icon: Globe, name: "Site Personalizável", description: "Landing page com simulador", href: "/funcionalidades/site" },
      { icon: Users, name: "Captação de Leads", description: "Formulários automáticos", href: "/funcionalidades/crm" },
    ],
  },
  {
    title: "Organização",
    color: "bg-accent/10 border-accent/20",
    iconColor: "text-accent",
    items: [
      { icon: FileText, name: "Documentos & Contratos", description: "Armazene e organize", href: "/funcionalidades/documentos" },
      { icon: Lock, name: "Gestão de Equipe", description: "Controle de acessos", href: "/funcionalidades/equipe" },
      { icon: Shield, name: "Controle Financeiro", description: "Parcelas e cobranças", href: "/funcionalidades/financeiro" },
    ],
  },
];

export function FeaturesMegaMenu({ isOpen, onClose, onMouseEnter, onMouseLeave }: FeaturesMegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 pt-3 w-[calc(100vw-2rem)] max-w-[900px] z-50"
      style={{ top: '72px' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-primary/5 px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Ecossistema Solarize</h3>
            <p className="text-xs text-muted-foreground">Tudo que sua empresa solar precisa em um só lugar</p>
          </div>
          <a
            href="#features"
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
            onClick={onClose}
          >
            Ver tudo
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Content - 4 columns */}
        <div className="p-6">
          <div className="grid grid-cols-4 gap-5">
            {categories.map((cat) => (
              <div key={cat.title} className="space-y-3">
                {/* Category badge */}
                <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${cat.color}`}>
                  {cat.title}
                </div>

                {/* Items */}
                <ul className="space-y-1">
                  {cat.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
                        onClick={onClose}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors`}>
                          <item.icon className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="text-primary-foreground">
              <p className="font-medium text-sm">Experimente grátis por 14 dias</p>
              <p className="text-xs text-primary-foreground/70">Sem cartão de crédito</p>
            </div>
            <Link
              to="/signup"
              className="px-5 py-2 bg-card text-foreground font-medium rounded-lg hover:bg-card/90 transition-colors text-sm"
              onClick={onClose}
            >
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
