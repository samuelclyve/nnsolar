import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Sun, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Default image URLs for new accounts
const DEFAULT_HERO_IMAGE = "https://ypasbgrwkfihwwimoihf.supabase.co/storage/v1/object/public/documents/defaults/default-solar-hero.jpg";
const DEFAULT_BANNERS = [
  { title: "Condições Especiais Para Você", subtitle: "Aproveite nossa oferta exclusiva em energia solar fotovoltaica para sua residência ou empresa.", image_url: "https://ypasbgrwkfihwwimoihf.supabase.co/storage/v1/object/public/documents/defaults/default-banner-1.jpg", button_text: "Solicitar Orçamento", button_link: "#contato" },
  { title: "Economia Para Sua Família", subtitle: "Reduza até 95% da sua conta de luz com energia solar. Investimento que se paga em poucos anos.", image_url: "https://ypasbgrwkfihwwimoihf.supabase.co/storage/v1/object/public/documents/defaults/default-banner-2.jpg", button_text: "Simular Economia", button_link: "#simulador" },
  { title: "Energia Sustentável", subtitle: "Faça parte da revolução energética. Energia limpa, renovável e econômica para o seu futuro.", image_url: "https://ypasbgrwkfihwwimoihf.supabase.co/storage/v1/object/public/documents/defaults/default-banner-3.jpg", button_text: "Saiba Mais", button_link: "#como-funciona" },
];

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    companyName: "",
    email: "",
    password: "",
    phone: "",
    whatsapp: "",
    city: "",
    state: "",
    cnpj: "",
    instagram: "",
    address: "",
    region: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50)
      + "-" + Date.now().toString(36);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.ownerName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      // Create workspace
      const slug = generateSlug(formData.companyName);
      const { data: wsId, error: wsError } = await supabase.rpc("create_workspace_for_user", {
        _user_id: authData.user.id,
        _workspace_name: formData.companyName,
        _workspace_slug: slug,
      });

      if (wsError) throw wsError;

      // Update profile with details
      await supabase
        .from("profiles")
        .update({ phone: formData.phone, full_name: formData.ownerName, city: formData.city })
        .eq("user_id", authData.user.id);

      // Update workspace with all contact data
      await supabase
        .from("workspaces")
        .update({
          cnpj: formData.cnpj,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp || formData.phone,
          instagram: formData.instagram,
          address: formData.address,
        } as any)
        .eq("id", wsId);

      // Create default site settings (hero image + region)
      const defaultSettings = [
        { setting_key: "hero_background_url", setting_value: DEFAULT_HERO_IMAGE, setting_type: "text", workspace_id: wsId },
      ];
      if (formData.region) {
        defaultSettings.push({ setting_key: "contact_region", setting_value: formData.region, setting_type: "text", workspace_id: wsId });
      }
      await supabase.from("site_settings").insert(defaultSettings);

      // Create 3 default banners
      const bannersToInsert = DEFAULT_BANNERS.map((b, i) => ({
        ...b,
        workspace_id: wsId,
        is_active: true,
        sort_order: i,
      }));
      await supabase.from("hero_slides").insert(bannersToInsert);

      toast({
        title: "Conta criada com sucesso!",
        description: "Seu período de teste de 14 dias começou. Verifique seu email para confirmar a conta.",
      });

      const redirect = searchParams.get("redirect") || "/dashboard";
      navigate(redirect);
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => setFormData({ ...formData, [field]: value });

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Left - Brand */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-secondary/20 via-primary/10 to-accent/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl font-display font-bold text-foreground leading-tight mb-12">
              Comece agora.<br />
              <span className="text-primary">14 dias grátis.</span>
            </h1>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Tudo incluso no teste</h3>
                  <p className="text-sm text-muted-foreground">
                    CRM, gestão de instalações, site personalizável, documentos e agenda — acesso completo sem restrições.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Sem cartão de crédito</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece gratuitamente. Escolha um plano apenas quando estiver pronto.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-3xl font-bold text-primary">14</div>
                <div className="text-sm text-muted-foreground">Dias grátis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Leads</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Funcional</div>
              </div>
            </div>
          </motion.div>

          <div className="mt-16 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sun className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Solarize</span>
          </div>
        </div>
      </div>

      {/* Right - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-lg border border-border p-8 md:p-10">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sun className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Solarize</span>
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mb-1">Crie sua conta</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Já tem conta?{" "}
              <Link to="/auth" className="text-primary font-medium hover:underline">Entrar</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Personal */}
              <Input placeholder="Seu nome completo *" value={formData.ownerName} onChange={(e) => update("ownerName", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border px-4" required />

              <Input placeholder="Nome da empresa *" value={formData.companyName} onChange={(e) => update("companyName", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border px-4" required />

              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="CNPJ (opcional)" value={formData.cnpj} onChange={(e) => update("cnpj", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
                <Input placeholder="Instagram" value={formData.instagram} onChange={(e) => update("instagram", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
              </div>

              {/* Contact */}
              <Input type="email" placeholder="Email *" value={formData.email} onChange={(e) => update("email", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border px-4" required />

              <div className="grid grid-cols-2 gap-2">
                <Input type="tel" placeholder="Telefone" value={formData.phone} onChange={(e) => update("phone", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
                <Input type="tel" placeholder="WhatsApp" value={formData.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
              </div>

              {/* Location */}
              <Input placeholder="Endereço" value={formData.address} onChange={(e) => update("address", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border px-4" />

              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Cidade" value={formData.city} onChange={(e) => update("city", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
                <Input placeholder="Estado" value={formData.state} onChange={(e) => update("state", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" maxLength={2} />
                <Input placeholder="Região" value={formData.region} onChange={(e) => update("region", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4" />
              </div>

              {/* Password */}
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Senha (mínimo 6 caracteres) *"
                  value={formData.password} onChange={(e) => update("password", e.target.value)}
                  className="h-11 rounded-xl bg-muted/50 border-border px-4 pr-12" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Ao criar sua conta, você concorda com nossos{" "}
                <span className="text-primary cursor-pointer">Termos de Uso</span> e{" "}
                <span className="text-primary cursor-pointer">Política de Privacidade</span>.
              </p>

              <Button type="submit" variant="cta" size="lg" className="w-full h-12 rounded-xl gap-2 text-base font-semibold" disabled={isLoading}>
                {isLoading ? "Criando conta..." : "Começar teste grátis"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                ← Voltar para o site
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
