import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sun, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  button_link: string | null;
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    title: "Economize até 95% na conta de luz",
    subtitle: "Sistema fotovoltaico completo com garantia de 25 anos",
    image_url: "",
    button_text: "Simular Economia",
    button_link: "#simulador",
  },
  {
    id: "2",
    title: "Financiamento Facilitado",
    subtitle: "Parcelas que cabem no seu bolso, sem entrada",
    image_url: "",
    button_text: "Saiba Mais",
    button_link: "#contato",
  },
  {
    id: "3",
    title: "Instalação Profissional",
    subtitle: "Equipe certificada e experiente na região",
    image_url: "",
    button_text: "Agendar Visita",
    button_link: "#contato",
  },
];

const slideIcons = [Sun, Zap, Shield];

export function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (data && data.length > 0) {
        setSlides(data);
      }
    };

    fetchSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const IconComponent = slideIcons[currentIndex % slideIcons.length];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-muted/50 to-background">
      <div className="container py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4"
                >
                  <IconComponent className="w-5 h-5 text-secondary" />
                  <span className="text-secondary text-sm font-medium">Promoção Especial</span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4"
                >
                  {slides[currentIndex].title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto md:mx-0"
                >
                  {slides[currentIndex].subtitle}
                </motion.p>

                {slides[currentIndex].button_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="cta"
                      size="lg"
                      onClick={() => {
                        if (slides[currentIndex].button_link) {
                          const element = document.querySelector(slides[currentIndex].button_link!);
                          element?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      {slides[currentIndex].button_text}
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Visual */}
              <div className="flex-1 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl overflow-hidden flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
                  <div className="relative z-10 text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-secondary to-solar-orange rounded-2xl flex items-center justify-center shadow-orange-glow">
                      <IconComponent className="w-12 h-12 text-secondary-foreground" />
                    </div>
                    <div className="text-4xl font-bold text-foreground">95%</div>
                    <div className="text-muted-foreground">de economia</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-secondary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
}
