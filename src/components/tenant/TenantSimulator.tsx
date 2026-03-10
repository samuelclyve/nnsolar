import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingDown, PiggyBank, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TenantSimulator() {
  const [consumo, setConsumo] = useState("");
  const [resultado, setResultado] = useState<null | {
    economia: number;
    economiaMensal: number;
    payback: number;
    investimento: number;
  }>(null);

  const calcular = () => {
    const consumoNum = parseFloat(consumo);
    if (!consumoNum || consumoNum <= 0) return;

    const tarifaMedia = 0.75;
    const custoWp = 4.5;
    const geracaoMedia = 130;

    const potenciaNecessaria = consumoNum / geracaoMedia;
    const investimento = potenciaNecessaria * 1000 * custoWp;
    const economiaMensal = consumoNum * tarifaMedia * 0.92;
    const economiaAnual = economiaMensal * 12;
    const payback = investimento / economiaAnual;

    setResultado({
      economia: economiaAnual * 25,
      economiaMensal,
      payback: Math.round(payback * 10) / 10,
      investimento,
    });
  };

  return (
    <section id="simulador" className="py-20 md:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Simulador de Economia
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Descubra quanto você pode{" "}
            <span className="text-secondary">economizar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Informe seu consumo mensal de energia e veja em segundos o retorno
            que um sistema solar pode trazer para você.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-3xl shadow-xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="consumo" className="text-base font-medium mb-2 block">
                    Seu consumo mensal (kWh)
                  </Label>
                  <p className="text-muted-foreground text-sm mb-3">
                    Encontre esse valor na sua conta de luz
                  </p>
                  <div className="relative">
                    <Input
                      id="consumo"
                      type="number"
                      placeholder="Ex: 350"
                      value={consumo}
                      onChange={(e) => setConsumo(e.target.value)}
                      className="h-14 text-lg pl-4 pr-16 rounded-xl border-2 border-border focus:border-secondary"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      kWh
                    </span>
                  </div>
                </div>
                <Button variant="cta" size="xl" className="w-full" onClick={calcular} disabled={!consumo}>
                  <Zap className="w-5 h-5" />
                  Calcular Economia
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  * Simulação estimada. Valores podem variar conforme localização e condições técnicas.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {resultado ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-primary-foreground"
                  >
                    <h3 className="text-lg font-medium mb-6 opacity-90">Sua economia estimada</h3>
                    <div className="space-y-4">
                      <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <PiggyBank className="w-5 h-5 text-secondary" />
                          <span className="text-sm opacity-80">Economia em 25 anos</span>
                        </div>
                        <p className="text-3xl font-bold">
                          R$ {resultado.economia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="w-4 h-4 text-secondary" />
                            <span className="text-xs opacity-80">Economia/mês</span>
                          </div>
                          <p className="text-xl font-bold">
                            R$ {resultado.economiaMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="bg-card/10 backdrop-blur-sm rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-secondary" />
                            <span className="text-xs opacity-80">Payback</span>
                          </div>
                          <p className="text-xl font-bold">{resultado.payback} anos</p>
                        </div>
                      </div>
                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full mt-4"
                        onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
                      >
                        Solicitar Proposta Gratuita
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-muted rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                      <Zap className="w-10 h-10 text-secondary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Calcule sua economia</h3>
                    <p className="text-muted-foreground text-sm">
                      Informe seu consumo mensal ao lado para ver quanto você pode economizar com energia solar.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
