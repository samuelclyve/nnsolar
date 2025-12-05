import { motion } from "framer-motion";
import { Sun, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner-1.jpg";

export function Hero() {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />

      <div className="container relative z-10 pt-24">
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
              className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-card/20"
            >
              <Sun className="w-5 h-5 text-secondary" />
              <span className="text-card text-sm font-medium">
                Desenvolvendo o seu futuro com energia solar
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-card leading-tight mb-6">
              Economize até{" "}
              <span className="text-secondary">95%</span>{" "}
              na sua conta de energia
            </h1>

            <p className="text-lg md:text-xl text-card/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Transforme a luz do sol em economia real. Sistema fotovoltaico 
              completo com instalação profissional e garantia de 25 anos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero" size="xl" asChild>
                  <a href="#simulador">
                    <Zap className="w-5 h-5" />
                    Simular Economia
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero-outline" size="xl" asChild>
                  <a href="#contato">Agendar Visita Técnica</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Visual - Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <motion.div 
              className="bg-card/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-md mx-auto border border-card/20"
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

              {/* Badge */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold shadow-orange-glow text-sm"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Sistema Ativo ✓
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pb-8"
        >
          <div className="bg-card/10 backdrop-blur-md rounded-2xl border border-card/20 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-card">
              <div>
                <p className="text-3xl md:text-4xl font-bold mb-1">500+</p>
                <p className="text-sm opacity-80">Projetos Instalados</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-secondary mb-1">95%</p>
                <p className="text-sm opacity-80">Economia Média</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold mb-1">25</p>
                <p className="text-sm opacity-80">Anos de Garantia</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold mb-1">10+</p>
                <p className="text-sm opacity-80">Anos no Mercado</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
