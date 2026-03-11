import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight, Check, MessageCircle, Target, Wrench, Globe,
  Calendar, BarChart3, Users, FileText, Shield, Bell, Lock,
  Mail, Instagram, BookOpen, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MainHeader } from "@/components/landing/MainHeader";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const gridBg = {
  backgroundImage: `linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)`,
  backgroundSize: '48px 48px',
};

interface FeatureData {
  slug: string;
  icon: any;
  tag: string;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  mockup: "crm" | "installations" | "site" | "agenda" | "dashboard" | "clients" | "documents" | "finance" | "notifications" | "team";
  ctaText: string;
}

const features: FeatureData[] = [
  {
    slug: "crm",
    icon: Target,
    tag: "CRM Solar",
    title: "CRM com Kanban Visual",
    headline: "Nunca mais perca um lead. Converta mais com visibilidade total.",
    description: "Gerencie todo o funil de vendas da sua empresa solar com um pipeline visual e intuitivo. Do primeiro contato ao fechamento, tenha controle absoluto sobre cada oportunidade, atribua responsáveis e acompanhe o progresso em tempo real.",
    bullets: [
      "Pipeline visual com drag-and-drop entre etapas",
      "Histórico completo de interações com cada lead",
      "Atribuição automática de leads para vendedores",
      "Filtros avançados por status, cidade e responsável",
      "Integração com captação de leads do seu site",
      "Métricas de conversão por etapa do funil",
    ],
    mockup: "crm",
    ctaText: "Comece a converter mais",
  },
  {
    slug: "instalacoes",
    icon: Wrench,
    tag: "Gestão de Instalações",
    title: "Controle Total de Instalações",
    headline: "Acompanhe cada etapa. Do projeto à ativação.",
    description: "Gerencie todo o ciclo de vida de cada instalação solar: projeto, aprovação da concessionária, instalação física, vistoria e ativação. Seus clientes recebem atualizações automáticas a cada mudança de etapa.",
    bullets: [
      "5 etapas de acompanhamento automático",
      "Notificações via WhatsApp para o cliente",
      "Upload de documentos e fotos por instalação",
      "Atribuição de técnicos responsáveis",
      "Timeline visual do progresso de cada obra",
      "Relatórios de prazo e performance por técnico",
    ],
    mockup: "installations",
    ctaText: "Organize suas instalações",
  },
  {
    slug: "site",
    icon: Globe,
    tag: "Site Personalizável",
    title: "Seu Site Profissional em Minutos",
    headline: "Landing page com simulador solar. Capte leads 24/7.",
    description: "Cada empresa recebe automaticamente um site profissional com domínio personalizado, simulador de economia solar, seção de depoimentos e captação automática de leads. Totalmente customizável com a identidade visual da sua marca.",
    bullets: [
      "Simulador de economia solar integrado",
      "Captação automática de leads no CRM",
      "100% personalizável com sua marca",
      "Depoimentos de clientes configuráveis",
      "Otimizado para SEO e dispositivos móveis",
      "Carrossel de imagens e banners editáveis",
    ],
    mockup: "site",
    ctaText: "Crie seu site agora",
  },
  {
    slug: "agenda",
    icon: Calendar,
    tag: "Agenda Inteligente",
    title: "Calendário Inteligente",
    headline: "Organize visitas e instalações sem conflitos.",
    description: "Calendário drag-and-drop para agendar visitas técnicas, instalações e reuniões. Visualize por dia, semana ou mês, atribua membros da equipe e evite sobreposição de compromissos.",
    bullets: [
      "Visualização por dia, semana e mês",
      "Drag-and-drop para reagendar facilmente",
      "Atribuição de eventos por técnico/vendedor",
      "Cores por tipo de compromisso",
      "Sincronização com gestão de instalações",
      "Alertas e lembretes automáticos",
    ],
    mockup: "agenda",
    ctaText: "Organize sua agenda",
  },
  {
    slug: "dashboard",
    icon: BarChart3,
    tag: "Dashboard & Relatórios",
    title: "Dashboard Completo",
    headline: "Métricas em tempo real. Decisões com dados.",
    description: "Painel de controle com indicadores de vendas, instalações, leads e performance da equipe. Gráficos visuais e relatórios que ajudam você a tomar decisões estratégicas baseadas em dados reais.",
    bullets: [
      "KPIs de vendas, instalações e leads",
      "Gráficos interativos de performance",
      "Comparativo mensal de resultados",
      "Taxa de conversão por etapa do funil",
      "Ranking de vendedores e técnicos",
      "Exportação de relatórios em PDF",
    ],
    mockup: "dashboard",
    ctaText: "Veja seus dados",
  },
  {
    slug: "clientes",
    icon: Users,
    tag: "Gestão de Clientes",
    title: "Base Completa de Clientes",
    headline: "Todos os dados dos seus clientes em um só lugar.",
    description: "Cadastre e organize todos os seus clientes com informações detalhadas, histórico de instalações, documentos e interações. Busca rápida, filtros avançados e visão completa de cada relacionamento.",
    bullets: [
      "Cadastro completo com dados pessoais e técnicos",
      "Histórico de instalações e serviços",
      "Documentos vinculados ao cliente",
      "Busca rápida e filtros avançados",
      "Status ativo/inativo com controle",
      "Notas e observações por cliente",
    ],
    mockup: "clients",
    ctaText: "Organize seus clientes",
  },
  {
    slug: "documentos",
    icon: FileText,
    tag: "Documentos & Contratos",
    title: "Gestão de Documentos",
    headline: "Contratos, projetos e documentos. Tudo organizado.",
    description: "Centralize todos os documentos da empresa: contratos, projetos técnicos, notas fiscais e comprovantes. Organize por categoria, cliente ou instalação com upload simples e busca instantânea.",
    bullets: [
      "Upload de documentos em qualquer formato",
      "Organização por categoria e tags",
      "Vínculo com clientes e instalações",
      "Busca rápida por nome ou categoria",
      "Controle de versões de documentos",
      "Acesso seguro com permissões por equipe",
    ],
    mockup: "documents",
    ctaText: "Organize seus documentos",
  },
  {
    slug: "financeiro",
    icon: Shield,
    tag: "Controle Financeiro",
    title: "Controle Financeiro",
    headline: "Parcelas, cobranças e recebimentos sob controle.",
    description: "Gerencie as parcelas de cada instalação, acompanhe pagamentos pendentes e recebidos, envie lembretes de cobrança e tenha visibilidade total do fluxo de recebimentos da sua empresa.",
    bullets: [
      "Parcelamento por instalação/cliente",
      "Status de cada parcela (pendente/pago/atrasado)",
      "Upload de comprovantes de pagamento",
      "Alertas automáticos de parcelas vencidas",
      "Relatórios de fluxo de recebimentos",
      "Histórico completo de transações",
    ],
    mockup: "finance",
    ctaText: "Controle suas finanças",
  },
  {
    slug: "notificacoes",
    icon: Bell,
    tag: "Notificações Automáticas",
    title: "Notificações Automáticas",
    headline: "Seus clientes sempre informados. Automaticamente.",
    description: "Configure notificações automáticas por e-mail e WhatsApp para manter seus clientes atualizados sobre o andamento das instalações, mudanças de status e lembretes de pagamento.",
    bullets: [
      "Notificações por e-mail e WhatsApp",
      "Alertas automáticos por mudança de etapa",
      "Lembretes de parcelas e pagamentos",
      "Templates personalizáveis de mensagens",
      "Histórico de todas as notificações enviadas",
      "Controle de quais alertas ativar/desativar",
    ],
    mockup: "notifications",
    ctaText: "Automatize suas notificações",
  },
  {
    slug: "equipe",
    icon: Lock,
    tag: "Gestão de Equipe",
    title: "Gestão de Equipe & Permissões",
    headline: "Controle quem acessa o quê. Segurança e organização.",
    description: "Adicione membros à sua equipe com papéis e permissões diferenciados. Administradores, vendedores e técnicos têm visões e acessos específicos para cada função dentro do ecossistema.",
    bullets: [
      "Papéis diferenciados (admin, vendedor, técnico)",
      "Permissões granulares por módulo",
      "Convite de novos membros por e-mail",
      "Controle de atividades por usuário",
      "Gerenciamento centralizado de acessos",
      "Sem limite de membros na equipe",
    ],
    mockup: "team",
    ctaText: "Monte sua equipe",
  },
];

