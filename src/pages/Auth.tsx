import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoFundoBranco from "@/assets/logo-fundo-branco.png";
import iconeNn from "@/assets/icone-nn.png";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro no login",
            description: "Email ou senha incorretos. Verifique suas credenciais.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-block mb-8">
            <img src={logoFundoBranco} alt="NN Energia Solar" className="h-10" />
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground mb-8">
            Acesse o sistema interno da NN Energia Solar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 rounded-xl"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="cta"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : "Entrar"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar para o site
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 text-center text-primary-foreground"
        >
          <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <img src={iconeNn} alt="NN" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">
            Sistema Interno
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Gerencie leads, instalações e acompanhe o progresso de todos os projetos.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-12">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-primary-foreground/70">Projetos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-primary-foreground/70">Economia</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">25</div>
              <div className="text-sm text-primary-foreground/70">Anos Garantia</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
