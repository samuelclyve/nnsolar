import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building2, Save, Globe, Instagram, Phone, Mail, MapPin, Image, User, Shield } from "lucide-react";

export default function CompanyProfile() {
  const { workspace, workspaceId, refetch } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userRoleLabel, setUserRoleLabel] = useState("Administrador");
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    description: "",
    instagram: "",
    logo_url: "",
  });

  useEffect(() => {
    if (workspace) {
      setForm({
        name: workspace.name || "",
        cnpj: workspace.cnpj || "",
        email: workspace.email || "",
        phone: workspace.phone || "",
        whatsapp: workspace.whatsapp || "",
        address: workspace.address || "",
        city: workspace.city || "",
        state: workspace.state || "",
        cep: workspace.cep || "",
        description: workspace.description || "",
        instagram: workspace.instagram || "",
        logo_url: workspace.logo_url || "",
      });
    }
  }, [workspace]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const userId = session.user.id;

    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const roles = rolesRes.data?.map(r => r.role) || [];
    if (roles.includes("super_admin")) setUserRoleLabel("Super Admin");
    else if (roles.includes("admin")) setUserRoleLabel("Administrador");
    else if (roles.includes("manager")) setUserRoleLabel("Gerente");
    else if (roles.includes("comercial")) setUserRoleLabel("Comercial");
    else if (roles.includes("technician")) setUserRoleLabel("Técnico");
    else setUserRoleLabel("Staff");
  };

  const handleSave = async () => {
    if (!workspaceId) {
      toast.error("Workspace não encontrado. Tente recarregar a página.");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { data: updatedWorkspace, error: workspaceError } = await supabase
        .from("workspaces")
        .update({
          name: form.name,
          cnpj: form.cnpj,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          address: form.address,
          city: form.city,
          state: form.state,
          cep: form.cep,
          description: form.description,
          instagram: form.instagram,
          logo_url: form.logo_url,
        } as any)
        .eq("id", workspaceId)
        .select("id")
        .maybeSingle();

      if (workspaceError) {
        toast.error("Erro ao salvar empresa: " + workspaceError.message);
        return;
      }

      if (!updatedWorkspace) {
        toast.error("Sem permissão para salvar esta empresa.");
        return;
      }

      if (profile?.full_name != null) {
        const { data: updatedProfile, error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: profile.full_name })
          .eq("user_id", session.user.id)
          .select("id")
          .maybeSingle();

        if (profileError) {
          toast.error("Erro ao salvar perfil: " + profileError.message);
          return;
        }

        if (!updatedProfile) {
          toast.error("Perfil não encontrado para atualização.");
          return;
        }
      }

      toast.success("Alterações salvas com sucesso!");
      await refetch();
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !workspaceId) return;
    setLogoUploading(true);

    const ext = file.name.split(".").pop();
    const path = `logos/${workspaceId}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erro ao enviar logo"); setLogoUploading(false); return; }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    setForm({ ...form, logo_url: urlData.publicUrl });
    setLogoUploading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setAvatarUploading(true);

    const ext = file.name.split(".").pop();
    const path = `avatars/${profile.user_id}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Erro ao enviar foto"); setAvatarUploading(false); return; }

    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", profile.id);
    setProfile({ ...profile, avatar_url: urlData.publicUrl });
    setAvatarUploading(false);
    toast.success("Foto atualizada!");
  };

  const siteUrl = workspace?.slug ? `${window.location.origin}/s/${workspace.slug}` : null;

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {siteUrl && (
            <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Seu site personalizado</p>
                  <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{siteUrl}</a>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(siteUrl).then(() => toast.success("Link copiado!"))}>
                Copiar link
              </Button>
            </div>
          )}

          {/* User Profile Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Dados do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary-foreground">
                        {profile?.full_name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-xs text-primary cursor-pointer hover:underline">
                      {avatarUploading ? "Enviando..." : "Alterar foto"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={profile?.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <div className="mt-1 flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/50">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{userRoleLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Company Name */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <label className="mt-2 block">
                    <span className="text-xs text-primary cursor-pointer hover:underline">
                      {logoUploading ? "Enviando..." : "Alterar logo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome da Empresa</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>CNPJ</Label>
                    <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="mt-1" />
                  </div>
                </div>
              </div>

              <div>
                <Label>Descrição da empresa</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Conte um pouco sobre sua empresa de energia solar..." className="mt-1" rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contato@empresa.com" className="mt-1" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 3000-0000" className="mt-1" />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="(11) 99999-9999" className="mt-1" />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@minhaempresa" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Endereço</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro" className="mt-1" />
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="SP" className="mt-1" />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} placeholder="00000-000" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button variant="cta" size="lg" className="gap-2" onClick={handleSave} disabled={isLoading}>
              <Save className="w-5 h-5" />
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
