import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Building2, Users, DollarSign, TrendingUp, Clock, 
  CheckCircle2, XCircle, MoreHorizontal, Search, Sun,
  FileText, BookOpen, Plus, Pencil, Trash2, Eye, EyeOff, Star, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  owner_id: string;
}

export default function SuperAdmin() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isSuperAdmin, isLoading: rolesLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Blog state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogDialog, setBlogDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postForm, setPostForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "mercado", image_url: "", read_time: "5 min", is_featured: false, is_published: false });

  // Materials state
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialDialog, setMaterialDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [materialForm, setMaterialForm] = useState({ title: "", description: "", category: "ebook", file_url: "", cover_image_url: "", is_published: false });

  useEffect(() => {
    if (!rolesLoading && !isSuperAdmin()) navigate("/dashboard");
  }, [rolesLoading, isSuperAdmin, navigate]);

  useEffect(() => { fetchWorkspaces(); fetchBlogPosts(); fetchMaterials(); }, []);

  const fetchWorkspaces = async () => {
    const { data } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false });
    if (data) setWorkspaces(data as WorkspaceRow[]);
    setIsLoading(false);
  };

  const fetchBlogPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setBlogPosts(data);
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from("download_materials").select("*").order("created_at", { ascending: false });
    if (data) setMaterials(data);
  };

  const updateWorkspaceStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("workspaces").update({ subscription_status: status }).eq("id", id);
    if (!error) { toast({ title: "Status atualizado" }); fetchWorkspaces(); }
  };

  const extendTrial = async (id: string) => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    const { error } = await supabase.from("workspaces").update({ trial_ends_at: d.toISOString() }).eq("id", id);
    if (!error) { toast({ title: "Trial estendido", description: "+14 dias" }); fetchWorkspaces(); }
  };

  // Blog CRUD
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm({ title: "", slug: "", excerpt: "", content: "", category: "mercado", image_url: "", read_time: "5 min", is_featured: false, is_published: false });
    setBlogDialog(true);
  };
  const openEditPost = (post: any) => {
    setEditingPost(post);
    setPostForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content || "", category: post.category, image_url: post.image_url || "", read_time: post.read_time || "5 min", is_featured: post.is_featured, is_published: post.is_published });
    setBlogDialog(true);
  };
  const savePost = async () => {
    const payload = { ...postForm, published_at: postForm.is_published ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
    if (editingPost) {
      await supabase.from("blog_posts").update(payload).eq("id", editingPost.id);
    } else {
      await supabase.from("blog_posts").insert(payload);
    }
    toast({ title: editingPost ? "Artigo atualizado" : "Artigo criado" });
    setBlogDialog(false);
    fetchBlogPosts();
  };
  const deletePost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Artigo removido" });
    fetchBlogPosts();
  };

  // Materials CRUD
  const openNewMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({ title: "", description: "", category: "ebook", file_url: "", cover_image_url: "", is_published: false });
    setMaterialDialog(true);
  };
  const openEditMaterial = (m: any) => {
    setEditingMaterial(m);
    setMaterialForm({ title: m.title, description: m.description || "", category: m.category, file_url: m.file_url || "", cover_image_url: m.cover_image_url || "", is_published: m.is_published });
    setMaterialDialog(true);
  };
  const saveMaterial = async () => {
    const payload = { ...materialForm, updated_at: new Date().toISOString() };
    if (editingMaterial) {
      await supabase.from("download_materials").update(payload).eq("id", editingMaterial.id);
    } else {
      await supabase.from("download_materials").insert(payload);
    }
    toast({ title: editingMaterial ? "Material atualizado" : "Material criado" });
    setMaterialDialog(false);
    fetchMaterials();
  };
  const deleteMaterial = async (id: string) => {
    await supabase.from("download_materials").delete().eq("id", id);
    toast({ title: "Material removido" });
    fetchMaterials();
  };

  const filtered = workspaces.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.slug.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalActive = workspaces.filter(w => w.subscription_status === "active").length;
  const totalTrial = workspaces.filter(w => w.subscription_status === "trial").length;
  const mrr = totalActive * 179.90;

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = { trial: "bg-accent/20 text-accent-foreground border-accent/30", active: "bg-success/20 text-success border-success/30", expired: "bg-destructive/20 text-destructive border-destructive/30", cancelled: "bg-muted text-muted-foreground border-border" };
    const labels: Record<string, string> = { trial: "Trial", active: "Ativo", expired: "Expirado", cancelled: "Cancelado" };
    return <Badge variant="outline" className={variants[status] || ""}>{labels[status] || status}</Badge>;
  };

  if (rolesLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Sun className="w-5 h-5 text-primary-foreground" /></div>
            <span className="font-display font-bold text-foreground">Solarize</span>
            <Badge variant="outline" className="text-xs">Super Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Ir ao Dashboard</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Painel Super Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Workspaces", value: workspaces.length, icon: Building2 },
            { label: "Ativos", value: totalActive, icon: CheckCircle2 },
            { label: "Em Trial", value: totalTrial, icon: Clock },
            { label: "MRR", value: `R$ ${mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-0 shadow-sm"><CardContent className="p-6">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-3"><stat.icon className="w-5 h-5 text-primary" /></div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workspaces" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workspaces" className="gap-1"><Building2 className="w-4 h-4" /> Workspaces</TabsTrigger>
            <TabsTrigger value="blog" className="gap-1"><BookOpen className="w-4 h-4" /> Blog</TabsTrigger>
            <TabsTrigger value="materials" className="gap-1"><Download className="w-4 h-4" /> Materiais</TabsTrigger>
          </TabsList>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Workspaces</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Empresa</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Slug</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plano</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Criado em</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map(ws => (
                        <tr key={ws.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-4 font-medium text-foreground">{ws.name}</td>
                          <td className="py-3 px-4 text-muted-foreground">{ws.slug}</td>
                          <td className="py-3 px-4">{statusBadge(ws.subscription_status)}</td>
                          <td className="py-3 px-4 text-muted-foreground capitalize">{ws.plan}</td>
                          <td className="py-3 px-4 text-muted-foreground">{new Date(ws.created_at).toLocaleDateString("pt-BR")}</td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateWorkspaceStatus(ws.id, "active")}><CheckCircle2 className="w-4 h-4 mr-2" /> Ativar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => extendTrial(ws.id)}><Clock className="w-4 h-4 mr-2" /> Estender trial (+14d)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateWorkspaceStatus(ws.id, "expired")} className="text-destructive"><XCircle className="w-4 h-4 mr-2" /> Desativar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Nenhum workspace encontrado</td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Artigos do Blog</CardTitle>
                <Button size="sm" onClick={openNewPost} className="gap-1"><Plus className="w-4 h-4" /> Novo Artigo</Button>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhum artigo criado. Clique em "Novo Artigo" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                            {post.is_featured && <Star className="w-4 h-4 text-primary flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            {post.is_published ? <span className="flex items-center gap-1 text-green-600"><Eye className="w-3 h-3" /> Publicado</span> : <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Rascunho</span>}
                            <span>{post.read_time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="icon" onClick={() => openEditPost(post)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blog Dialog */}
            <Dialog open={blogDialog} onOpenChange={setBlogDialog}>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editingPost ? "Editar Artigo" : "Novo Artigo"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Título</Label><Input value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} placeholder="Título do artigo" /></div>
                    <div><Label>Slug (URL)</Label><Input value={postForm.slug} onChange={e => setPostForm(p => ({ ...p, slug: e.target.value }))} placeholder="titulo-do-artigo" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Categoria</Label>
                      <Select value={postForm.category} onValueChange={v => setPostForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mercado">Mercado Solar</SelectItem>
                          <SelectItem value="dicas">Dicas Práticas</SelectItem>
                          <SelectItem value="tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="legislacao">Legislação</SelectItem>
                          <SelectItem value="cases">Cases de Sucesso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Tempo de leitura</Label><Input value={postForm.read_time} onChange={e => setPostForm(p => ({ ...p, read_time: e.target.value }))} placeholder="5 min" /></div>
                  </div>
                  <div><Label>URL da Imagem</Label><Input value={postForm.image_url} onChange={e => setPostForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>
                  <div><Label>Resumo</Label><Textarea value={postForm.excerpt} onChange={e => setPostForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} placeholder="Resumo breve do artigo" /></div>
                  <div><Label>Conteúdo</Label><Textarea value={postForm.content} onChange={e => setPostForm(p => ({ ...p, content: e.target.value }))} rows={8} placeholder="Conteúdo completo do artigo..." /></div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><Switch checked={postForm.is_featured} onCheckedChange={v => setPostForm(p => ({ ...p, is_featured: v }))} /><Label>Destaque</Label></div>
                    <div className="flex items-center gap-2"><Switch checked={postForm.is_published} onCheckedChange={v => setPostForm(p => ({ ...p, is_published: v }))} /><Label>Publicado</Label></div>
                  </div>
                  <Button onClick={savePost} className="w-full">{editingPost ? "Salvar Alterações" : "Criar Artigo"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Download className="w-5 h-5" /> Materiais para Download</CardTitle>
                <Button size="sm" onClick={openNewMaterial} className="gap-1"><Plus className="w-4 h-4" /> Novo Material</Button>
              </CardHeader>
              <CardContent>
                {materials.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Download className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nenhum material criado. Clique em "Novo Material" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate mb-1">{m.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{m.category}</Badge>
                            {m.is_published ? <span className="flex items-center gap-1 text-green-600"><Eye className="w-3 h-3" /> Publicado</span> : <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Rascunho</span>}
                            <span>{m.download_count || 0} downloads</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="icon" onClick={() => openEditMaterial(m)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMaterial(m.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materials Dialog */}
            <Dialog open={materialDialog} onOpenChange={setMaterialDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>{editingMaterial ? "Editar Material" : "Novo Material"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Título</Label><Input value={materialForm.title} onChange={e => setMaterialForm(p => ({ ...p, title: e.target.value }))} placeholder="Nome do material" /></div>
                  <div><Label>Categoria</Label>
                    <Select value={materialForm.category} onValueChange={v => setMaterialForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="guia">Guia Prático</SelectItem>
                        <SelectItem value="planilha">Planilha</SelectItem>
                        <SelectItem value="video">Vídeo-aula</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Descrição</Label><Textarea value={materialForm.description} onChange={e => setMaterialForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Descrição do material" /></div>
                  <div><Label>URL do Arquivo</Label><Input value={materialForm.file_url} onChange={e => setMaterialForm(p => ({ ...p, file_url: e.target.value }))} placeholder="https://link-do-arquivo.pdf" /></div>
                  <div><Label>URL da Capa</Label><Input value={materialForm.cover_image_url} onChange={e => setMaterialForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://imagem-da-capa.jpg" /></div>
                  <div className="flex items-center gap-2"><Switch checked={materialForm.is_published} onCheckedChange={v => setMaterialForm(p => ({ ...p, is_published: v }))} /><Label>Publicado</Label></div>
                  <Button onClick={saveMaterial} className="w-full">{editingMaterial ? "Salvar Alterações" : "Criar Material"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
