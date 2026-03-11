import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturesMegaMenu } from "@/components/landing/FeaturesMegaMenu";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";
import iconeSolarize from "@/assets/icone-solarize.png";

const MENU_CLOSE_DELAY = 200;

interface MainHeaderProps {
  activeLink?: string;
}

export function MainHeader({ activeLink }: MainHeaderProps) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeout.current = setTimeout(() => setMegaMenuOpen(false), MENU_CLOSE_DELAY);
  }, []);

  const linkClass = (name: string) =>
    `px-4 py-2 text-sm transition-colors rounded-full ${
      activeLink === name
        ? "text-primary-foreground bg-primary-foreground/15"
        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
    }`;

  const mobileLinks = [
    { name: "precos", label: "Preços", href: "/#pricing" },
    { name: "depoimentos", label: "Depoimentos", href: "/#testimonials" },
    { name: "integracoes", label: "Integrações", to: "/integracoes" },
  ];

  const featurePages = [
    { label: "CRM Solar", to: "/funcionalidades/crm" },
    { label: "Gestão de Instalações", to: "/funcionalidades/instalacoes" },
    { label: "Site Personalizável", to: "/funcionalidades/site" },
    { label: "Agenda Inteligente", to: "/funcionalidades/agenda" },
    { label: "Dashboard & Relatórios", to: "/funcionalidades/dashboard" },
    { label: "Gestão de Clientes", to: "/funcionalidades/clientes" },
    { label: "Documentos & Contratos", to: "/funcionalidades/documentos" },
    { label: "Controle Financeiro", to: "/funcionalidades/financeiro" },
    { label: "Notificações Automáticas", to: "/funcionalidades/notificacoes" },
    { label: "Gestão de Equipe", to: "/funcionalidades/equipe" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 pt-4">
          <nav className="relative flex items-center justify-between h-14 px-6 rounded-full overflow-hidden border border-primary/20 shadow-sm">
            <div className="absolute inset-0 bg-primary/90 backdrop-blur-xl" />
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.5) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }} />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
              <img src={iconeSolarize} alt="" className="h-24 w-auto object-contain -ml-4" />
            </div>

            <Link to="/" className="flex items-center relative z-10">
              <img src={logoSolarizeBranca} alt="Solarize" className="h-5 w-auto object-contain" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 relative z-10">
              <div className="relative" onMouseEnter={handleMegaMenuEnter} onMouseLeave={handleMegaMenuLeave}>
                <button className={`flex items-center gap-1 ${linkClass("funcionalidades")}`}>
                  Funcionalidades
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <FeaturesMegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} onMouseEnter={handleMegaMenuEnter} onMouseLeave={handleMegaMenuLeave} />
              </div>
              <a href="/#pricing" className={linkClass("precos")}>Preços</a>
              <a href="/#testimonials" className={linkClass("depoimentos")}>Depoimentos</a>
              <Link to="/integracoes" className={linkClass("integracoes")}>Integrações</Link>
            </div>

            {/* CTAs + mobile toggle */}
            <div className="flex items-center gap-2 relative z-10">
              <Link to="/auth" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">Entrar</Button>
              </Link>
              <Link to="/signup" className="hidden sm:block">
                <Button size="sm" className="gap-1.5 bg-card text-foreground hover:bg-card/90">
                  Começar grátis <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 overflow-y-auto md:hidden animate-fade-in">
          <div className="container mx-auto px-6 py-6 space-y-2">
            {/* Funcionalidades accordion */}
            <button
              onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
              className="w-full flex items-center justify-between py-3 px-4 text-foreground font-medium rounded-xl hover:bg-muted/50 transition-colors"
            >
              Funcionalidades
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${mobileFeaturesOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileFeaturesOpen && (
              <div className="pl-4 space-y-1 pb-2">
                {featurePages.map((fp) => (
                  <Link
                    key={fp.to}
                    to={fp.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    {fp.label}
                  </Link>
                ))}
              </div>
            )}

            {mobileLinks.map((link) => (
              link.to ? (
                <Link
                  key={link.name}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-foreground font-medium rounded-xl hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 px-4 text-foreground font-medium rounded-xl hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}

            <div className="pt-6 space-y-3">
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2" size="lg">
                  Começar grátis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full mt-2" size="lg">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
