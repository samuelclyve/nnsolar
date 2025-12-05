import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner1 from "@/assets/hero-banner-1.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

const slides: Slide[] = [
  {
    id: "1",
    title: "Financiamento Facilitado",
    subtitle: "Parcelas que cabem no seu bolso, sem entrada. Comece a economizar desde o primeiro mês!",
    image: heroBanner1,
    buttonText: "Simular Financiamento",
    buttonLink: "#contato",
  },
  {
    id: "2",
    title: "Instalação Profissional",
    subtitle: "Equipe certificada com mais de 500 projetos instalados. Qualidade e segurança garantidas.",
    image: heroBanner2,
    buttonText: "Agendar Visita",
    buttonLink: "#contato",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative h-[500px] md:h-[600px]"
          style={{
            backgroundImage: `url(${slides[currentIndex].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

          {/* Content */}
          <div className="container relative z-10 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl"
            >
              <span className="inline-block bg-secondary/90 text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Promoção Especial
              </span>

              <h2 className="text-3xl md:text-5xl font-display font-bold text-card mb-4">
                {slides[currentIndex].title}
              </h2>

              <p className="text-card/80 text-lg mb-8">
                {slides[currentIndex].subtitle}
              </p>

              <Button
                variant="hero"
                size="lg"
                onClick={() => {
                  document.querySelector(slides[currentIndex].buttonLink)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {slides[currentIndex].buttonText}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={prevSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-md border border-card/30 flex items-center justify-center hover:bg-card/30 transition-colors text-card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-secondary"
                  : "w-2 bg-card/50 hover:bg-card/70"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-md border border-card/30 flex items-center justify-center hover:bg-card/30 transition-colors text-card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
