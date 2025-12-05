import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Phone, MapPin, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export function LeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cidade: "",
    aceite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aceite) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simula envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Solicitação enviada!",
      description: "Nossa equipe entrará em contato em até 24 horas.",
    });
    
    setFormData({ nome: "", telefone: "", cidade: "", aceite: false });
    setIsSubmitting(false);
  };

  return (
    <section id="contato" className="py-20 md:py-32 bg-gradient-to-br from-primary via-solar-blue-light to-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-solar-orange/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-card/10 backdrop-blur-sm text-card px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              Fale Conosco
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-card mb-6">
              Pronto para começar a{" "}
              <span className="text-secondary">economizar?</span>
            </h2>
            <p className="text-card/80 text-lg mb-8">
              Preencha o formulário e nossa equipe entrará em contato para 
              uma análise personalizada do seu consumo e uma proposta sob medida.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-card/90">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>Orçamento 100% gratuito e sem compromisso</span>
              </div>
              <div className="flex items-center gap-3 text-card/90">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>Visita técnica agendada em até 48h</span>
              </div>
              <div className="flex items-center gap-3 text-card/90">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
                <span>Condições especiais de pagamento</span>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-foreground mb-6">
                Solicite seu orçamento gratuito
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="nome"
                      placeholder="Seu nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-sm font-medium">
                    WhatsApp
                  </Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cidade" className="text-sm font-medium">
                    Cidade
                  </Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="cidade"
                      placeholder="Sua cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="aceite"
                    checked={formData.aceite}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, aceite: checked as boolean })
                    }
                  />
                  <Label htmlFor="aceite" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Concordo em receber contato da NN Energia Solar e aceito 
                    a política de privacidade conforme a LGPD.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  variant="cta" 
                  size="xl" 
                  className="w-full mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Quero meu orçamento gratuito
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
