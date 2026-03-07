import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sun, BarChart3, Users, Wrench, Globe, Calendar, 
  FileText, Shield, ArrowRight, Check, Zap, Star,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: BarChart3, title: "CRM Completo", description: "Gerencie leads do primeiro contato ao fechamento com Kanban drag-and-drop." },
  { icon: Wrench, title: "Gestão de Instalações", description: "Acompanhe cada etapa: projeto, aprovação, instalação, vistoria e ativação." },
  { icon: Globe, title: "Site Personalizável", description: "Seu site profissional com simulador solar, depoimentos e captação de leads." },
  { icon: Calendar, title: "Agenda Inteligente", description: "Calendário visual com arrastar e soltar para visitas e instalações." },
  { icon: FileText, title: "Documentos Centralizados", description: "Contratos, projetos e fotos organizados por cliente e instalação." },
  { icon: Users, title: "Gestão de Equipe", description: "Controle de acesso por função: admin, gestor, comercial e técnico." },
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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">Solarize</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preços</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 pt-20 pb-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              14 dias grátis — sem cartão de crédito
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              O sistema completo para sua{" "}
              <span className="text-gradient-orange">empresa solar</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              CRM, gestão de instalações, site personalizável e controle financeiro — 
              tudo em uma plataforma integrada para empresas de energia solar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="text-lg px-8 h-14 gap-2 shadow-orange-glow">
                  Começar teste grátis <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 h-14">
                  Ver funcionalidades
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas profissionais para gerenciar cada aspecto do seu negócio solar.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-all h-full hover-lift">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Preços simples e transparentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Comece com 14 dias grátis. Sem cartão de crédito.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className={`border-2 relative overflow-hidden ${
                  plan.popular ? "border-primary shadow-orange-glow" : "border-border"
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      {plan.badge}
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-5xl font-display font-bold text-foreground mx-1">{plan.price}</span>
                      <span className="text-2xl font-bold text-foreground">{plan.cents}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {["Site personalizável", "CRM com Kanban", "Gestão de instalações", "Agenda inteligente", "Documentos ilimitados", "Equipe ilimitada", "Suporte prioritário"].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
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
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Empresas que crescem com Solarize
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, index) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4">"{t.message}"</p>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center gradient-hero rounded-3xl p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Pronto para transformar sua empresa solar?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Comece hoje mesmo com 14 dias grátis. Sem compromisso.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 h-14 gap-2 bg-card text-foreground hover:bg-card/90">
                Criar minha conta grátis <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sun className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Solarize</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Solarize. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
