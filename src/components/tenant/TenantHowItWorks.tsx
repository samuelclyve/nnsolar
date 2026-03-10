import { motion } from "framer-motion";
import { ClipboardList, FileCheck, Wrench, Power, ArrowRight } from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "Análise", description: "Avaliamos seu consumo e fazemos uma visita técnica para dimensionar o sistema ideal.", color: "bg-primary" },
  { icon: FileCheck, title: "Projeto", description: "Elaboramos o projeto técnico e cuidamos de toda documentação junto à concessionária.", color: "bg-secondary" },
  { icon: Wrench, title: "Instalação", description: "Nossa equipe qualificada realiza a instalação com total segurança e qualidade.", color: "bg-secondary" },
  { icon: Power, title: "Sistema Ativo", description: "Após vistoria, seu sistema é ativado e você começa a economizar imediatamente.", color: "bg-success" },
];

export function TenantHowItWorks() {
  return (
    <section id="como-funciona" className="py-20 md:py-32 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Do orçamento ao <span className="text-secondary">Sistema Ativo</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cuidamos de todo o processo para você. Em poucas semanas, seu sistema estará funcionando e gerando economia.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-6 shadow-lg hover-lift h-full">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-orange-glow">
                  {index + 1}
                </div>
                <div className={`w-14 h-14 ${step.color} rounded-xl flex items-center justify-center mb-4`}>
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 md:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-primary-foreground">
            <div><p className="text-3xl md:text-4xl font-bold mb-1">25</p><p className="text-sm opacity-80">Anos de Garantia</p></div>
            <div><p className="text-3xl md:text-4xl font-bold mb-1">15</p><p className="text-sm opacity-80">Dias de Instalação</p></div>
            <div><p className="text-3xl md:text-4xl font-bold mb-1">100%</p><p className="text-sm opacity-80">Documentação Inclusa</p></div>
            <div><p className="text-3xl md:text-4xl font-bold mb-1">24h</p><p className="text-sm opacity-80">Suporte Técnico</p></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
