import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Tag, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import logoSolarize from "@/assets/logo-solarize.png";
import logoSolarizeBranca from "@/assets/logo-solarize-branca.png";

const categories = [
  { id: "all", label: "Todos" },
  { id: "mercado", label: "Mercado Solar" },
  { id: "dicas", label: "Dicas Práticas" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "legislacao", label: "Legislação" },
  { id: "cases", label: "Cases de Sucesso" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = articles.filter((a: any) => {
    const matchCategory = activeCategory === "all" || a.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featured = filtered.filter((a: any) => a.is_featured);
  const regular = filtered.filter((a: any) => !a.is_featured);

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
            <Link to="/blog" className="text-sm text-foreground font-medium transition-colors">Blog</Link>
            <Link to="/materiais" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Materiais</Link>
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
            Blog <span className="text-gradient-orange">Solarize</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Artigos, dicas e novidades sobre o mercado de energia solar para ajudar sua empresa a crescer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar artigos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-sm"><CardContent className="p-5"><Skeleton className="aspect-video mb-4 rounded-lg" /><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum artigo publicado ainda. Volte em breve!</p>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="mb-12">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Destaques</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featured.map((article: any, i: number) => (
                    <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <ArticleCard article={article} large />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featured.length > 0 ? regular : filtered).map((article: any, i: number) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-hero rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">Quer crescer no mercado solar?</h2>
          <p className="text-primary-foreground/80 mb-6">Teste o Solarize por 14 dias grátis e veja como organizar sua operação.</p>
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

function ArticleCard({ article, large }: { article: any; large?: boolean }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
      )}
      <CardContent className={large ? "p-6" : "p-5"}>
        <Badge variant="secondary" className="mb-2 text-xs">
          <Tag className="w-3 h-3 mr-1" />
          {article.category}
        </Badge>
        <h3 className={`font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2 ${large ? "text-xl" : "text-base"}`}>
          {article.title}
        </h3>
        {article.excerpt && <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {article.published_at && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(article.published_at)}</span>}
          {article.read_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.read_time}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