function FeatureMockup({ type }: { type: string }) {
  switch (type) {
    case "crm":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-foreground">Pipeline de Vendas</h4>
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">+12 leads hoje</span>
          </div>
          {["Novo Lead", "Contato Realizado", "Proposta Enviada", "Em Negociação", "Fechado"].map((stage, i) => (
            <div key={stage} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${i === 4 ? 'bg-success' : i >= 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <span className="text-sm font-medium text-foreground">{stage}</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{[8, 5, 3, 2, 12][i]}</span>
            </div>
          ))}
        </div>
      );
    case "installations":
      return (
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
                  <div className={`h-full rounded-full ${i < 3 ? 'bg-success' : i === 3 ? 'bg-primary' : 'bg-transparent'}`} style={{ width: i < 3 ? '100%' : i === 3 ? '33%' : '0%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    case "site":
      return (
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
                <div className="flex gap-2"><div className="w-12 h-3 rounded bg-muted" /><div className="w-12 h-3 rounded bg-muted" /></div>
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
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Leads captados hoje</span><span className="font-bold text-success">+7</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Simulações realizadas</span><span className="font-bold text-primary">23</span></div>
        </div>
      );
    case "dashboard":
      return (
        <div className="space-y-4">
          <h4 className="font-bold text-foreground mb-4">Visão Geral</h4>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Leads este mês", value: "47", color: "text-primary" }, { label: "Instalações", value: "12", color: "text-success" }, { label: "Conversão", value: "34%", color: "text-primary" }, { label: "Receita", value: "R$ 84k", color: "text-success" }].map((k) => (
              <div key={k.label} className="p-3 rounded-xl bg-background border border-border/50 text-center">
                <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
          <div className="h-20 rounded-xl bg-background border border-border/50 flex items-end p-3 gap-1">
            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      );
    case "agenda":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Março 2026</h4>
          {[{ time: "08:00", title: "Visita técnica — João Silva", color: "bg-primary/10 border-primary/20 text-primary" }, { time: "10:30", title: "Instalação — Maria Santos", color: "bg-success/10 border-success/20 text-success" }, { time: "14:00", title: "Reunião — Proposta comercial", color: "bg-accent/10 border-accent/20 text-accent-foreground" }, { time: "16:00", title: "Vistoria — Condomínio Verde", color: "bg-secondary/10 border-secondary/20 text-secondary" }].map((ev) => (
            <div key={ev.time} className={`p-3 rounded-xl border ${ev.color}`}>
              <p className="text-xs font-mono opacity-60">{ev.time}</p>
              <p className="text-sm font-medium">{ev.title}</p>
            </div>
          ))}
        </div>
      );
    case "clients":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Clientes Recentes</h4>
          {[{ name: "João Silva", city: "Fortaleza - CE", status: "Ativo" }, { name: "Maria Santos", city: "Juazeiro do Norte - CE", status: "Ativo" }, { name: "Pedro Almeida", city: "Sobral - CE", status: "Inativo" }].map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">{c.name[0]}</span></div>
                <div><p className="text-sm font-medium text-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.city}</p></div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "Ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
            </div>
          ))}
        </div>
      );
    case "documents":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Documentos Recentes</h4>
          {[{ name: "Contrato #0247.pdf", cat: "Contrato", size: "1.2 MB" }, { name: "Projeto_Tecnico_Solar.dwg", cat: "Projeto", size: "4.8 MB" }, { name: "NF_Equipamentos.pdf", cat: "Nota Fiscal", size: "890 KB" }].map((d) => (
            <div key={d.name} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
                <div><p className="text-sm font-medium text-foreground">{d.name}</p><p className="text-xs text-muted-foreground">{d.cat} • {d.size}</p></div>
              </div>
            </div>
          ))}
        </div>
      );
    case "finance":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Parcelas</h4>
          {[{ num: "1/6", value: "R$ 4.500", status: "Pago", color: "bg-success/10 text-success" }, { num: "2/6", value: "R$ 4.500", status: "Pago", color: "bg-success/10 text-success" }, { num: "3/6", value: "R$ 4.500", status: "Pendente", color: "bg-primary/10 text-primary" }, { num: "4/6", value: "R$ 4.500", status: "A vencer", color: "bg-muted text-muted-foreground" }].map((p) => (
            <div key={p.num} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
              <div><p className="text-sm font-medium text-foreground">Parcela {p.num}</p><p className="text-xs text-muted-foreground">{p.value}</p></div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${p.color}`}>{p.status}</span>
            </div>
          ))}
        </div>
      );
    case "notifications":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Últimas Notificações</h4>
          {[{ msg: "Instalação #0247 avançou para Vistoria", time: "Há 2h", icon: "🔔" }, { msg: "Novo lead captado: Ana Costa", time: "Há 4h", icon: "📩" }, { msg: "Parcela 3/6 vence amanhã — João Silva", time: "Há 6h", icon: "💳" }].map((n) => (
            <div key={n.msg} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border/50">
              <span className="text-lg">{n.icon}</span>
              <div className="flex-1"><p className="text-sm text-foreground">{n.msg}</p><p className="text-xs text-muted-foreground">{n.time}</p></div>
            </div>
          ))}
        </div>
      );
    case "team":
      return (
        <div className="space-y-3">
          <h4 className="font-bold text-foreground mb-4">Equipe</h4>
          {[{ name: "Você", role: "Administrador", color: "bg-primary/10 text-primary" }, { name: "Carlos M.", role: "Vendedor", color: "bg-success/10 text-success" }, { name: "Ana P.", role: "Técnico", color: "bg-accent/10 text-accent-foreground" }].map((m) => (
            <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"><span className="text-sm font-bold text-muted-foreground">{m.name[0]}</span></div>
                <p className="text-sm font-medium text-foreground">{m.name}</p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${m.color}`}>{m.role}</span>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default function FeatureDetail() {
  const { slug } = useParams<{ slug: string }>();
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    return (
      <div className="min-h-screen bg-card">
        <MainHeader activeLink="funcionalidades" />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Funcionalidade não encontrada</h1>
          <Link to="/" className="text-primary mt-4 inline-block">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const otherFeatures = features.filter((f) => f.slug !== slug).slice(0, 4);
  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-card">
      <MainHeader activeLink="funcionalidades" />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={gridBg} />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-primary text-sm font-semibold">{feature.tag}</span>
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              {feature.headline}
            </motion.h1>

            <motion.p variants={fadeUp} transition={{ duration: 0.5 }} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              {feature.description}
            </motion.p>

            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="xl" className="gap-2 shadow-orange-glow">
                  {feature.ctaText} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="https://wa.me/5588998536228" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="xl" className="gap-2">
                  <MessageCircle className="w-5 h-5" /> Falar com consultor
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature detail section - text + mockup */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 opacity-[0.02]" style={gridBg} />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20 max-w-6xl mx-auto">
            {/* Bullets */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
                O que você pode fazer
              </h2>
              <ul className="space-y-4">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Incluído em todos os planos</p>
                <p className="font-bold text-foreground">14 dias grátis — sem cartão de crédito</p>
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-xl"
              >
                <div className="absolute inset-0 opacity-[0.03]" style={gridBg} />
                <div className="p-8 md:p-10 relative">
                  <FeatureMockup type={feature.mockup} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Other features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-10">
            Explore outros módulos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {otherFeatures.map((f, i) => {
              const FIcon = f.icon;
              return (
                <motion.div
                  key={f.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/funcionalidades/${f.slug}`}>
                    <Card className="border border-border/60 bg-card hover:border-primary/20 transition-all duration-300 h-full hover:shadow-md hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <FIcon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.headline.slice(0, 60)}...</p>
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3">
                          Saiba mais <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <img src={logoSolarizeBranca} alt="Solarize" className="h-8 w-auto object-contain mb-5" />
              <p className="text-secondary-foreground/60 text-sm leading-relaxed mb-6">
                O ecossistema completo para empresas de energia solar.
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com/solarize.app" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="mailto:contato@solarize.app" className="w-9 h-9 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-secondary-foreground/20 transition-colors">
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/80 mb-5">Conteúdo</h4>
              <ul className="space-y-3">
                <li><Link to="/blog" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Blog</Link></li>
                <li><Link to="/materiais" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Materiais</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-secondary-foreground/80 mb-5">Suporte</h4>
              <ul className="space-y-3">
                <li><a href="mailto:contato@solarize.app" className="text-sm text-secondary-foreground/60 hover:text-secondary-foreground transition-colors flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> contato@solarize.app</a></li>
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
