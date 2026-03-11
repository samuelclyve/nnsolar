import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Download, BookOpen, FileText, Video, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import logoSolarize from "@/assets/logo-solarize.png";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";

const categoryInfo: Record<string, { label: string; icon: typeof BookOpen }> = {
  ebook: { label: "E-book", icon: BookOpen },
  guia: { label: "Guia Prático", icon: FileText },
  planilha: { label: "Planilha", icon: FileText },
  video: { label: "Vídeo-aula", icon: Video },
};

const categoryFilters = [
  { id: "all", label: "Todos" },
  { id: "ebook", label: "E-books" },
  { id: "guia", label: "Guias" },
  { id: "planilha", label: "Planilhas" },
  { id: "video", label: "Vídeo-aulas" },
];

export default function Materials() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["download-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("download_materials")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = materials.filter((m: any) => {
    const matchCat = activeCategory === "all" || m.category === activeCategory;
    const matchSearch = searchQuery === "" || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || (m.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logoSolarize} alt="Solarize" className="h-5 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Início</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            <Link to="/materiais" className="text-sm text-foreground font-medium transition-colors">Materiais</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Entrar</Button></Link>
            <Link to="/signup"><Button size="sm" className="gap-1">Começar grátis <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar ao site
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Materiais <span className="text-gradient-orange">Gratuitos</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            E-books, guias e planilhas para impulsionar sua empresa de energia solar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar materiais..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm"><CardContent className="p-5"><Skeleton className="aspect-[4/3] mb-4 rounded-lg" /><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Download className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum material disponível ainda. Volte em breve!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((material: any, i: number) => {
              const catInfo = categoryInfo[material.category] || { label: material.category, icon: FileText };
              const CatIcon = catInfo.icon;
              return (
                <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                    {material.cover_image_url ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={material.cover_image_url} alt={material.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center">
                        <CatIcon className="w-16 h-16 text-muted-foreground/20" />
                      </div>
                    )}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <Badge variant="secondary" className="mb-2 text-xs w-fit">
                        <CatIcon className="w-3 h-3 mr-1" /> {catInfo.label}
                      </Badge>
                      <h3 className="text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2">{material.title}</h3>
                      {material.description && <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{material.description}</p>}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        {material.download_count > 0 && (
                          <span className="text-xs text-muted-foreground">{material.download_count} downloads</span>
                        )}
                        {material.file_url ? (
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-1">
                              <Download className="w-4 h-4" /> Baixar
                            </Button>
                          </a>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" disabled className="gap-1">
                              <Download className="w-4 h-4" /> Em breve
                            </Button>
                            <a href="https://wa.me/5588998536228?text=Ol%C3%A1!%20Tenho%20interesse%20no%20material%3A%20{{material.title}}" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="gap-1 text-success border-success/30 hover:bg-success/10">
                                <MessageCircle className="w-4 h-4" /> Tenho interesse
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-hero rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">Organize sua empresa solar com o Solarize</h2>
          <p className="text-primary-foreground/80 mb-6">CRM, gestão de instalações e site personalizado. 14 dias grátis.</p>
          <Link to="/signup"><Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 gap-2">Criar minha conta grátis <ArrowRight className="w-5 h-5" /></Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-primary-foreground" style={{ backgroundColor: 'hsl(28, 100%, 50%)' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <img src={logoSolarizeBranca} alt="Solarize" className="h-7 w-auto object-contain" />
            <p className="text-primary-foreground/70 text-sm">© {new Date().getFullYear()} Solarize. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link to="/" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Início</Link>
              <Link to="/blog" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Blog</Link>
              <Link to="/materiais" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Materiais</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
