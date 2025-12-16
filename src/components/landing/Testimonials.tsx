import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  client_name: string;
  client_location: string | null;
  message: string;
  rating: number;
}

const defaultTestimonials = [
  {
    id: "1",
    client_name: "Diana Darc",
    client_location: "Russas-CE",
    message: "Excelente trabalho! O sistema foi instalado em menos de uma semana e minha conta de luz reduziu 93%. Recomendo a todos!",
    rating: 5,
  },
  {
    id: "2",
    client_name: "Carlos Eduardo",
    client_location: "Limoeiro do Norte-CE",
    message: "Profissionais competentes e atenciosos. Todo o processo foi transparente e o suporte pós-venda é impecável.",
    rating: 5,
  },
  {
    id: "3",
    client_name: "Maria Santos",
    client_location: "Mossoró-RN",
    message: "Melhor investimento que fiz! Em 4 anos já recuperei todo o valor investido. Minha conta de luz não passa de R$ 50.",
    rating: 5,
  },
];

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      setTestimonials(data);
    }
  };

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
              key={testimonial.id}
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
                "{testimonial.message}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-solar-blue-light rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.client_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.client_name}</p>
                  {testimonial.client_location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {testimonial.client_location}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
