import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BarChart3, Users, Wrench, Globe, Calendar, 
  FileText, ArrowRight, Check, Zap, Star,
  BookOpen, Download, Mail, Instagram, 
  TrendingUp, Shield, Clock, Sparkles,
  MessageCircle, PieChart, Settings, Smartphone,
  Target, LayoutDashboard, Bell, Lock, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturesMegaMenu } from "@/components/landing/FeaturesMegaMenu";
import logoSolarize from "@/assets/logo-solarize.png";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";
import iconeSolarize from "@/assets/icone-solarize.png";

const MENU_CLOSE_DELAY = 200;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const gridBg = {
  backgroundImage: `linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)`,
  backgroundSize: '48px 48px',
};

const gridBgLight = {
  backgroundImage: `linear-gradient(hsl(var(--border) / 0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.25) 1px, transparent 1px)`,
  backgroundSize: '48px 48px',
};

const stats = [
  { value: "500+", label: "Empresas solares", icon: TrendingUp },
  { value: "98%", label: "Satisfação", icon: Star },
  { value: "40%", label: "Mais conversões", icon: Zap },
  { value: "24/7", label: "Suporte", icon: Shield },
];

const platformFeatures = [
  {
    tag: "CRM",
    icon: Target,
    title: "Nunca mais perca um lead",
    description: "Gerencie todo o funil de vendas com Kanban visual. Do primeiro contato ao fechamento, tenha visibilidade completa sobre cada oportunidade e aumente sua taxa de conversão.",
    bullets: [
      "Pipeline visual com drag-and-drop",
      "Histórico completo de interações",
      "Atribuição automática de leads",
    ],
  },
  {
    tag: "Instalações",
    icon: Wrench,
    title: "Controle total sobre cada instalação",
    description: "Acompanhe cada etapa do processo: projeto, aprovação, instalação, vistoria e ativação. Notifique clientes automaticamente via WhatsApp e nunca perca um prazo.",
    bullets: [
      "5 etapas de acompanhamento automático",
      "Notificações via WhatsApp para o cliente",
      "Documentos e fotos por instalação",
    ],
  },
  {
    tag: "Site",
    icon: Globe,
    title: "Seu site profissional em minutos",
    description: "Cada empresa recebe seu próprio site com domínio personalizado, simulador solar integrado, depoimentos de clientes e captação automática de leads.",
    bullets: [
      "Simulador de economia integrado",
      "Captação automática de leads",
      "100% personalizável com sua marca",
    ],
  },
];

const useCases = [
  { icon: Target, title: "CRM Solar", description: "Pipeline completo de vendas com Kanban visual" },
  { icon: Wrench, title: "Gestão de Instalações", description: "Controle cada etapa da obra em tempo real" },
  { icon: Globe, title: "Site Personalizável", description: "Landing page com simulador solar integrado" },
  { icon: Calendar, title: "Agenda Inteligente", description: "Calendário drag-and-drop de visitas e obras" },
  { icon: BarChart3, title: "Dashboard & Relatórios", description: "Métricas de vendas, instalações e performance" },
  { icon: Users, title: "Gestão de Clientes", description: "Base completa com histórico e documentos" },
  { icon: FileText, title: "Documentos & Contratos", description: "Armazene e organize contratos e projetos" },
  { icon: Shield, title: "Controle Financeiro", description: "Parcelas, cobranças e fluxo de recebimentos" },
  { icon: Bell, title: "Notificações Automáticas", description: "Alertas por e-mail e WhatsApp para clientes" },
  { icon: Lock, title: "Gestão de Equipe", description: "Controle de acessos e permissões por função" },
];

