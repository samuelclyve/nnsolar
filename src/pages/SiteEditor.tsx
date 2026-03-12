import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Image, Plus, Trash2, Save, Eye, GripVertical, Settings,
  MessageSquare, Type, Upload, X, Palette, Globe, Phone,
  Mail, MapPin, Instagram, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { useWorkspace } from "@/hooks/useWorkspace";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  sort_order: number;
}

interface Testimonial {
  id: string;
  client_name: string;
  client_location: string | null;
  client_photo_url: string | null;
  message: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

export default function SiteEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSlideDialogOpen, setIsSlideDialogOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slideForm, setSlideForm] = useState({
    title: "", subtitle: "", image_url: "", button_text: "", button_link: "", is_active: true,
  });
  const [testimonialForm, setTestimonialForm] = useState({
    client_name: "", client_location: "", client_photo_url: "", message: "", rating: 5, is_active: true,
  });
  const slideImageInputRef = useRef<HTMLInputElement>(null);
  const heroBackgroundInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { workspaceId, workspace } = useWorkspace();

  useEffect(() => {
    if (workspaceId) fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    const [slidesRes, testimonialsRes, settingsRes] = await Promise.all([
      supabase.from("hero_slides").select("*").eq("workspace_id", workspaceId!).order("sort_order"),
      supabase.from("testimonials").select("*").eq("workspace_id", workspaceId!).order("sort_order"),
      supabase.from("site_settings").select("*").eq("workspace_id", workspaceId!),
    ]);
    setSlides(slidesRes.data || []);
    setTestimonials(testimonialsRes.data || []);
    const map: Record<string, string> = {};
    (settingsRes.data || []).forEach((s: any) => { map[s.setting_key] = s.setting_value || ""; });
    setSettings(map);
    setIsLoading(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `site-images/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro ao fazer upload", variant: "destructive" }); return null; }
    return supabase.storage.from("documents").getPublicUrl(path).data.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) {
      setSettings({ ...settings, site_logo_url: url });
      // Also update workspace logo
      await supabase.from("workspaces").update({ logo_url: url } as any).eq("id", workspaceId!);
    }
    setUploadingImage(false);
  };

  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) setSettings({ ...settings, hero_background_url: url });
    setUploadingImage(false);
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) setSlideForm({ ...slideForm, image_url: url });
    setUploadingImage(false);
  };

  const saveSettings = async () => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from("site_settings").upsert(
          { setting_key: key, setting_value: value, setting_type: "text", workspace_id: workspaceId },
          { onConflict: "workspace_id,setting_key" }
        );
      }
      toast({ title: "Configurações salvas com sucesso!" });
    } catch {
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    }
  };

  // Slide CRUD
  const openSlideDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({ title: slide.title, subtitle: slide.subtitle || "", image_url: slide.image_url, button_text: slide.button_text || "", button_link: slide.button_link || "", is_active: slide.is_active ?? true });
    } else {
      setEditingSlide(null);
      setSlideForm({ title: "", subtitle: "", image_url: "", button_text: "", button_link: "", is_active: true });
    }
    setIsSlideDialogOpen(true);
  };

  const saveSlide = async () => {
    if (!slideForm.title || !slideForm.image_url) { toast({ title: "Preencha título e imagem", variant: "destructive" }); return; }
    const data = { ...slideForm, subtitle: slideForm.subtitle || null, button_text: slideForm.button_text || null, button_link: slideForm.button_link || null, sort_order: editingSlide?.sort_order ?? slides.length, workspace_id: workspaceId };
    if (editingSlide) {
      await supabase.from("hero_slides").update(data).eq("id", editingSlide.id);
      toast({ title: "Slide atualizado!" });
    } else {
      await supabase.from("hero_slides").insert(data);
      toast({ title: "Slide criado!" });
    }
    setIsSlideDialogOpen(false);
    fetchData();
  };

  const deleteSlide = async (id: string) => {
    await supabase.from("hero_slides").delete().eq("id", id);
    toast({ title: "Slide excluído!" });
    fetchData();
  };

  // Testimonial CRUD
  const openTestimonialDialog = (t?: Testimonial) => {
    if (t) {
      setEditingTestimonial(t);
      setTestimonialForm({ client_name: t.client_name, client_location: t.client_location || "", client_photo_url: t.client_photo_url || "", message: t.message, rating: t.rating, is_active: t.is_active ?? true });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({ client_name: "", client_location: "", client_photo_url: "", message: "", rating: 5, is_active: true });
    }
    setIsTestimonialDialogOpen(true);
  };

  const saveTestimonial = async () => {
    if (!testimonialForm.client_name || !testimonialForm.message) { toast({ title: "Preencha nome e mensagem", variant: "destructive" }); return; }
    const data = { ...testimonialForm, client_location: testimonialForm.client_location || null, client_photo_url: testimonialForm.client_photo_url || null, sort_order: editingTestimonial?.sort_order ?? testimonials.length, workspace_id: workspaceId };
    if (editingTestimonial) {
      await supabase.from("testimonials").update(data).eq("id", editingTestimonial.id);
      toast({ title: "Depoimento atualizado!" });
    } else {
      await supabase.from("testimonials").insert(data);
      toast({ title: "Depoimento criado!" });
    }
    setIsTestimonialDialogOpen(false);
    fetchData();
  };

  const deleteTestimonial = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Depoimento excluído!" });
    fetchData();
  };

  const SITE_DOMAIN = "https://solarize.clyvecompany.com.br";
  const siteUrl = workspace?.slug ? `${SITE_DOMAIN}/${workspace.slug}` : "#";
  const copyLink = () => {
    if (workspace?.slug) {
      navigator.clipboard.writeText(siteUrl).then(() => toast({ title: "Link copiado!" }));
    }
  };

  // Helper for setting update
  const updateSetting = (key: string, value: string) => setSettings({ ...settings, [key]: value });

  // Color preview helper
  const color1 = settings.brand_color_primary || "#FF8C00";
  const color2 = settings.brand_color_secondary || "#1B3A5C";

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edição do Site</h1>
            <p className="text-muted-foreground text-sm">Personalize completamente o site da sua empresa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink}>
              <Globe className="w-4 h-4" /> Copiar Link
            </Button>
            <Button variant="outline" asChild>
              <a href={siteUrl} target="_blank"><Eye className="w-4 h-4" /> Ver Site</a>
            </Button>
            <Button variant="cta" onClick={saveSettings}><Save className="w-4 h-4" /> Salvar Tudo</Button>
          </div>
        </div>

        {/* Site URL Banner */}
        {workspace?.slug && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Link do seu site</p>
                <p className="text-xs text-muted-foreground">{SITE_DOMAIN}/{workspace.slug}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyLink}>
              Copiar link
            </Button>
          </div>
        )}

        <Tabs defaultValue="brand" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="brand" className="gap-1 text-xs"><Palette className="w-4 h-4" /> Identidade</TabsTrigger>
            <TabsTrigger value="hero" className="gap-1 text-xs"><Image className="w-4 h-4" /> Hero</TabsTrigger>
            <TabsTrigger value="slides" className="gap-1 text-xs"><Image className="w-4 h-4" /> Banners</TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1 text-xs"><MessageSquare className="w-4 h-4" /> Depoimentos</TabsTrigger>
            <TabsTrigger value="content" className="gap-1 text-xs"><Type className="w-4 h-4" /> Conteúdo</TabsTrigger>
            <TabsTrigger value="contact" className="gap-1 text-xs"><Phone className="w-4 h-4" /> Contato</TabsTrigger>
          </TabsList>

          {/* ===== BRAND / IDENTITY TAB ===== */}
          <TabsContent value="brand">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Logo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Image className="w-5 h-5 text-primary" /> Logotipo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">O logotipo aparece no cabeçalho e rodapé do seu site. Use uma imagem com fundo transparente (PNG) para melhor resultado.</p>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                      {(settings.site_logo_url || workspace?.logo_url) ? (
                        <img src={settings.site_logo_url || workspace?.logo_url || ""} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Image className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingImage}>
                        <Upload className="w-4 h-4" /> {uploadingImage ? "Enviando..." : "Enviar Logo"}
                      </Button>
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <p className="text-xs text-muted-foreground">PNG ou JPG, máx. 2MB</p>
                    </div>
                  </div>
                  {/* Logo variant selector */}
                  <div className="mt-4 space-y-3">
                    <Label className="text-sm font-medium">Versão do logo no cabeçalho</Label>
                    <p className="text-xs text-muted-foreground">Escolha a versão do logo que melhor contrasta com o fundo do cabeçalho do seu site.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "original", label: "Original", bg: "bg-muted", textColor: "text-foreground" },
                        { value: "white", label: "Branca", bg: "bg-gray-800", textColor: "text-white" },
                        { value: "black", label: "Preta", bg: "bg-white border border-border", textColor: "text-black" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSettings({ ...settings, header_logo_variant: opt.value })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${opt.bg} ${
                            (settings.header_logo_variant || "original") === opt.value
                              ? "ring-2 ring-primary ring-offset-2"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {(settings.site_logo_url || workspace?.logo_url) ? (
                            <img
                              src={settings.site_logo_url || workspace?.logo_url || ""}
                              alt="Logo preview"
                              className={`h-8 w-auto object-contain ${opt.value === "white" ? "brightness-0 invert" : opt.value === "black" ? "brightness-0" : ""}`}
                            />
                          ) : (
                            <Image className={`w-6 h-6 ${opt.textColor}`} />
                          )}
                          <span className={`text-xs font-medium ${opt.textColor}`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Logo example */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-xs font-medium text-foreground mb-2">📐 Exemplo de como enviar seu logotipo:</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center overflow-hidden p-2">
                        <img src="/src/assets/logo-solarize-branca.png" alt="Exemplo logo" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>✅ Formato <strong>PNG</strong> com fundo transparente</li>
                          <li>✅ Logotipo horizontal (retangular)</li>
                          <li>✅ Boa resolução (mínimo 400px de largura)</li>
                          <li>❌ Evite fotos ou imagens quadradas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Paleta de Cores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Escolha duas cores que representam sua marca. Elas serão usadas em botões, destaques, degradês e toda a identidade visual do seu site.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cor Principal</Label>
                      <p className="text-xs text-muted-foreground">Botões, destaques e CTAs</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color1}
                          onChange={(e) => updateSetting("brand_color_primary", e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
                        />
                        <Input
                          value={settings.brand_color_primary || "#FF8C00"}
                          onChange={(e) => updateSetting("brand_color_primary", e.target.value)}
                          placeholder="#FF8C00"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cor Secundária</Label>
                      <p className="text-xs text-muted-foreground">Fundos escuros e degradês</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => updateSetting("brand_color_secondary", e.target.value)}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border"
                        />
                        <Input
                          value={settings.brand_color_secondary || "#1B3A5C"}
                          onChange={(e) => updateSetting("brand_color_secondary", e.target.value)}
                          placeholder="#1B3A5C"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Prévia das cores</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: color1, color: "#fff" }}>
                        Principal
                      </div>
                      <div className="h-16 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: color2, color: "#fff" }}>
                        Secundária
                      </div>
                      <div className="h-16 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, color: "#fff" }}>
                        Degradê
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: color1, color: "#fff" }}>Botão Principal</button>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium border-2" style={{ borderColor: color1, color: color1 }}>Botão Outline</button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Name for Site */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Type className="w-5 h-5 text-primary" /> Nome da Empresa no Site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Quando não há logotipo, esse nome será exibido no cabeçalho do site.</p>
                  <Input
                    value={settings.site_company_name || workspace?.name || ""}
                    onChange={(e) => updateSetting("site_company_name", e.target.value)}
                    placeholder="Nome da sua empresa"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== HERO TAB ===== */}
          <TabsContent value="hero">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Seção Principal (Hero)</CardTitle>
                <Button variant="cta" size="sm" onClick={saveSettings}><Save className="w-4 h-4" /> Salvar</Button>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Background */}
                <div className="space-y-3">
                  <Label className="font-semibold">Imagem de Fundo</Label>
                  <p className="text-sm text-muted-foreground">A imagem principal que aparece no topo do site, por trás do texto. Recomendado: 1920x1080px, fotos de painéis solares ou instalações.</p>
                  <div className="aspect-video max-w-2xl bg-muted rounded-xl overflow-hidden relative">
                    {settings.hero_background_url ? (
                      <>
                        <img src={settings.hero_background_url} alt="Hero" className="w-full h-full object-cover" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => updateSetting("hero_background_url", "")}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Image className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-sm">Usando imagem padrão</p>
                      </div>
                    )}
                  </div>
                  <input ref={heroBackgroundInputRef} type="file" accept="image/*" onChange={handleHeroBackgroundUpload} className="hidden" />
                  <Button variant="outline" onClick={() => heroBackgroundInputRef.current?.click()} disabled={uploadingImage}>
                    <Upload className="w-4 h-4" /> {uploadingImage ? "Enviando..." : "Trocar Imagem"}
                  </Button>
                </div>

                {/* Tagline Badge */}
                <div className="space-y-2">
                  <Label className="font-semibold">Tagline (Badge de destaque)</Label>
                  <p className="text-sm text-muted-foreground">Frase curta que aparece acima do título principal num badge arredondado. Ex: "Desenvolvendo o seu futuro com energia solar"</p>
                  <Input value={settings.hero_tagline || ""} onChange={(e) => updateSetting("hero_tagline", e.target.value)} placeholder="Desenvolvendo o seu futuro com energia solar" />
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <Label className="font-semibold">Título Principal</Label>
                  <p className="text-sm text-muted-foreground">O título é dividido em 3 partes: texto inicial, destaque colorido (usa a cor principal), e texto final.</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label className="text-xs">Início</Label>
                      <Input value={settings.hero_title_prefix || ""} onChange={(e) => updateSetting("hero_title_prefix", e.target.value)} placeholder="Economize até" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Destaque (cor principal)</Label>
                      <Input value={settings.hero_title_highlight || ""} onChange={(e) => updateSetting("hero_title_highlight", e.target.value)} placeholder="95%" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Final</Label>
                      <Input value={settings.hero_title_suffix || ""} onChange={(e) => updateSetting("hero_title_suffix", e.target.value)} placeholder="na sua conta de energia" className="mt-1" />
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Prévia:</p>
                    <p className="text-xl font-bold">
                      {settings.hero_title_prefix || "Economize até"}{" "}
                      <span style={{ color: color1 }}>{settings.hero_title_highlight || "95%"}</span>{" "}
                      {settings.hero_title_suffix || "na sua conta de energia"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="font-semibold">Descrição</Label>
                  <p className="text-sm text-muted-foreground">Texto descritivo que aparece abaixo do título. Explique o que sua empresa oferece.</p>
                  <Textarea value={settings.hero_description || ""} onChange={(e) => updateSetting("hero_description", e.target.value)} placeholder="Transforme a luz do sol em economia real..." className="min-h-[80px]" />
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <Label className="font-semibold">Botões do Hero</Label>
                  <p className="text-sm text-muted-foreground">Textos dos dois botões de chamada para ação no topo do site.</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs">Botão Principal (cor de destaque)</Label>
                      <Input value={settings.hero_button_primary || ""} onChange={(e) => updateSetting("hero_button_primary", e.target.value)} placeholder="Simular Economia" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Botão Secundário (contorno)</Label>
                      <Input value={settings.hero_button_secondary || ""} onChange={(e) => updateSetting("hero_button_secondary", e.target.value)} placeholder="Agendar Visita Técnica" className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <Label className="font-semibold">Estatísticas</Label>
                  <p className="text-sm text-muted-foreground">Números de destaque que aparecem na barra abaixo do hero. Mostre sua experiência e resultados.</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="p-3 bg-muted rounded-xl space-y-2">
                        <p className="text-xs font-medium text-foreground">Estatística {i} {i === 2 ? "(Destaque na cor principal)" : ""}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={settings[`hero_stat_${i}_value`] || ""} onChange={(e) => updateSetting(`hero_stat_${i}_value`, e.target.value)} placeholder={["500+", "95%", "25", "10+"][i-1]} />
                          <Input value={settings[`hero_stat_${i}_label`] || ""} onChange={(e) => updateSetting(`hero_stat_${i}_label`, e.target.value)} placeholder={["Projetos Instalados", "Economia Média", "Anos de Garantia", "Anos no Mercado"][i-1]} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BANNERS/SLIDES TAB ===== */}
          <TabsContent value="slides">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Banners Promocionais</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Slides do carousel que aparecem abaixo do hero. Ótimo para promoções, financiamento e ofertas especiais.</p>
                </div>
                <Button variant="cta" onClick={() => openSlideDialog()}><Plus className="w-4 h-4" /> Novo Banner</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {slides.map(slide => (
                    <div key={slide.id} className={`flex items-center gap-4 p-4 rounded-xl border ${slide.is_active ? "bg-background border-border" : "bg-muted/50 border-muted"}`}>
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {slide.image_url ? <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-muted-foreground" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{slide.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{slide.subtitle || "Sem subtítulo"}</p>
                      </div>
                      <Switch checked={slide.is_active ?? false} onCheckedChange={async (c) => { await supabase.from("hero_slides").update({ is_active: c }).eq("id", slide.id); fetchData(); }} />
                      <Button variant="ghost" size="icon" onClick={() => openSlideDialog(slide)}><Settings className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSlide(slide.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {slides.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhum banner</h3>
                      <p className="text-muted-foreground text-sm">Adicione banners promocionais para o carousel.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TESTIMONIALS TAB ===== */}
          <TabsContent value="testimonials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Depoimentos de Clientes</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Depoimentos reais de clientes que já instalaram energia solar com sua empresa. Gera confiança e credibilidade.</p>
                </div>
                <Button variant="cta" onClick={() => openTestimonialDialog()}><Plus className="w-4 h-4" /> Novo Depoimento</Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {testimonials.map(t => (
                    <div key={t.id} className={`p-4 rounded-xl border ${t.is_active ? "bg-background border-border" : "bg-muted/50 border-muted"}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})`, color: "#fff" }}>
                          {t.client_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{t.client_name}</h4>
                          <p className="text-sm text-muted-foreground">{t.client_location}</p>
                        </div>
                        <Switch checked={t.is_active ?? false} onCheckedChange={async (c) => { await supabase.from("testimonials").update({ is_active: c }).eq("id", t.id); fetchData(); }} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{t.message}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < t.rating ? color1 : "hsl(var(--muted))" }}>★</span>)}</div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openTestimonialDialog(t)}><Settings className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteTestimonial(t.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {testimonials.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Nenhum depoimento</h3>
                      <p className="text-muted-foreground text-sm">Adicione depoimentos de clientes satisfeitos.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== CONTENT TAB ===== */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Simulator Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulador de Economia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">O simulador permite que visitantes calculem quanto podem economizar com energia solar. Esta seção aparece automaticamente no site. Personalize os textos:</p>
                  <div>
                    <Label className="text-xs">Título da Seção</Label>
                    <Input value={settings.simulator_title || ""} onChange={(e) => updateSetting("simulator_title", e.target.value)} placeholder="Descubra quanto você pode economizar" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input value={settings.simulator_description || ""} onChange={(e) => updateSetting("simulator_description", e.target.value)} placeholder="Informe seu consumo mensal de energia..." className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* How It Works */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">A seção "Como Funciona" mostra as 4 etapas do processo: Análise → Projeto → Instalação → Sistema Ativo. Esta seção é fixa, mas você pode personalizar os textos:</p>
                  <div>
                    <Label className="text-xs">Título da Seção</Label>
                    <Input value={settings.how_it_works_title || ""} onChange={(e) => updateSetting("how_it_works_title", e.target.value)} placeholder="Do orçamento ao Sistema Ativo" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Descrição</Label>
                    <Input value={settings.how_it_works_description || ""} onChange={(e) => updateSetting("how_it_works_description", e.target.value)} placeholder="Cuidamos de todo o processo para você..." className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Texto Sobre a Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Descrição que aparece na seção "Fale Conosco" do formulário de contato. Explique por que o cliente deve escolher sua empresa.</p>
                  <Textarea value={settings.about_text || ""} onChange={(e) => updateSetting("about_text", e.target.value)} placeholder="Descrição da empresa..." className="min-h-[100px]" />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="cta" onClick={saveSettings}><Save className="w-4 h-4" /> Salvar Alterações</Button>
              </div>
            </div>
          </TabsContent>

          {/* ===== CONTACT TAB ===== */}
          <TabsContent value="contact">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Esses dados aparecem no rodapé e na seção de contato do site. Também são usados no botão de WhatsApp.</p>
                </div>
                <Button variant="cta" size="sm" onClick={saveSettings}><Save className="w-4 h-4" /> Salvar</Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Telefone</Label>
                    <Input value={settings.contact_phone || ""} onChange={(e) => updateSetting("contact_phone", e.target.value)} placeholder="(00) 0000-0000" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary" /> WhatsApp</Label>
                    <Input value={settings.contact_whatsapp || ""} onChange={(e) => updateSetting("contact_whatsapp", e.target.value)} placeholder="(00) 00000-0000" className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Aparece como botão flutuante no site</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email</Label>
                    <Input value={settings.contact_email || ""} onChange={(e) => updateSetting("contact_email", e.target.value)} placeholder="contato@empresa.com" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><Instagram className="w-4 h-4 text-primary" /> Instagram</Label>
                    <Input value={settings.contact_instagram || ""} onChange={(e) => updateSetting("contact_instagram", e.target.value)} placeholder="@minhaempresa" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Região de Atuação</Label>
                    <Input value={settings.contact_region || ""} onChange={(e) => updateSetting("contact_region", e.target.value)} placeholder="Ex: Grande São Paulo, Interior de MG" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Endereço / Cidade</Label>
                    <Input value={settings.contact_address || ""} onChange={(e) => updateSetting("contact_address", e.target.value)} placeholder="Rua Exemplo, 123 - Cidade/UF" className="mt-1" />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-2">💡 Dica</p>
                  <p className="text-xs text-muted-foreground">Os dados de contato aqui substituem as informações do perfil da empresa no site público. Se deixar em branco, os dados do perfil da empresa serão usados automaticamente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Slide Dialog */}
      <Dialog open={isSlideDialogOpen} onOpenChange={setIsSlideDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingSlide ? "Editar Banner" : "Novo Banner"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Imagem do Banner *</Label>
              <div className="mt-1.5">
                {slideForm.image_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={slideForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setSlideForm({ ...slideForm, image_url: "" })}><X className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <div onClick={() => slideImageInputRef.current?.click()} className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para upload</p>
                  </div>
                )}
                <input ref={slideImageInputRef} type="file" accept="image/*" onChange={handleSlideImageUpload} className="hidden" />
              </div>
            </div>
            <div><Label>Título *</Label><Input value={slideForm.title} onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="Título do banner" className="mt-1" /></div>
            <div><Label>Subtítulo</Label><Input value={slideForm.subtitle} onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="Descrição adicional" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Texto do Botão</Label><Input value={slideForm.button_text} onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })} placeholder="Saiba mais" className="mt-1" /></div>
              <div><Label>Link do Botão</Label><Input value={slideForm.button_link} onChange={(e) => setSlideForm({ ...slideForm, button_link: e.target.value })} placeholder="#contato" className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={slideForm.is_active} onCheckedChange={(c) => setSlideForm({ ...slideForm, is_active: c })} /><Label>Ativo</Label></div>
            <Button variant="cta" className="w-full" onClick={saveSlide} disabled={uploadingImage}>{editingSlide ? "Atualizar" : "Criar"} Banner</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nome do Cliente *</Label><Input value={testimonialForm.client_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })} placeholder="Nome completo" className="mt-1" /></div>
              <div><Label>Localização</Label><Input value={testimonialForm.client_location} onChange={(e) => setTestimonialForm({ ...testimonialForm, client_location: e.target.value })} placeholder="Cidade/UF" className="mt-1" /></div>
            </div>
            <div><Label>Depoimento *</Label><Textarea value={testimonialForm.message} onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })} placeholder="O que o cliente disse..." className="mt-1 min-h-[100px]" /></div>
            <div>
              <Label>Avaliação: {testimonialForm.rating} estrelas</Label>
              <div className="flex gap-2 mt-1">{[1,2,3,4,5].map(r => <button key={r} type="button" onClick={() => setTestimonialForm({ ...testimonialForm, rating: r })} className="text-2xl" style={{ color: r <= testimonialForm.rating ? color1 : "hsl(var(--muted))" }}>★</button>)}</div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={testimonialForm.is_active} onCheckedChange={(c) => setTestimonialForm({ ...testimonialForm, is_active: c })} /><Label>Ativo</Label></div>
            <Button variant="cta" className="w-full" onClick={saveTestimonial}>{editingTestimonial ? "Atualizar" : "Criar"} Depoimento</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
