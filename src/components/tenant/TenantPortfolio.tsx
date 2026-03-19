import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";

import placeholderPortfolio1 from "@/assets/placeholder-portfolio-1.jpg";
import placeholderPortfolio2 from "@/assets/placeholder-portfolio-2.jpg";
import placeholderPortfolio3 from "@/assets/placeholder-portfolio-3.jpg";
import placeholderPortfolio4 from "@/assets/placeholder-portfolio-4.jpg";
import placeholderPortfolio5 from "@/assets/placeholder-portfolio-5.jpg";
import placeholderPortfolio6 from "@/assets/placeholder-portfolio-6.jpg";

const PLACEHOLDER_PORTFOLIO: PortfolioImage[] = [
  { id: "p1", image_url: placeholderPortfolio1, title: "Residência Solar — 8.5 kWp", description: null },
  { id: "p2", image_url: placeholderPortfolio2, title: "Instalação Comercial — 15 kWp", description: null },
  { id: "p3", image_url: placeholderPortfolio3, title: "Usina Rural — 75 kWp", description: null },
  { id: "p4", image_url: placeholderPortfolio4, title: "Detalhe dos Painéis", description: null },
  { id: "p5", image_url: placeholderPortfolio5, title: "Equipe em Ação", description: null },
  { id: "p6", image_url: placeholderPortfolio6, title: "Casa Sustentável", description: null },
];

interface PortfolioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
}

interface TenantPortfolioProps {
  images: PortfolioImage[];
}

export function TenantPortfolio({ images }: TenantPortfolioProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const displayImages = images.length > 0 ? images : PLACEHOLDER_PORTFOLIO;

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const goNext = () => setSelectedIndex((prev) => prev !== null ? (prev + 1) % displayImages.length : null);
  const goPrev = () => setSelectedIndex((prev) => prev !== null ? (prev - 1 + displayImages.length) % displayImages.length : null);

  return (
    <section className="py-16 md:py-24 bg-muted/30" id="portfolio">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Camera className="w-4 h-4" />
            Nossos Projetos
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Instalações e Cases de Sucesso
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Confira alguns dos nossos projetos realizados com excelência e qualidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              onClick={() => openLightbox(index)}
            >
              <img
                src={img.image_url}
                alt={img.title || "Projeto"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                {img.title && (
                  <span className="text-card text-sm font-semibold line-clamp-2">{img.title}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-card/80 hover:text-card p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 text-card/80 hover:text-card p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-4 text-card/80 hover:text-card p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-4xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedIndex].image_url}
                alt={images[selectedIndex].title || "Projeto"}
                className="w-full h-full object-contain rounded-lg"
              />
              {(images[selectedIndex].title || images[selectedIndex].description) && (
                <div className="mt-4 text-center">
                  {images[selectedIndex].title && (
                    <h3 className="text-card text-lg font-bold">{images[selectedIndex].title}</h3>
                  )}
                  {images[selectedIndex].description && (
                    <p className="text-card/70 text-sm mt-1">{images[selectedIndex].description}</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
