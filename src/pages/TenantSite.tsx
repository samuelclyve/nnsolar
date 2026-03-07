import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sun, Phone, Mail, MapPin, Star } from "lucide-react";
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
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) fetchSiteData();
  }, [slug]);

  const fetchSiteData = async () => {
    // Get workspace by slug
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

    // Fetch settings, slides, testimonials in parallel
    const [settingsRes, slidesRes, testimonialsRes] = await Promise.all([
      supabase.from("site_settings").select("setting_key, setting_value").eq("workspace_id", ws.id),
      supabase.from("hero_slides").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
      supabase.from("testimonials").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
    ]);

    const settingsMap: Record<string, string> = {};
    settingsRes.data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value || ""; });

    setData({
      workspace: ws,
      settings: settingsMap,
      slides: slidesRes.data || [],
      testimonials: testimonialsRes.data || [],
    });
    setIsLoading(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { error } = await supabase.from("leads").insert({
      name: leadForm.name,
      phone: leadForm.phone,
      email: leadForm.email,
      city: leadForm.city,
      workspace_id: data?.workspace.id,
    });

    if (!error) {
      toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
      setLeadForm({ name: "", phone: "", email: "", city: "" });
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
          <h1 className="text-4xl font-bold text-foreground mb-4">Site não encontrado</h1>
          <p className="text-muted-foreground">Este endereço não corresponde a nenhuma empresa.</p>
        </div>
      </div>
    );
  }

  const { workspace, settings, slides, testimonials } = data;
  const heroTitle = settings.hero_title || workspace.name;
  const heroDescription = settings.hero_description || "Energia solar para sua casa e empresa";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {workspace.logo_url ? (
              <img src={workspace.logo_url} alt={workspace.name} className="h-8 object-contain" />
            ) : (
              <>
                <Sun className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-foreground">{workspace.name}</span>
              </>
            )}
          </div>
          <a href="#contato">
            <Button size="sm">Solicitar Orçamento</Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            {heroDescription}
          </p>
          <a href="#contato">
            <Button size="lg" className="shadow-orange-glow">Quero economizar na conta de luz</Button>
          </a>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              O que nossos clientes dizem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map(t => (
                <Card key={t.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-3">"{t.message}"</p>
                    <p className="text-sm font-semibold text-foreground">{t.client_name}</p>
                    {t.client_location && <p className="text-xs text-muted-foreground">{t.client_location}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead Form */}
      <section id="contato" className="py-16">
        <div className="container mx-auto px-4 max-w-lg">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">
            Solicite seu orçamento grátis
          </h2>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input value={leadForm.name} onChange={e => setLeadForm({ ...leadForm, name: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={leadForm.city} onChange={e => setLeadForm({ ...leadForm, city: e.target.value })} className="mt-1" />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Enviando..." : "Enviar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {workspace.name}. Powered by <span className="font-semibold">Solarize</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