const industries = [
  { icon: Zap, title: "Integradores solares", description: "Gerencie leads, instalações e equipe de campo em uma única plataforma." },
  { icon: Smartphone, title: "Startups de energia", description: "Lance sua operação solar com site, CRM e gestão prontos para usar." },
  { icon: PieChart, title: "Distribuidores", description: "Controle pedidos, instalações e performance da rede de integradores." },
  { icon: Users, title: "Equipes comerciais", description: "Acompanhe metas, pipeline e conversões do time de vendas." },
  { icon: Settings, title: "Empresas de manutenção", description: "Agende visitas técnicas, gerencie clientes e documentações." },
  { icon: LayoutDashboard, title: "Consultorias", description: "Dashboard completo com relatórios de performance e ROI." },
  { icon: Lock, title: "Franquias solares", description: "Controle multi-unidade com gestão centralizada e sites independentes." },
  { icon: Bell, title: "Sua empresa solar?", description: "O Solarize se adapta a qualquer modelo de negócio no setor de energia solar." },
];

const plans = [
  {
    name: "Mensal",
    price: "179",
    cents: ",90",
    period: "/mês",
    description: "Flexibilidade total, cancele quando quiser",
    popular: false,
  },
  {
    name: "Anual",
    price: "143",
    cents: ",92",
    period: "/mês",
    description: "Economize 20% — R$ 1.727,04/ano",
    popular: true,
    badge: "Mais popular",
  },
];

const testimonials = [
  { name: "Carlos Mendes", company: "Solar Tech MG", message: "O Solarize transformou nossa gestão. Antes perdíamos leads, agora convertemos 40% mais.", rating: 5 },
  { name: "Ana Paula", company: "EcoSol Energia", message: "O site personalizável trouxe 3x mais leads orgânicos no primeiro mês.", rating: 5 },
  { name: "Ricardo Souza", company: "R&S Solar", message: "A gestão de instalações em etapas nos deu controle total sobre cada projeto.", rating: 5 },
];

