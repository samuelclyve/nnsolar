import { motion } from "framer-motion";
import { Sun, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-32 md:pt-40">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-solar-orange/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <motion.div 
          className="absolute top-1/4 right-1/4 w-4 h-4 bg-secondary rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-solar-orange-light rounded-full"
          animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sun className="w-5 h-5 text-secondary" />
              <span className="text-card text-sm font-medium">
                Desenvolvendo o seu futuro com energia solar
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-card leading-tight mb-6">
              Economize até{" "}
              <span className="text-gradient-orange inline-block">95%</span>{" "}
              na sua conta de energia
            </h1>

            <p className="text-lg md:text-xl text-card/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Transforme a luz do sol em economia real. Sistema fotovoltaico 
              completo com instalação profissional e garantia de 25 anos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <Zap className="w-5 h-5" />
                  Simular Economia
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Agendar Visita Técnica
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-card/20"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold text-card">500+</div>
                <div className="text-card/70 text-sm">Projetos Instalados</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">95%</div>
                <div className="text-card/70 text-sm">Economia Média</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-card">25</div>
                <div className="text-card/70 text-sm">Anos de Garantia</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main card mockup */}
              <motion.div 
                className="bg-card rounded-3xl shadow-2xl p-6 max-w-md mx-auto"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-muted-foreground text-sm">Economia Mensal</p>
                    <p className="text-3xl font-bold text-foreground">R$ 847,00</p>
                  </div>
                  <div className="w-14 h-14 bg-success/20 rounded-full flex items-center justify-center">
                    <Zap className="w-7 h-7 text-success" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-muted rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground text-sm">Geração Hoje</span>
                      <span className="text-success text-sm font-medium">+26%</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">42.8 kWh</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-secondary/10 rounded-xl p-3 text-center">
                      <Sun className="w-6 h-6 text-secondary mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">12 Painéis</p>
                      <p className="text-xs text-muted-foreground">Ativos</p>
                    </div>
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <Zap className="w-6 h-6 text-primary mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">7.2 kWp</p>
                      <p className="text-xs text-muted-foreground">Potência</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold shadow-orange-glow"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Sistema Ativo ✓
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
