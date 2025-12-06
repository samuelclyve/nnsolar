import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Image, Plus, Trash2, Save, Eye, GripVertical,
  Settings, MessageSquare, Type, Palette
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
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
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch slides
    const { data: slidesData } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    setSlides(slidesData || []);

    // Fetch testimonials
    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    setTestimonials(testimonialsData || []);

    // Fetch settings
    const { data: settingsData } = await supabase
      .from("site_settings")
      .select("*");
    
    const settingsMap: Record<string, string> = {};
    (settingsData || []).forEach((s: SiteSetting) => {
      settingsMap[s.setting_key] = s.setting_value || "";
    });
    setSettings(settingsMap);

    setIsLoading(false);
  };

  // Slide functions
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
      toast({ title: "Preencha título e URL da imagem", variant: "destructive" });
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

  // Testimonial functions
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

  // Settings functions
  const updateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    for (const [key, value] of Object.entries(settings)) {
      await supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);
    }
    toast({ title: "Configurações salvas!" });
  };

  return (
    <AppLayout title="Edição do Site">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo do site
          </p>
          <Button variant="outline" asChild>
            <a href="/" target="_blank">
              <Eye className="w-4 h-4" />
              Ver Site
            </a>
          </Button>
        </div>

        <Tabs defaultValue="slides" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="slides" className="gap-2">
              <Image className="w-4 h-4" />
              Banners
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
                  <h2 className="text-xl font-bold text-foreground">Banners do Hero</h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie os slides do carousel na página inicial
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
                      Adicione slides para personalizar o hero.
                    </p>
                  </div>
                )}
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
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-solar-orange-light flex items-center justify-center text-secondary-foreground font-bold">
                        {t.client_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{t.client_name}</h4>
                        <p className="text-sm text-muted-foreground">{t.client_location}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={t.is_active ?? false}
                          onCheckedChange={async (checked) => {
                            await supabase.from("testimonials").update({ is_active: checked }).eq("id", t.id);
                            fetchData();
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{t.message}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < t.rating ? "text-secondary" : "text-muted"}>★</span>
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
                  Salvar Tudo
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Título do Hero</Label>
                    <Input
                      value={settings.hero_title || ""}
                      onChange={(e) => updateSetting("hero_title", e.target.value)}
                      placeholder="Economize até 95%..."
                    />
                  </div>
                  <div>
                    <Label>Subtítulo do Hero</Label>
                    <Input
                      value={settings.hero_subtitle || ""}
                      onChange={(e) => updateSetting("hero_subtitle", e.target.value)}
                      placeholder="Transforme a luz do sol..."
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Simulador</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Título do Simulador</Label>
                      <Input
                        value={settings.simulator_title || ""}
                        onChange={(e) => updateSetting("simulator_title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Subtítulo do Simulador</Label>
                      <Input
                        value={settings.simulator_subtitle || ""}
                        onChange={(e) => updateSetting("simulator_subtitle", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">Contato</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={settings.contact_phone || ""}
                        onChange={(e) => updateSetting("contact_phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>WhatsApp (só números)</Label>
                      <Input
                        value={settings.whatsapp_number || ""}
                        onChange={(e) => updateSetting("whatsapp_number", e.target.value)}
                        placeholder="5588998471511"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={settings.contact_email || ""}
                        onChange={(e) => updateSetting("contact_email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Endereço</Label>
                      <Input
                        value={settings.contact_address || ""}
                        onChange={(e) => updateSetting("contact_address", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Slide Dialog */}
        <Dialog open={isSlideDialogOpen} onOpenChange={setIsSlideDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "Editar Slide" : "Novo Slide"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="Título do slide"
                />
              </div>
              <div>
                <Label>Subtítulo</Label>
                <Textarea
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="Texto de apoio"
                  rows={2}
                />
              </div>
              <div>
                <Label>URL da Imagem *</Label>
                <Input
                  value={slideForm.image_url}
                  onChange={(e) => setSlideForm({ ...slideForm, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Texto do Botão</Label>
                  <Input
                    value={slideForm.button_text}
                    onChange={(e) => setSlideForm({ ...slideForm, button_text: e.target.value })}
                    placeholder="Saiba mais"
                  />
                </div>
                <div>
                  <Label>Link do Botão</Label>
                  <Input
                    value={slideForm.button_link}
                    onChange={(e) => setSlideForm({ ...slideForm, button_link: e.target.value })}
                    placeholder="#simulador"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={slideForm.is_active}
                  onCheckedChange={(checked) => setSlideForm({ ...slideForm, is_active: checked })}
                />
                <Label>Slide ativo</Label>
              </div>
              <Button variant="cta" className="w-full" onClick={saveSlide}>
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Testimonial Dialog */}
        <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={testimonialForm.client_name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label>Localização</Label>
                <Input
                  value={testimonialForm.client_location}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, client_location: e.target.value })}
                  placeholder="Cidade, Estado"
                />
              </div>
              <div>
                <Label>URL da Foto (opcional)</Label>
                <Input
                  value={testimonialForm.client_photo_url}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, client_photo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Mensagem *</Label>
                <Textarea
                  value={testimonialForm.message}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                  placeholder="Depoimento do cliente..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Avaliação</Label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                      className={`text-2xl ${star <= testimonialForm.rating ? "text-secondary" : "text-muted"}`}
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
                <Label>Depoimento ativo</Label>
              </div>
              <Button variant="cta" className="w-full" onClick={saveTestimonial}>
                <Save className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}