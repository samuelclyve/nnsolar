import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, Upload, Search, Filter, Grid, List, 
  Download, Trash2, Eye, FolderOpen, Plus, X,
  File, FileImage, FileSpreadsheet, Archive, User, Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useWorkspace } from "@/hooks/useWorkspace";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  category: string;
  description: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  client_id: string | null;
  installation_id: string | null;
  created_at: string;
  clients?: { full_name: string } | null;
  installations?: { client_name: string } | null;
}

interface Client {
  id: string;
  full_name: string;
}

interface Installation {
  id: string;
  client_name: string;
}

const CATEGORIES = [
  { value: "contrato", label: "Contratos", icon: FileText, color: "bg-blue-500" },
  { value: "nota_fiscal", label: "Notas Fiscais", icon: FileSpreadsheet, color: "bg-green-500" },
  { value: "projeto", label: "Projetos Técnicos", icon: File, color: "bg-purple-500" },
  { value: "foto", label: "Fotos", icon: FileImage, color: "bg-orange-500" },
  { value: "laudo", label: "Laudos", icon: FileText, color: "bg-red-500" },
  { value: "outros", label: "Outros", icon: Archive, color: "bg-muted" },
];

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [installationFilter, setInstallationFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("outros");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploadClientId, setUploadClientId] = useState<string>("none");
  const [uploadInstallationId, setUploadInstallationId] = useState<string>("none");
  const { workspaceId } = useWorkspace();

  // Fetch clients and installations for filters
  useEffect(() => {
    if (!workspaceId) return;
    const fetchClientsAndInstallations = async () => {
      const [clientsRes, installationsRes] = await Promise.all([
        supabase.from("clients").select("id, full_name").eq("workspace_id", workspaceId).order("full_name"),
        supabase.from("installations").select("id, client_name").eq("workspace_id", workspaceId).order("client_name"),
      ]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (installationsRes.data) setInstallations(installationsRes.data);
    };
    fetchClientsAndInstallations();
  }, [workspaceId]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("documents")
        .select(`
          *,
          clients(full_name),
          installations(client_name)
        `)
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (clientFilter !== "all") {
        query = query.eq("client_id", clientFilter);
      }

      if (installationFilter !== "all") {
        query = query.eq("installation_id", installationFilter);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar documentos: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, clientFilter, installationFilter, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Upload file to storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Save document record
      const tags = uploadTags.split(",").map(t => t.trim()).filter(Boolean);
      
      const { error: insertError } = await supabase
        .from("documents")
        .insert({
          name: uploadName || uploadFile.name,
          file_url: publicUrl,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          category: uploadCategory,
          description: uploadDescription || null,
          tags: tags.length > 0 ? tags : null,
          uploaded_by: user.id,
          client_id: uploadClientId !== "none" ? uploadClientId : null,
          installation_id: uploadInstallationId !== "none" ? uploadInstallationId : null,
        });

      if (insertError) throw insertError;

      toast.success("Documento enviado com sucesso!");
      setIsUploadOpen(false);
      resetUploadForm();
      fetchDocuments();
    } catch (error: any) {
      toast.error("Erro ao enviar documento: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) return;

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split("/");
      const filePath = urlParts.slice(-2).join("/");

      // Delete from storage
      await supabase.storage.from("documents").remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Documento excluído!");
      fetchDocuments();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName("");
    setUploadCategory("outros");
    setUploadDescription("");
    setUploadTags("");
    setUploadClientId("none");
    setUploadInstallationId("none");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[5];
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;
    if (fileType.includes("image")) return FileImage;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
    return FileText;
  };

  // Stats
  const stats = CATEGORIES.map(cat => ({
    ...cat,
    count: documents.filter(d => d.category === cat.value).length
  }));

  return (
    <AppLayout title="Documentos">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground">
              Gerencie contratos, notas fiscais e projetos técnicos
            </p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* File Input */}
                <div className="space-y-2">
                  <Label>Arquivo *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {uploadFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate">{uploadFile.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadFile(file);
                              if (!uploadName) setUploadName(file.name.replace(/\.[^/.]+$/, ""));
                            }
                          }}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <FolderOpen className="w-8 h-8" />
                          <span className="text-sm">Clique para selecionar</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Documento</Label>
                  <Input
                    id="name"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Ex: Contrato João Silva"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={uploadCategory} onValueChange={setUploadCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Descrição opcional do documento"
                    rows={2}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    id="tags"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="Ex: urgente, cliente vip, 2024"
                  />
                </div>

                {/* Client Link */}
                <div className="space-y-2">
                  <Label>Vincular a Cliente</Label>
                  <Select value={uploadClientId} onValueChange={setUploadClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum cliente</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Installation Link */}
                <div className="space-y-2">
                  <Label>Vincular a Instalação</Label>
                  <Select value={uploadInstallationId} onValueChange={setUploadInstallationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma instalação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma instalação</SelectItem>
                      {installations.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.client_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full"
                >
                  {uploading ? "Enviando..." : "Enviar Documento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(cat => (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all hover:scale-105 ${
                categoryFilter === cat.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setCategoryFilter(categoryFilter === cat.value ? "all" : cat.value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cat.color}`}>
                  <cat.icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cat.count}</p>
                  <p className="text-xs text-muted-foreground">{cat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[160px]">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={installationFilter} onValueChange={setInstallationFilter}>
                <SelectTrigger className="w-[160px]">
                  <Wrench className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Instalação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Instalações</SelectItem>
                  {installations.map(inst => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece enviando seu primeiro documento"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Button onClick={() => setIsUploadOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Enviar Documento
              </Button>
            )}
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map(doc => {
              const catInfo = getCategoryInfo(doc.category);
              const FileIcon = getFileIcon(doc.file_type);
              return (
                <Card key={doc.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${catInfo.color}`}>
                        <FileIcon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" title={doc.name}>
                          {doc.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="mb-2">
                      {catInfo.label}
                    </Badge>

                    {/* Linked Client/Installation */}
                    {(doc.clients || doc.installations) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {doc.clients && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <User className="w-3 h-3" />
                            {doc.clients.full_name}
                          </Badge>
                        )}
                        {doc.installations && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Wrench className="w-3 h-3" />
                            {doc.installations.client_name}
                          </Badge>
                        )}
                      </div>
                    )}

                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {doc.description}
                      </p>
                    )}

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doc.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mb-3">
                      {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(doc.file_url, "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {documents.map(doc => {
                const catInfo = getCategoryInfo(doc.category);
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${catInfo.color}`}>
                      <FileIcon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <span>{catInfo.label}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {doc.clients && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {doc.clients.full_name}
                            </span>
                          </>
                        )}
                        {doc.installations && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              {doc.installations.client_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="hidden md:flex gap-1">
                        {doc.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(doc.file_url, "_blank")}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = doc.file_url;
                          link.download = doc.name;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}