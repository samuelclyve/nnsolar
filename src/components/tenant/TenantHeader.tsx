import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TenantHeaderProps {
  workspace: any;
  settings?: Record<string, string>;
}

const navLinks = [
  { label: "Início", href: "#home" },
  { label: "Simulador", href: "#simulador" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

export function TenantHeader({ workspace, settings = {} }: TenantHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappLink = workspace.whatsapp
    ? `https://wa.me/55${workspace.whatsapp.replace(/\D/g, "")}`
    : null;

  const logoVariant = settings.header_logo_variant || "original";
  const logoFilterStyle: React.CSSProperties =
    logoVariant === "white"
      ? { filter: "brightness(0) invert(1)" }
      : logoVariant === "black"
        ? { filter: "brightness(0)" }
        : {};

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-transparent">
        <div className="container flex items-center justify-between h-20">
          <a href="#home" className="flex items-center">
            {workspace.logo_url ? (
              <img
                src={workspace.logo_url}
                alt={workspace.name}
                className={`h-7 md:h-8 w-auto object-contain ${logoFilterClass}`}
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sun className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-card">{workspace.name}</span>
              </div>
            )}
          </a>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full font-medium transition-all text-card/90 hover:text-card hover:bg-card/15 backdrop-blur-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 text-card hover:bg-card/20 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
            <Button variant="cta" size="sm" asChild>
              <a href="#simulador">Simular Economia</a>
            </Button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 text-card"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card/95 backdrop-blur-lg border-t border-border"
            >
              <div className="container py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground/80 hover:text-primary font-medium py-3 px-4 rounded-xl hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                  <Button variant="cta" asChild>
                    <a href="#simulador" onClick={() => setIsMenuOpen(false)}>
                      Simular Economia
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
