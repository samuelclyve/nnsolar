import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, ArrowRight, Zap, Cpu, Cloud, Database, 
  Smartphone, Shield, Settings, MessageCircle, 
  Construction, Plug, Radio, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoSolarize from "@/assets/logo-solarize.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const plannedIntegrations = [
  { icon: Zap, name: "Inversores Solares", description: "Monitoramento em tempo real de inversores Fronius, Growatt, Huawei e mais.", status: "Em desenvolvimento" },
  { icon: Cloud, name: "Plataformas de Monitoramento", description: "Conexão com SolarEdge, Enphase e outros sistemas de monitoramento.", status: "Planejado" },
  { icon: Database, name: "ERPs", description: "Integração com sistemas de gestão como Bling, Tiny e Omie.", status: "Planejado" },
  { icon: MessageCircle, name: "WhatsApp Business API", description: "Automação de mensagens e notificações via API oficial do WhatsApp.", status: "Em desenvolvimento" },
  { icon: Smartphone, name: "Aplicativo Mobile", description: "App nativo para técnicos acompanharem instalações em campo.", status: "Planejado" },
  { icon: Radio, name: "Concessionárias", description: "Consulta automática de status de projetos junto às distribuidoras.", status: "Pesquisa" },
  { icon: Plug, name: "Geradores de Propostas", description: "Integração com ferramentas de dimensionamento e geração de propostas.", status: "Planejado" },
  { icon: BarChart3, name: "Google Analytics", description: "Acompanhe métricas de acesso e conversão do seu site Solarize.", status: "Planejado" },
  { icon: Shield, name: "Gateways de Pagamento", description: "Receba pagamentos diretamente pela plataforma com segurança.", status: "Em desenvolvimento" },
];

const statusColors: Record<string, string> = {
  "Em desenvolvimento": "bg-primary/10 text-primary",
  "Planejado": "bg-secondary/10 text-secondary",
  "Pesquisa": "bg-muted text-muted-foreground",
};

export default function Integrations() {
  return (
    <div className="min-h-screen bg-card">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <img src={logoSolarize} alt="Solarize" className="h-5 w-auto" />
          </Link>
          <Link to="/signup">
            <Button size="sm" className="gap-1.5">
              Começar grátis <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
        
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

            {/* Status Banner */}
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
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
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
            Confira os sistemas e ferramentas que estamos trabalhando para integrar ao Solarize.
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
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
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

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Solarize. Todos os direitos reservados.</p>
          <Link to="/" className="text-primary hover:underline">Voltar ao site</Link>
        </div>
      </footer>
    </div>
  );
}