export default function Index() {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    };
  }, []);

  const handleMegaMenuEnter = useCallback(() => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  }, []);

  const handleMegaMenuLeave = useCallback(() => {
    megaMenuTimeout.current = setTimeout(() => setMegaMenuOpen(false), MENU_CLOSE_DELAY);
  }, []);

  return (
    <div className="min-h-screen bg-card">
      {/* Header - Orange with grid and icon */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 pt-4">
          <nav className="relative flex items-center justify-between h-14 px-6 rounded-full overflow-hidden border border-primary/20 shadow-sm">
            {/* Background: orange glass with subtle grid */}
            <div className="absolute inset-0 bg-primary/90 backdrop-blur-xl" />
            <div className="absolute inset-0 opacity-[0.08]" style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.5) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }} />
            
            {/* Solarize icon - large, positioned left, faded */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none">
              <img src={iconeSolarize} alt="" className="h-24 w-auto object-contain -ml-4" />
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center relative z-10">
              <img src={logoSolarizeBranca} alt="Solarize" className="h-5 w-auto object-contain" />
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-1 relative z-10">
              {/* Funcionalidades with mega menu */}
              <div
                className="relative"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                  Funcionalidades
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <FeaturesMegaMenu
                  isOpen={megaMenuOpen}
                  onClose={() => setMegaMenuOpen(false)}
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                />
              </div>
              <a href="#pricing" className="px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                Preços
              </a>
              <a href="#testimonials" className="px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                Depoimentos
              </a>
              <Link to="/integracoes" className="px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                Integrações
              </Link>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 relative z-10">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10">Entrar</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-1.5 bg-card text-foreground hover:bg-card/90">
                  Começar grátis <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0" style={gridBgLight} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-5 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                14 dias grátis — sem cartão de crédito
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeUp} 
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-[1.08] tracking-tight"
            >
               O ecossistema completo para sua{" "}
              <span className="text-gradient-orange">empresa solar</span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              CRM, gestão de instalações, site personalizável e controle financeiro — 
              tudo em uma plataforma integrada para empresas de energia solar.
            </motion.p>

            <motion.div 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/signup">
                <Button size="xl" className="gap-2 shadow-orange-glow">
                  Começar teste grátis <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="https://wa.me/5588998536228" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="xl" className="gap-2">
                  <MessageCircle className="w-5 h-5" /> Falar com consultor
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div 
                  key={stat.label} 
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
                >
                  <stat.icon className="w-5 h-5 text-primary mb-1" />
                  <span className="text-2xl md:text-3xl font-display font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Platform - Alternating Feature Sections (Enode-style) */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
                Nossa Plataforma
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp} 
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
            >
              Tudo que sua empresa solar precisa
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Ferramentas profissionais integradas para gerenciar vendas, operações e marketing.
            </motion.p>
          </motion.div>

          {/* Feature blocks - alternating layout */}
          <div className="space-y-32">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
              >
                {/* Text side */}
                <div className="flex-1 max-w-lg">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-primary text-sm font-semibold">{feature.tag}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3 text-foreground">
                        <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                        <span className="text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#pricing" className="inline-flex items-center gap-1.5 text-primary font-medium mt-6 hover:gap-2.5 transition-all text-sm">
                    Saiba mais <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Visual side - glass card with grid */}
                <div className="flex-1 relative">
                  <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl">
                    <div className="absolute inset-0 opacity-[0.03]" style={gridBg} />
                    <div className="p-8 md:p-10 relative">
                      {index === 0 && (
                        /* CRM Mockup */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-foreground">Pipeline de Vendas</h4>
                            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">+12 leads hoje</span>
                          </div>
                          {["Novo Lead", "Em Negociação", "Proposta Enviada", "Fechado"].map((stage, i) => (
                            <div key={stage} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${i === 3 ? 'bg-success' : i === 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                <span className="text-sm font-medium text-foreground">{stage}</span>
                              </div>
                              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{[8, 5, 3, 12][i]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {index === 1 && (
                        /* Installation Mockup */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-foreground">Instalação #0247</h4>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Em andamento</span>
                          </div>
                          {["Projeto", "Aprovação", "Instalação", "Vistoria", "Ativação"].map((step, i) => (
                            <div key={step} className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`}>
                                {i < 3 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${i < 3 ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                                  {i < 3 && <span className="text-xs text-success">Concluído</span>}
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted mt-1.5">
                                  <div className={`h-full rounded-full ${i < 3 ? 'bg-success' : i === 3 ? 'bg-primary w-1/3' : 'w-0'} transition-all`} style={{ width: i < 3 ? '100%' : i === 3 ? '33%' : '0%' }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {index === 2 && (
                        /* Site Mockup */
                        <div className="space-y-4">
                          <div className="rounded-xl overflow-hidden border border-border/50">
                            <div className="bg-secondary h-2 flex items-center gap-1 px-2">
                              <div className="w-1 h-1 rounded-full bg-secondary-foreground/30" />
                              <div className="w-1 h-1 rounded-full bg-secondary-foreground/30" />
                              <div className="w-1 h-1 rounded-full bg-secondary-foreground/30" />
                            </div>
                            <div className="p-4 bg-background">
                              <div className="flex items-center justify-between mb-4">
                                <div className="w-20 h-4 rounded bg-muted" />
                                <div className="flex gap-2">
                                  <div className="w-12 h-3 rounded bg-muted" />
                                  <div className="w-12 h-3 rounded bg-muted" />
                                </div>
                              </div>
                              <div className="bg-primary/10 rounded-lg p-4 mb-3">
                                <div className="w-3/4 h-4 rounded bg-primary/20 mb-2" />
                                <div className="w-1/2 h-3 rounded bg-primary/15" />
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-12 rounded bg-muted/60" />
                                <div className="h-12 rounded bg-muted/60" />
                                <div className="h-12 rounded bg-muted/60" />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Leads captados hoje</span>
                            <span className="font-bold text-success">+7</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Simulações realizadas</span>
                            <span className="font-bold text-primary">23</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases - Simple grid (Enode-style) */}
      <section className="py-20 relative" style={gridBgLight}>
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-bold text-foreground mb-12"
          >
            Módulos do ecossistema
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {useCases.map((uc, i) => (
              <motion.div
                key={uc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <uc.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                <a href="#pricing" className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:gap-2 transition-all">
                  Saiba mais <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries - 2-row grid (Enode-style) */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 opacity-[0.02]" style={gridBg} />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-display font-bold text-foreground"
            >
              Para quem é o Solarize?
            </motion.h2>
            <a href="#pricing" className="hidden md:inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all">
              Ver planos <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">
            {industries.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
          >
            <p className="text-muted-foreground text-sm font-medium">Confiado por empresas de energia solar em todo o Brasil</p>
            <div className="flex items-center gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24 h-10 bg-muted/60 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/40 font-bold">PARCEIRO</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-primary" />
                Preços
                <span className="w-8 h-px bg-primary" />
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
            >
              Preços simples e transparentes
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              Comece com 14 dias grátis. Sem cartão de crédito.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? "border-2 border-primary shadow-orange-glow bg-card" 
                    : "border border-border/60 bg-card hover:border-primary/20"
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
                  )}
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      {plan.popular && (
                        <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline mb-2">
                      <span className="text-sm text-muted-foreground mr-1">R$</span>
                      <span className="text-5xl font-display font-bold text-foreground">{plan.price}</span>
                      <span className="text-2xl font-bold text-foreground">{plan.cents}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {["Site personalizável", "CRM com Kanban", "Gestão de instalações", "Agenda inteligente", "Documentos ilimitados", "Equipe ilimitada", "Suporte prioritário"].map(item => (
                        <li key={item} className="flex items-center gap-3 text-sm text-foreground">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link to="/signup">
                      <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                        Começar teste grátis
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-background relative">
        <div className="absolute inset-0 opacity-[0.02]" style={gridBg} />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                <span className="w-8 h-px bg-primary" />
                Depoimentos
                <span className="w-8 h-px bg-primary" />
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
            >
              Empresas que crescem com Solarize
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="border border-border/60 bg-card hover:border-primary/20 transition-all duration-300 h-full hover:shadow-md">
                  <CardContent className="p-7">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed">"{t.message}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{t.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Ready to get started */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 gradient-hero" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.15) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }} />
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5 leading-tight">
                Pronto para transformar<br className="hidden md:block" /> sua empresa solar?
              </h2>
              <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                Comece hoje mesmo com 14 dias grátis. Sem compromisso, sem cartão de crédito.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="xl" className="gap-2 bg-card text-foreground hover:bg-card/90 shadow-xl">
                    Criar minha conta grátis <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="https://wa.me/5588998536228" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="xl" className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <MessageCircle className="w-5 h-5" /> Falar com vendas
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Bar */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Fique por dentro do mercado solar</p>
                <p className="text-xs text-muted-foreground">Assine nossa newsletter com dicas e tendências</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu e-mail*" 
                className="px-4 py-2 rounded-full border border-border bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button size="sm" className="rounded-full gap-1">
                Assinar <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <img src={logoSolarizeBranca} alt="Solarize" className="h-8 w-auto object-contain mb-5" />
              <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6">
                O ecossistema completo para empresas de energia solar. CRM, gestão de instalações, site e muito mais.
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com/solarize.app" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="mailto:contato@solarize.app"
                  className="w-9 h-9 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/80 mb-5">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Preços</a></li>
                <li><a href="#testimonials" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Depoimentos</a></li>
                <li><Link to="/signup" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Começar grátis</Link></li>
                <li><Link to="/auth" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Entrar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/80 mb-5">Conteúdo</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/blog" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Blog
                  </Link>
                </li>
                <li>
                  <Link to="/materiais" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Materiais para Download
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/80 mb-5">Suporte</h4>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contato@solarize.app" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> contato@solarize.app
                  </a>
                </li>
                <li><a href="#" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/40">
            <p>© {new Date().getFullYear()} Solarize. Todos os direitos reservados.</p>
            <p>Feito com ☀️ para empresas de energia solar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
