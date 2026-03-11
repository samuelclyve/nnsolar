import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  BarChart3, Users, Wrench, Globe, Calendar, 
  FileText, ArrowRight, Check, Zap, Star,
  BookOpen, Download, Mail, Instagram, 
  TrendingUp, Shield, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoSolarize from "@/assets/logo-solarize.png";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";

const features = [
  { icon: BarChart3, title: "CRM Completo", description: "Gerencie leads do primeiro contato ao fechamento com Kanban drag-and-drop.", tag: "Vendas" },
  { icon: Wrench, title: "Gestão de Instalações", description: "Acompanhe cada etapa: projeto, aprovação, instalação, vistoria e ativação.", tag: "Operação" },
  { icon: Globe, title: "Site Personalizável", description: "Seu site profissional com simulador solar, depoimentos e captação de leads.", tag: "Marketing" },
  { icon: Calendar, title: "Agenda Inteligente", description: "Calendário visual com arrastar e soltar para visitas e instalações.", tag: "Produtividade" },
  { icon: FileText, title: "Documentos Centralizados", description: "Contratos, projetos e fotos organizados por cliente e instalação.", tag: "Organização" },
  { icon: Users, title: "Gestão de Equipe", description: "Controle de acesso por função: admin, gestor, comercial e técnico.", tag: "Equipe" },
];

const stats = [
  { value: "500+", label: "Empresas solares", icon: TrendingUp },
  { value: "98%", label: "Satisfação", icon: Star },
  { value: "40%", label: "Mais conversões", icon: Zap },
  { value: "24/7", label: "Suporte", icon: Shield },
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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Index() {
  return (
    <div className="min-h-screen bg-card">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 pt-4">
          <nav className="flex items-center justify-between h-14 px-6 bg-card/70 backdrop-blur-xl border border-border/50 rounded-full shadow-sm">
            <Link to="/" className="flex items-center">
              <img src={logoSolarize} alt="Solarize" className="h-5 w-auto object-contain" />
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Funcionalidades", href: "#features" },
                { label: "Preços", href: "#pricing" },
                { label: "Depoimentos", href: "#testimonials" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-muted-foreground">Entrar</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-1.5">
                  Começar grátis <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl" />
          <div className="absolute top-64 right-0 w-96 h-96 bg-secondary/[0.03] rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-5 py-2 rounded-full text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                14 dias grátis — sem cartão de crédito
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={fadeUp} 
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-[1.08] tracking-tight"
            >
              O sistema completo para sua{" "}
              <span className="text-gradient-orange">empresa solar</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              CRM, gestão de instalações, site personalizável e controle financeiro — 
              tudo em uma plataforma integrada para empresas de energia solar.
            </motion.p>

            {/* CTAs */}
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
              <a href="#features">
                <Button variant="outline" size="xl">
                  Ver funcionalidades
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
                  className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-background/80 border border-border/50"
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

      {/* Features - Bento Grid */}
      <section id="features" className="py-24 bg-background">
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
                Funcionalidades
                <span className="w-8 h-px bg-primary" />
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp} 
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
            >
              Tudo que você precisa<br className="hidden md:block" /> em um só lugar
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Ferramentas profissionais para gerenciar cada aspecto do seu negócio solar.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <Card className="group border border-border/60 bg-card hover:border-primary/30 transition-all duration-300 h-full hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-7">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
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
      <section id="testimonials" className="py-24 bg-background">
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

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl"
          >
            {/* Background */}
            <div className="absolute inset-0 gradient-hero" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.4) 0%, transparent 50%)`,
            }} />
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-5 leading-tight">
                Pronto para transformar<br className="hidden md:block" /> sua empresa solar?
              </h2>
              <p className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                Comece hoje mesmo com 14 dias grátis. Sem compromisso, sem cartão de crédito.
              </p>
              <Link to="/signup">
                <Button size="xl" className="gap-2 bg-card text-foreground hover:bg-card/90 shadow-xl">
                  Criar minha conta grátis <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <img src={logoSolarizeBranca} alt="Solarize" className="h-8 w-auto object-contain mb-5" />
              <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6">
                A plataforma completa para empresas de energia solar. CRM, gestão de instalações, site e muito mais.
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

            {/* Produto */}
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

            {/* Conteúdo */}
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

            {/* Suporte */}
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

          {/* Bottom */}
          <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/40">
            <p>© {new Date().getFullYear()} Solarize. Todos os direitos reservados.</p>
            <p>Feito com ☀️ para empresas de energia solar</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
