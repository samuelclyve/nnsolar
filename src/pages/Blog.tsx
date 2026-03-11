import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Tag, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const articles = [
  {
    id: "1",
    title: "Como o marco legal da energia solar impacta sua empresa em 2025",
    excerpt: "Entenda as mudanças regulatórias e como se adaptar para continuar crescendo no mercado de energia solar brasileiro.",
    category: "legislacao",
    date: "2025-03-01",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    featured: true,
  },
  {
    id: "2",
    title: "5 estratégias de marketing digital para empresas de energia solar",
    excerpt: "Descubra como atrair mais clientes usando SEO, redes sociais e conteúdo estratégico para o mercado solar.",
    category: "dicas",
    date: "2025-02-20",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    featured: false,
  },
  {
    id: "3",
    title: "Painéis bifaciais: vale a pena investir nessa tecnologia?",
    excerpt: "Análise completa sobre painéis bifaciais, eficiência, custo-benefício e quando recomendar aos seus clientes.",
    category: "tecnologia",
    date: "2025-02-15",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=600&q=80",
    featured: false,
  },
  {
    id: "4",
    title: "Mercado solar brasileiro cresce 30% em 2024: o que esperar para 2025",
    excerpt: "Dados atualizados do mercado fotovoltaico no Brasil e projeções para o próximo ano.",
    category: "mercado",
    date: "2025-02-10",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80",
    featured: true,
  },
  {
    id: "5",
    title: "Como a Solar Tech MG triplicou suas vendas com o Solarize",
    excerpt: "Conheça a história da Solar Tech MG e como a plataforma ajudou a escalar operações e aumentar conversões.",
    category: "cases",
    date: "2025-02-05",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
    featured: false,
  },
  {
    id: "6",
    title: "Guia completo: como dimensionar um sistema fotovoltaico",
    excerpt: "Passo a passo para calcular a potência ideal do sistema solar para diferentes perfis de consumo.",
    category: "dicas",
    date: "2025-01-28",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&q=80",
    featured: false,
  },
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

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === "all" || a.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const featured = filtered.filter((a) => a.featured);
  const regular = filtered.filter((a) => !a.featured);

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
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1">
                Começar grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
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

          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Destaques</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3 text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {categories.find((c) => c.id === article.category)?.label}
                    </Badge>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(article.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="container mx-auto px-4 pb-20">
        {featured.length > 0 && (
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">
            {activeCategory === "all" ? "Todos os artigos" : categories.find((c) => c.id === activeCategory)?.label}
          </h2>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Nenhum artigo encontrado.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featured.length > 0 ? regular : filtered).map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {categories.find((c) => c.id === article.category)?.label}
                    </Badge>
                    <h3 className="text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(article.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-hero rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
            Quer crescer no mercado solar?
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Teste o Solarize por 14 dias grátis e veja como organizar sua operação.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 gap-2">
              Criar minha conta grátis <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-primary-foreground" style={{ backgroundColor: 'hsl(28, 100%, 50%)' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <img src={logoSolarizeBranca} alt="Solarize" className="h-7 w-auto object-contain" />
            <p className="text-primary-foreground/70 text-sm">
              © {new Date().getFullYear()} Solarize. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link to="/" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Início</Link>
              <Link to="/blog" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Blog</Link>
              <Link to="/auth" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Entrar</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
