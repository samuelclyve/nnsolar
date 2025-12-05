import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Image, Plus, Trash2, Save, Eye, GripVertical,
  Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

export default function SiteEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    button_text: "",
    button_link: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Erro ao carregar slides", variant: "destructive" });
      return;
    }

    setSlides(data || []);
    setIsLoading(false);
  };

  const openEditDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle || "",
        image_url: slide.image_url,
        button_text: slide.button_text || "",
        button_link: slide.button_link || "",
        is_active: slide.is_active ?? true,
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: "",
        subtitle: "",
        image_url: "",
        button_text: "",
        button_link: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const saveSlide = async () => {
    if (!formData.title || !formData.image_url) {
      toast({ title: "Preencha título e URL da imagem", variant: "destructive" });
      return;
    }

    const slideData = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      image_url: formData.image_url,
      button_text: formData.button_text || null,
      button_link: formData.button_link || null,
      is_active: formData.is_active,
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
      const { error } = await supabase
        .from("hero_slides")
        .insert(slideData);

      if (error) {
        toast({ title: "Erro ao criar slide", variant: "destructive" });
        return;
      }
      toast({ title: "Slide criado!" });
    }

    setIsDialogOpen(false);
    fetchSlides();
  };

  const deleteSlide = async (id: string) => {
    const { error } = await supabase
      .from("hero_slides")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir slide", variant: "destructive" });
      return;
    }

    toast({ title: "Slide excluído!" });
    fetchSlides();
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("hero_slides")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar slide", variant: "destructive" });
      return;
    }

    fetchSlides();
  };

  return (
    <AppLayout title="Edição do Site">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Hero Slides Section */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Banners do Hero</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie os slides do carousel na página inicial
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/" target="_blank">
                  <Eye className="w-4 h-4" />
                  Ver Site
                </a>
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="cta" onClick={() => openEditDialog()}>
                    <Plus className="w-4 h-4" />
                    Novo Slide
                  </Button>
                </DialogTrigger>
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
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Título do slide"
                      />
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="Texto de apoio"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>URL da Imagem *</Label>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Texto do Botão</Label>
                        <Input
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="Saiba mais"
                        />
                      </div>
                      <div>
                        <Label>Link do Botão</Label>
                        <Input
                          value={formData.button_link}
                          onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                          placeholder="#simulador"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
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
            </div>
          </div>

          {/* Slides List */}
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                    onCheckedChange={() => toggleActive(slide.id, slide.is_active ?? false)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(slide)}
                  >
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
              </motion.div>
            ))}

            {slides.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum slide cadastrado
                </h3>
                <p className="text-muted-foreground">
                  Adicione slides para personalizar o hero da página inicial.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}

// Fix missing import
import { Settings } from "lucide-react";
