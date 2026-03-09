import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Image, Plus, Trash2, Save, Eye, GripVertical,
  Settings, MessageSquare, Type, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

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

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
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
    title: "",
    subtitle: "",
    image_url: "",
    button_text: "",
    button_link: "",
    is_active: true,
  });
  const [testimonialForm, setTestimonialForm] = useState({
    client_name: "",
    client_location: "",
    client_photo_url: "",
    message: "",
    rating: 5,
    is_active: true,
  });
  const slideImageInputRef = useRef<HTMLInputElement>(null);
  const heroBackgroundInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (workspaceId) fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    const { data: slidesData } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .order("sort_order", { ascending: true });
    setSlides(slidesData || []);

    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .eq("workspace_id", workspaceId!)
      .order("sort_order", { ascending: true });
    setTestimonials(testimonialsData || []);

    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("*")
      .eq("workspace_id", workspaceId!);
    
    const settingsMap: Record<string, string> = {};
    (settingsData || []).forEach((s: SiteSetting) => {
      settingsMap[s.setting_key] = s.setting_value || "";
    });
    setSettings(settingsMap);

    setIsLoading(false);
  };

  const uploadImage = async (file: File, bucket: string = "documents"): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `site-images/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) {
      setSlideForm({ ...slideForm, image_url: url });
    }
    setUploadingImage(false);
  };

  const handleHeroBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await uploadImage(file);
    if (url) {
      setSettings({ ...settings, hero_background_url: url });
      await supabase
        .from("site_settings")
        .upsert({ setting_key: "hero_background_url", setting_value: url, setting_type: "image" });
      toast({ title: "Imagem de fundo atualizada!" });
    }
    setUploadingImage(false);
  };

  const openSlideDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        title: slide.title,
        subtitle: slide.subtitle || "",
        image_url: slide.image_url,
        button_text: slide.button_text || "",
        button_link: slide.button_link || "",
        is_active: slide.is_active ?? true,
      });
    } else {
      setEditingSlide(null);
      setSlideForm({
        title: "",
        subtitle: "",
        image_url: "",
        button_text: "",
        button_link: "",
        is_active: true,
      });
    }
    setIsSlideDialogOpen(true);
  };

  const saveSlide = async () => {
    if (!slideForm.title || !slideForm.image_url) {
      toast({ title: "Preencha título e faça upload da imagem", variant: "destructive" });
      return;
    }

    const slideData = {
      title: slideForm.title,
      subtitle: slideForm.subtitle || null,
      image_url: slideForm.image_url,
      button_text: slideForm.button_text || null,
      button_link: slideForm.button_link || null,
      is_active: slideForm.is_active,
      sort_order: editingSlide?.sort_order ?? slides.length,
      workspace_id: workspaceId,
    };

    if (editingSlide) {
      const { error } = await supabase
        .from("hero_slides")
        .update(slideData)
        .eq("id", editingSlide.id);

      if (error) {
        toast({ title: "Erro ao atualizar slide", variant: "destructive" });
        return;
      }
      toast({ title: "Slide atualizado!" });
    } else {
      const { error } = await supabase.from("hero_slides").insert(slideData);

      if (error) {
        toast({ title: "Erro ao criar slide", variant: "destructive" });
        return;
      }
      toast({ title: "Slide criado!" });
    }

    setIsSlideDialogOpen(false);
    fetchData();
  };

  const deleteSlide = async (id: string) => {
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir slide", variant: "destructive" });
      return;
    }
    toast({ title: "Slide excluído!" });
    fetchData();
  };

  const openTestimonialDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialForm({
        client_name: testimonial.client_name,
        client_location: testimonial.client_location || "",
        client_photo_url: testimonial.client_photo_url || "",
        message: testimonial.message,
        rating: testimonial.rating,
        is_active: testimonial.is_active ?? true,
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        client_name: "",
        client_location: "",
        client_photo_url: "",
        message: "",
        rating: 5,
        is_active: true,
      });
    }
    setIsTestimonialDialogOpen(true);
  };

  const saveTestimonial = async () => {
    if (!testimonialForm.client_name || !testimonialForm.message) {
      toast({ title: "Preencha nome e mensagem", variant: "destructive" });
      return;
    }

    const data = {
      client_name: testimonialForm.client_name,
      client_location: testimonialForm.client_location || null,
      client_photo_url: testimonialForm.client_photo_url || null,
      message: testimonialForm.message,
      rating: testimonialForm.rating,
      is_active: testimonialForm.is_active,
      sort_order: editingTestimonial?.sort_order ?? testimonials.length,
      workspace_id: workspaceId,
    };

    if (editingTestimonial) {
      const { error } = await supabase
        .from("testimonials")
        .update(data)
        .eq("id", editingTestimonial.id);

      if (error) {
        toast({ title: "Erro ao atualizar depoimento", variant: "destructive" });
        return;
      }
      toast({ title: "Depoimento atualizado!" });
    } else {
      const { error } = await supabase.from("testimonials").insert(data);

      if (error) {
        toast({ title: "Erro ao criar depoimento", variant: "destructive" });
        return;
      }
      toast({ title: "Depoimento criado!" });
    }

    setIsTestimonialDialogOpen(false);
    fetchData();
  };

  const deleteTestimonial = async (id: string) => {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir depoimento", variant: "destructive" });
      return;
    }
    toast({ title: "Depoimento excluído!" });
    fetchData();
  };

  const saveSettings = async () => {
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            { setting_key: key, setting_value: value, setting_type: "text" },
            { onConflict: "setting_key" }
          );
        
        if (error) {
          console.error(`Error saving ${key}:`, error);
          throw error;
        }
      }
      toast({ title: "Configurações salvas com sucesso!" });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Edição do Site">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edição do Site</h1>
            <p className="text-muted-foreground">Gerencie todo o conteúdo do site</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <Eye className="w-4 h-4" />
              Ver Site
            </a>
          </Button>
        </div>

        <Tabs defaultValue="slides" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="slides" className="gap-2">
              <Image className="w-4 h-4" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="hero" className="gap-2">
              <Image className="w-4 h-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Depoimentos
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Type className="w-4 h-4" />
              Textos
            </TabsTrigger>
          </TabsList>

          {/* Slides Tab */}
          <TabsContent value="slides">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Banners do Carousel</h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie os slides do carousel promocional
                  </p>
                </div>
                <Button variant="cta" onClick={() => openSlideDialog()}>
                  <Plus className="w-4 h-4" />
                  Novo Slide
                </Button>
              </div>

              <div className="space-y-3">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      slide.is_active ? "bg-background border-border" : "bg-muted/50 border-muted"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                    
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {slide.image_url ? (
                        <img 
                          src={slide.image_url} 
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{slide.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {slide.subtitle || "Sem subtítulo"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.is_active ?? false}
                        onCheckedChange={async (checked) => {
                          await supabase.from("hero_slides").update({ is_active: checked }).eq("id", slide.id);
                          fetchData();
                        }}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openSlideDialog(slide)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteSlide(slide.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {slides.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum slide cadastrado
                    </h3>
                    <p className="text-muted-foreground">
                      Adicione slides para o carousel promocional.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Hero Tab - Full Configuration */}
          <TabsContent value="hero">
            <div className="bg-card rounded-2xl p-6 border border-border space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Configuração do Hero</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure todos os textos e imagem da seção principal do site
                  </p>
                </div>
                <Button variant="cta" onClick={saveSettings}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>

              {/* Background Image */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Imagem de Fundo</h3>
                <div className="aspect-video max-w-2xl bg-muted rounded-xl overflow-hidden relative">
                  {settings.hero_background_url ? (
                    <>
                      <img 
                        src={settings.hero_background_url} 
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setSettings({ ...settings, hero_background_url: "" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Usando imagem padrão</p>
                    </div>
                  )}
                </div>
                <input
                  ref={heroBackgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeroBackgroundUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => heroBackgroundInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Upload className="w-4 h-4" />
                  {uploadingImage ? "Enviando..." : "Trocar Imagem de Fundo"}
                </Button>
              </div>

              {/* Tagline */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Texto de Destaque (Badge)</h3>
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={settings.hero_tagline || ""}
                    onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                    placeholder="Desenvolvendo o seu futuro com energia solar"
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Título Principal</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Início do Título</Label>
                    <Input
                      value={settings.hero_title_prefix || ""}
                      onChange={(e) => setSettings({ ...settings, hero_title_prefix: e.target.value })}
                      placeholder="Economize até"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Destaque (Laranja)</Label>
                    <Input
                      value={settings.hero_title_highlight || ""}
                      onChange={(e) => setSettings({ ...settings, hero_title_highlight: e.target.value })}
                      placeholder="95%"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Final do Título</Label>
                    <Input
                      value={settings.hero_title_suffix || ""}
                      onChange={(e) => setSettings({ ...settings, hero_title_suffix: e.target.value })}
                      placeholder="na sua conta de energia"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Prévia:</p>
                  <p className="text-xl font-bold">
                    {settings.hero_title_prefix || "Economize até"}{" "}
                    <span className="text-primary">{settings.hero_title_highlight || "95%"}</span>{" "}
                    {settings.hero_title_suffix || "na sua conta de energia"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Descrição</h3>
                <div>
                  <Label>Texto Descritivo</Label>
                  <Textarea
                    value={settings.hero_description || ""}
                    onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                    placeholder="Transforme a luz do sol em economia real..."
                    className="mt-1.5 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Botões</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Botão Principal</Label>
                    <Input
                      value={settings.hero_button_primary || ""}
                      onChange={(e) => setSettings({ ...settings, hero_button_primary: e.target.value })}
                      placeholder="Simular Economia"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Botão Secundário</Label>
                    <Input
                      value={settings.hero_button_secondary || ""}
                      onChange={(e) => setSettings({ ...settings, hero_button_secondary: e.target.value })}
                      placeholder="Agendar Visita Técnica"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Estatísticas</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <p className="text-sm font-medium">Estatística 1</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={settings.hero_stat_1_value || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_1_value: e.target.value })}
                        placeholder="500+"
                      />
                      <Input
                        value={settings.hero_stat_1_label || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_1_label: e.target.value })}
                        placeholder="Projetos Instalados"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <p className="text-sm font-medium">Estatística 2 (Destaque)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={settings.hero_stat_2_value || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_2_value: e.target.value })}
                        placeholder="95%"
                      />
                      <Input
                        value={settings.hero_stat_2_label || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_2_label: e.target.value })}
                        placeholder="Economia Média"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <p className="text-sm font-medium">Estatística 3</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={settings.hero_stat_3_value || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_3_value: e.target.value })}
                        placeholder="25"
                      />
                      <Input
                        value={settings.hero_stat_3_label || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_3_label: e.target.value })}
                        placeholder="Anos de Garantia"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-xl space-y-3">
                    <p className="text-sm font-medium">Estatística 4</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={settings.hero_stat_4_value || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_4_value: e.target.value })}
                        placeholder="10+"
                      />
                      <Input
                        value={settings.hero_stat_4_label || ""}
                        onChange={(e) => setSettings({ ...settings, hero_stat_4_label: e.target.value })}
                        placeholder="Anos no Mercado"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Depoimentos</h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie os depoimentos de clientes
                  </p>
                </div>
                <Button variant="cta" onClick={() => openTestimonialDialog()}>
                  <Plus className="w-4 h-4" />
                  Novo Depoimento
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border ${
                      t.is_active ? "bg-background border-border" : "bg-muted/50 border-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                        {t.client_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{t.client_name}</h4>
                        <p className="text-sm text-muted-foreground">{t.client_location}</p>
                      </div>
                      <Switch
                        checked={t.is_active ?? false}
                        onCheckedChange={async (checked) => {
                          await supabase.from("testimonials").update({ is_active: checked }).eq("id", t.id);
                          fetchData();
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{t.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < t.rating ? "text-primary" : "text-muted"}>★</span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openTestimonialDialog(t)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteTestimonial(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {testimonials.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum depoimento cadastrado
                    </h3>
                    <p className="text-muted-foreground">
                      Adicione depoimentos de clientes satisfeitos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Textos do Site</h2>
                  <p className="text-sm text-muted-foreground">
                    Edite os textos e informações exibidas no site
                  </p>
                </div>
                <Button variant="cta" onClick={saveSettings}>
                  <Save className="w-4 h-4" />
                  Salvar
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Título Principal do Hero</Label>
                  <Input
                    value={settings.hero_title || ""}
                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                    placeholder="Economize até 95% na sua conta de energia"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Subtítulo do Hero</Label>
                  <Input
                    value={settings.hero_subtitle || ""}
                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                    placeholder="Transforme a luz do sol em economia real"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Telefone de Contato</Label>
                  <Input
                    value={settings.contact_phone || ""}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Email de Contato</Label>
                  <Input
                    value={settings.contact_email || ""}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    placeholder="contato@nnenergia.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={settings.whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="5500000000000"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input
                    value={settings.address || ""}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    placeholder="Rua Exemplo, 123 - Cidade/UF"
                    className="mt-1.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Texto sobre a empresa</Label>
                  <Textarea
                    value={settings.about_text || ""}
                    onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                    placeholder="Descrição da empresa..."
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Slide Dialog */}
      <Dialog open={isSlideDialogOpen} onOpenChange={setIsSlideDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Editar Slide" : "Novo Slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Imagem do Banner *</Label>
              <div className="mt-1.5">
                {slideForm.image_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={slideForm.image_url} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setSlideForm({ ...slideForm, image_url: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    onClick={() => slideImageInputRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload</p>
                  </div>
                )}
                <input
                  ref={slideImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSlideImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input
                value={slideForm.title}
                onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                placeholder="Título do slide"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={slideForm.subtitle}
                onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                placeholder="Descrição adicional"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={slideForm.button_text}
                  onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
                  placeholder="Saiba mais"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Link do Botão</Label>
                <Input
                  value={slideForm.button_link}
                  onChange={(e) => setSlideForm({ ...slideForm, button_link: e.target.value })}
                  placeholder="#contato"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={slideForm.is_active}
                onCheckedChange={(checked) => setSlideForm({ ...slideForm, is_active: checked })}
              />
              <Label>Ativo</Label>
            </div>
            <Button 
              variant="cta" 
              className="w-full" 
              onClick={saveSlide}
              disabled={uploadingImage}
            >
              {editingSlide ? "Atualizar" : "Criar"} Slide
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={testimonialForm.client_name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })}
                  placeholder="Nome completo"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Localização</Label>
                <Input
                  value={testimonialForm.client_location}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, client_location: e.target.value })}
                  placeholder="Cidade/UF"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Depoimento *</Label>
              <Textarea
                value={testimonialForm.message}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                placeholder="O que o cliente disse..."
                className="mt-1.5 min-h-[100px]"
              />
            </div>
            <div>
              <Label>Avaliação: {testimonialForm.rating} estrelas</Label>
              <div className="flex gap-2 mt-1.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setTestimonialForm({ ...testimonialForm, rating })}
                    className={`text-2xl ${rating <= testimonialForm.rating ? "text-primary" : "text-muted"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={testimonialForm.is_active}
                onCheckedChange={(checked) => setTestimonialForm({ ...testimonialForm, is_active: checked })}
              />
              <Label>Ativo</Label>
            </div>
            <Button variant="cta" className="w-full" onClick={saveTestimonial}>
              {editingTestimonial ? "Atualizar" : "Criar"} Depoimento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}