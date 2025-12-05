import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoNn from "@/assets/logo-nn-energia-solar.png";

const navLinks = [
  { label: "Início", href: "#home" },
  { label: "Simulador", href: "#simulador" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden md:block">
        <div className="container flex items-center justify-end gap-6 text-sm">
          <a href="tel:+5588998471511" className="flex items-center gap-2 hover:text-secondary transition-colors">
            <Phone className="w-4 h-4" />
            (88) 9.9847-1511
          </a>
          <a href="mailto:contato@nnenergiasolar.com.br" className="flex items-center gap-2 hover:text-secondary transition-colors">
            <Mail className="w-4 h-4" />
            contato@nnenergiasolar.com.br
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img 
              src={logoNn} 
              alt="NN Energia Solar" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-primary font-medium transition-colors story-link"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            <Button variant="cta" size="lg">
              Simular Economia
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-t border-border"
            >
              <div className="container py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-foreground/80 hover:text-primary font-medium py-2 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Button variant="cta" className="mt-2">
                  Simular Economia
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
