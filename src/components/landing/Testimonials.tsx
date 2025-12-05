import { motion } from "framer-motion";
import { Star, Quote, MapPin } from "lucide-react";

const testimonials = [
  {
    name: "Diana Darc",
    location: "Russas-CE",
    text: "Excelente trabalho! O sistema foi instalado em menos de uma semana e minha conta de luz reduziu 93%. Recomendo a todos!",
    rating: 5,
    economia: "R$ 13.439/ano",
    potencia: "10,37 kWp",
  },
  {
    name: "Carlos Eduardo",
    location: "Limoeiro do Norte-CE",
    text: "Profissionais competentes e atenciosos. Todo o processo foi transparente e o suporte pós-venda é impecável.",
    rating: 5,
    economia: "R$ 8.200/ano",
    potencia: "6,12 kWp",
  },
  {
    name: "Maria Santos",
    location: "Mossoró-RN",
    text: "Melhor investimento que fiz! Em 4 anos já recuperei todo o valor investido. Minha conta de luz não passa de R$ 50.",
    rating: 5,
    economia: "R$ 15.600/ano",
    potencia: "12,24 kWp",
  },
];

export function Testimonials() {
  return (
    <section id="depoimentos" className="py-20 md:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-success/10 text-success px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            O que nossos clientes{" "}
            <span className="text-secondary">dizem</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mais de 500 famílias já economizam com energia solar. 
            Veja o que eles têm a dizer sobre nossa parceria.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-lg hover-lift relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-orange-glow">
                <Quote className="w-5 h-5 text-secondary-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <p className="text-success font-bold text-lg">{testimonial.economia}</p>
                  <p className="text-xs text-muted-foreground">Economia anual</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-primary font-bold text-lg">{testimonial.potencia}</p>
                  <p className="text-xs text-muted-foreground">Potência instalada</p>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-solar-blue-light rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
