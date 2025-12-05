import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Main nav - transparent with blur on scroll */}
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? "bg-card/90 backdrop-blur-lg shadow-md" 
          : "bg-transparent"
      }`}>
        <div className="container flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoNn} 
              alt="NN Energia Solar" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  isScrolled 
                    ? "text-foreground/80 hover:text-primary hover:bg-muted" 
                    : "text-card/90 hover:text-card hover:bg-card/10"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="tel:+5588998471511" 
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isScrolled 
                  ? "text-foreground/70 hover:text-primary" 
                  : "text-card/80 hover:text-card"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">(88) 9.9847-1511</span>
            </a>
            {user ? (
              <>
                <Button 
                  variant={isScrolled ? "outline" : "hero-outline"} 
                  size="sm" 
                  asChild
                >
                  <Link to="/dashboard">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className={isScrolled ? "" : "text-card hover:bg-card/10"}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={isScrolled ? "ghost" : "hero-outline"} 
                  size="sm" 
                  asChild
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="cta" size="sm" asChild>
                  <a href="#simulador">Simular Economia</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-full ${
              isScrolled ? "text-foreground" : "text-card"
            }`}
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
                  {user ? (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                          Entrar
                        </Link>
                      </Button>
                      <Button variant="cta" asChild>
                        <a href="#simulador" onClick={() => setIsMenuOpen(false)}>
                          Simular Economia
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
