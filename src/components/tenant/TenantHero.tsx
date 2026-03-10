import { motion } from "framer-motion";
import { Sun, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBannerDefault from "@/assets/hero-banner-1.jpg";

interface TenantHeroProps {
  settings: Record<string, string>;
  workspace: any;
}

export function TenantHero({ settings, workspace }: TenantHeroProps) {
  const backgroundImage = settings.hero_background_url || heroBannerDefault;
  const tagline = settings.hero_tagline || "Desenvolvendo o seu futuro com energia solar";
  const titlePrefix = settings.hero_title_prefix || "Economize até";
  const titleHighlight = settings.hero_title_highlight || "95%";
  const titleSuffix = settings.hero_title_suffix || "na sua conta de energia";
  const description = settings.hero_description || "Transforme a luz do sol em economia real. Sistema fotovoltaico completo com instalação profissional e garantia de 25 anos.";
  const btnPrimary = settings.hero_button_primary || "Simular Economia";
  const btnSecondary = settings.hero_button_secondary || "Agendar Visita Técnica";

  const stat1Value = settings.stat_1_value || settings.hero_stat_1_value || "500+";
  const stat1Label = settings.stat_1_label || settings.hero_stat_1_label || "Projetos Instalados";
  const stat2Value = settings.stat_2_value || settings.hero_stat_2_value || "95%";
  const stat2Label = settings.stat_2_label || settings.hero_stat_2_label || "Economia Média";
  const stat3Value = settings.stat_3_value || settings.hero_stat_3_value || "25";
  const stat3Label = settings.stat_3_label || settings.hero_stat_3_label || "Anos de Garantia";
  const stat4Value = settings.stat_4_value || settings.hero_stat_4_value || "10+";
  const stat4Label = settings.stat_4_label || settings.hero_stat_4_label || "Anos no Mercado";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

      <div className="container relative z-10 pt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              <Sun className="w-5 h-5 text-primary" />
              <span className="text-card text-sm font-medium">{tagline}</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-card leading-tight mb-6">
              {titlePrefix}{" "}
              <span className="text-primary">{titleHighlight}</span>{" "}
              {titleSuffix}
            </h1>

            <p className="text-lg md:text-xl text-card/80 mb-8 max-w-xl mx-auto lg:mx-0">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero" size="xl" asChild>
                  <a href="#simulador">
                    <Zap className="w-5 h-5" />
                    {btnPrimary}
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="hero-outline" size="xl" asChild>
                  <a href="#contato">{btnSecondary}</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Card */}
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
              <motion.div
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-orange-glow text-sm"
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
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat1Value}</p>
                <p className="text-sm opacity-80">{stat1Label}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat2Value}</p>
                <p className="text-sm opacity-80">{stat2Label}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat3Value}</p>
                <p className="text-sm opacity-80">{stat3Label}</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat4Value}</p>
                <p className="text-sm opacity-80">{stat4Label}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
