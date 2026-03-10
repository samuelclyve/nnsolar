import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Phone, Mail, MapPin, Star, ArrowRight, Zap, Instagram, Globe, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SiteData {
  workspace: any;
  settings: Record<string, string>;
  slides: any[];
  testimonials: any[];
}

export default function TenantSite() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "", city: "", monthly_bill: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) fetchSiteData();
  }, [slug]);

  const fetchSiteData = async () => {
    const { data: ws, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !ws) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const [settingsRes, slidesRes, testimonialsRes] = await Promise.all([
      supabase.from("site_settings").select("setting_key, setting_value").eq("workspace_id", ws.id),
      supabase.from("hero_slides").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
      supabase.from("testimonials").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
    ]);

    const settingsMap: Record<string, string> = {};
    settingsRes.data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value || ""; });

    setData({ workspace: ws, settings: settingsMap, slides: slidesRes.data || [], testimonials: testimonialsRes.data || [] });
    setIsLoading(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("leads").insert({
      name: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email || null,
      city: leadForm.city || null,
      workspace_id: data?.workspace.id,
    });

    if (!error) {
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      setLeadForm({ name: "", phone: "", email: "", city: "", monthly_bill: "" });
    } else {
      toast({ title: "Erro", description: "Tente novamente.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sun className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Site não encontrado</h1>
          <p className="text-muted-foreground">Este endereço não corresponde a nenhuma empresa.</p>
        </div>
      </div>
    );
  }

  const { workspace, settings, slides, testimonials } = data;
  const ws = workspace;

  const heroTitle = settings.hero_title_prefix || settings.hero_title || ws.name;
  const heroHighlight = settings.hero_title_highlight || "";
  const heroSuffix = settings.hero_title_suffix || "";
  const heroDescription = settings.hero_description || ws.description || "Energia solar para sua casa e empresa. Economize na conta de luz com soluções personalizadas.";
  const heroTagline = settings.hero_tagline || "Energia solar de qualidade";
  const heroBtnPrimary = settings.hero_button_primary || "Solicitar Orçamento";
  const heroBtnSecondary = settings.hero_button_secondary || "Saiba Mais";
  const heroBgUrl = settings.hero_background_url || "";

  const stats = [
    { value: settings.stat_1_value || "500+", label: settings.stat_1_label || "Projetos Realizados" },
    { value: settings.stat_2_value || "10MW+", label: settings.stat_2_label || "Potência Instalada" },
    { value: settings.stat_3_value || "95%", label: settings.stat_3_label || "Clientes Satisfeitos" },
    { value: settings.stat_4_value || "8+", label: settings.stat_4_label || "Anos de Experiência" },
  ];

  const whatsappLink = ws.whatsapp
    ? `https://wa.me/55${ws.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {ws.logo_url ? (
              <img src={ws.logo_url} alt={ws.name} className="h-10 object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <Sun className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">{ws.name}</span>
              </div>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
            <a href="#depoimentos" className="text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
            <a href="#contato" className="text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </nav>
          <a href="#contato">
            <Button size="sm" className="gap-1">
              Orçamento Grátis <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative py-24 md:py-32 overflow-hidden"
        style={heroBgUrl ? {
          backgroundImage: `linear-gradient(to bottom, hsl(var(--secondary) / 0.85), hsl(var(--secondary) / 0.95)), url(${heroBgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {!heroBgUrl && (
          <div className="absolute inset-0 gradient-hero" />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {heroTagline && (
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/10">
                <Zap className="w-4 h-4" />
                {heroTagline}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {heroTitle}{" "}
              {heroHighlight && <span className="text-primary">{heroHighlight}</span>}{" "}
              {heroSuffix}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              {heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#contato">
                <Button size="lg" className="text-lg px-8 h-14 gap-2 shadow-orange-glow">
                  {heroBtnPrimary} <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="text-lg px-8 h-14 gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Carousel / Banners */}
      {slides.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              Nossos Serviços
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {slides.map(slide => (
                <Card key={slide.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-foreground text-lg mb-1">{slide.title}</h3>
                    {slide.subtitle && <p className="text-sm text-muted-foreground">{slide.subtitle}</p>}
                    {slide.button_text && (
                      <a href={slide.button_link || "#contato"} className="inline-block mt-3">
                        <Button size="sm" variant="outline">{slide.button_text}</Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="sobre" className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Sobre a {ws.name}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {ws.description || `A ${ws.name} é especializada em soluções de energia solar fotovoltaica para residências e empresas. Oferecemos projetos personalizados, instalação profissional e acompanhamento completo para garantir a máxima economia na sua conta de energia.`}
              </p>
              <div className="space-y-3">
                {ws.phone && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    {ws.phone}
                  </div>
                )}
                {ws.email && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary" />
                    {ws.email}
                  </div>
                )}
                {(ws.city || ws.state) && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {[ws.city, ws.state].filter(Boolean).join(" - ")}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              {ws.logo_url ? (
                <img src={ws.logo_url} alt={ws.name} className="w-32 h-32 object-contain mb-4" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Sun className="w-12 h-12 text-primary" />
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{ws.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Energia Solar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section id="depoimentos" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Veja os depoimentos de quem já economiza com energia solar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map(t => (
                <Card key={t.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">"{t.message}"</p>
                    <div className="flex items-center gap-3">
                      {t.client_photo_url ? (
                        <img src={t.client_photo_url} alt={t.client_name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {t.client_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.client_name}</p>
                        {t.client_location && <p className="text-xs text-muted-foreground">{t.client_location}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead Form */}
      <section id="contato" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Solicite seu orçamento grátis
              </h2>
              <p className="text-muted-foreground mb-8">
                Preencha o formulário e nossa equipe entrará em contato em até 24 horas com uma proposta personalizada para sua residência ou empresa.
              </p>
              <div className="space-y-4">
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-foreground text-sm">WhatsApp</p>
                      <p className="text-xs text-muted-foreground">{ws.whatsapp}</p>
                    </div>
                  </a>
                )}
                {ws.phone && (
                  <a href={`tel:${ws.phone}`} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Telefone</p>
                      <p className="text-xs text-muted-foreground">{ws.phone}</p>
                    </div>
                  </a>
                )}
                {ws.email && (
                  <a href={`mailto:${ws.email}`} className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Email</p>
                      <p className="text-xs text-muted-foreground">{ws.email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <Label>Nome completo *</Label>
                    <Input value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} required className="mt-1" placeholder="Seu nome" />
                  </div>
                  <div>
                    <Label>Telefone / WhatsApp *</Label>
                    <Input value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} required className="mt-1" placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} className="mt-1" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input value={leadForm.city} onChange={e => setLeadForm({ ...leadForm, city: e.target.value })} className="mt-1" placeholder="Sua cidade" />
                  </div>
                  <div>
                    <Label>Valor médio da conta de luz</Label>
                    <Input value={leadForm.monthly_bill} onChange={e => setLeadForm({ ...leadForm, monthly_bill: e.target.value })} className="mt-1" placeholder="R$ 500,00" />
                  </div>
                  <Button type="submit" className="w-full h-12 text-base gap-2" disabled={submitting}>
                    {submitting ? "Enviando..." : (
                      <>Enviar solicitação <ArrowRight className="w-4 h-4" /></>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Seus dados estão seguros. Não compartilhamos suas informações.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {ws.logo_url ? (
                <img src={ws.logo_url} alt={ws.name} className="h-8 object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">{ws.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {ws.instagram && (
                <a href={`https://instagram.com/${ws.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {ws.website && (
                <a href={ws.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {ws.name}. Powered by <span className="font-semibold text-primary">Solarize</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
