import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Sun, Building2, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    companyName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    cnpj: "",
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
          data: { full_name: formData.companyName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar conta");

      // Create workspace (also assigns admin role via SECURITY DEFINER function)
      const slug = generateSlug(formData.companyName);
      const { error: wsError } = await supabase.rpc("create_workspace_for_user", {
        _user_id: authData.user.id,
        _workspace_name: formData.companyName,
        _workspace_slug: slug,
      });

      if (wsError) throw wsError;

      // Update profile with phone
      if (formData.phone) {
        await supabase
          .from("profiles")
          .update({ phone: formData.phone, full_name: formData.companyName })
          .eq("user_id", authData.user.id);
      }

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

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Left - Brand / Features */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-secondary/20 via-primary/10 to-accent/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-3xl shadow-lg border border-border p-8 md:p-10">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sun className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Solarize</span>
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
              Crie sua conta
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Já tem conta?{" "}
              <Link to="/auth" className="text-primary font-medium hover:underline">
                Entrar
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Nome da empresa"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="h-12 rounded-xl bg-muted/50 border-border px-4"
                required
              />

              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 rounded-xl bg-muted/50 border-border px-4"
                required
              />

              <Input
                type="tel"
                placeholder="Telefone (opcional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12 rounded-xl bg-muted/50 border-border px-4"
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 rounded-xl bg-muted/50 border-border px-4 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Ao criar sua conta, você concorda com nossos{" "}
                <span className="text-primary cursor-pointer">Termos de Uso</span> e{" "}
                <span className="text-primary cursor-pointer">Política de Privacidade</span>.
              </p>

              <Button
                type="submit"
                variant="cta"
                size="lg"
                className="w-full h-12 rounded-xl gap-2 text-base font-semibold"
                disabled={isLoading}
              >
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
