import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Zap, Cpu, 
  Smartphone, MessageCircle, 
  Construction, Plug, ChevronDown, Database,
  Mail, Instagram, BookOpen, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeaturesMegaMenu } from "@/components/landing/FeaturesMegaMenu";
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

const plannedIntegrations = [
  { icon: Zap, name: "Inversores Solares", description: "Monitoramento em tempo real de inversores Fronius, Growatt, Huawei e mais. Acompanhe a geração de energia dos seus clientes direto pelo painel.", status: "Em desenvolvimento" },
  { icon: MessageCircle, name: "WhatsApp Business API", description: "Automação de mensagens e notificações via API oficial do WhatsApp. Envie atualizações de instalação, cobranças e follow-ups automaticamente.", status: "Em desenvolvimento" },
  { icon: Plug, name: "Geradores de Propostas", description: "Integração com ferramentas de dimensionamento e geração de propostas comerciais. Crie propostas profissionais em minutos.", status: "Planejado" },
  { icon: Smartphone, name: "Aplicativo Mobile para Clientes", description: "App nativo para seus clientes acompanharem o andamento da instalação, documentos e geração de energia em tempo real.", status: "Planejado" },
  { icon: Database, name: "ERP Interno", description: "Módulo de gestão empresarial integrado ao ecossistema Solarize: controle de estoque, compras, fluxo de caixa e notas fiscais.", status: "Em desenvolvimento" },
];

const statusColors: Record<string, string> = {
  "Em desenvolvimento": "bg-primary/10 text-primary",
  "Planejado": "bg-secondary/10 text-secondary",
};

export default function Integrations() {
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
      {/* Header - Same as Index */}
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

            <div className="hidden md:flex items-center gap-1 relative z-10">
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
              <a href="/#pricing" className="px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                Preços
              </a>
              <a href="/#testimonials" className="px-4 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors rounded-full hover:bg-primary-foreground/10">
                Depoimentos
              </a>
              <Link to="/integracoes" className="px-4 py-2 text-sm text-primary-foreground bg-primary-foreground/15 transition-colors rounded-full">
                Integrações
              </Link>
            </div>

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
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={gridBg} />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary text-sm font-semibold">Integrações</span>
              </div>
            </motion.div>

            <motion.h1 
              variants={fadeUp} 
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight"
            >
              Conecte o Solarize ao seu ecossistema
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Estamos desenvolvendo integrações com os principais sistemas do mercado de energia solar 
              para que você tenha tudo conectado em um só lugar.
            </motion.p>

            <motion.div 
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-6 py-4"
            >
              <Construction className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Em implementação</p>
                <p className="text-xs text-muted-foreground">Estamos trabalhando para conectar os melhores sistemas do setor solar</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-20 bg-background relative">
        <div className="absolute inset-0 opacity-[0.02]" style={gridBg} />
        <div className="container mx-auto px-4 relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4"
          >
            Integrações planejadas
          </motion.h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Confira os sistemas e ferramentas que estamos trabalhando para integrar ao ecossistema Solarize.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plannedIntegrations.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-border/60 bg-card hover:border-primary/20 transition-all duration-300 h-full hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1.5">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.description}</p>
                    <a
                      href={`https://wa.me/5588998536228?text=Ol%C3%A1!%20Tenho%20interesse%20na%20integra%C3%A7%C3%A3o%20${encodeURIComponent(item.name)}%20do%20Solarize`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Tenho interesse
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Precisa de uma integração específica?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Fale com nosso time e nos diga quais sistemas você utiliza. 
              Sua sugestão nos ajuda a priorizar o que desenvolver.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/5588998536228?text=Ol%C3%A1!%20Gostaria%20de%20sugerir%20uma%20integra%C3%A7%C3%A3o%20para%20o%20Solarize" target="_blank" rel="noopener noreferrer">
                <Button size="xl" className="gap-2 shadow-orange-glow">
                  <MessageCircle className="w-5 h-5" /> Sugerir integração
                </Button>
              </a>
              <Link to="/signup">
                <Button variant="outline" size="xl" className="gap-2">
                  Começar teste grátis <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Same as Index */}
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
                <li><Link to="/#features" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Funcionalidades</Link></li>
                <li><Link to="/#pricing" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Preços</Link></li>
                <li><Link to="/integracoes" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Integrações</Link></li>
                <li><Link to="/signup" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">Começar grátis</Link></li>
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
