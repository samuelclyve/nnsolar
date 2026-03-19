import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import placeholderInsta1 from "@/assets/placeholder-insta-1.jpg";
import placeholderInsta2 from "@/assets/placeholder-insta-2.jpg";
import placeholderInsta3 from "@/assets/placeholder-insta-3.jpg";
import placeholderInsta4 from "@/assets/placeholder-insta-4.jpg";

const PLACEHOLDER_INSTA: InstagramImage[] = [
  { id: "i1", image_url: placeholderInsta1, title: "Instalação em andamento" },
  { id: "i2", image_url: placeholderInsta2, title: "Cliente satisfeito" },
  { id: "i3", image_url: placeholderInsta3, title: "Energia solar comercial" },
  { id: "i4", image_url: placeholderInsta4, title: "Tecnologia de ponta" },
];

interface InstagramImage {
  id: string;
  image_url: string;
  title: string | null;
}

interface TenantInstagramProps {
  images: InstagramImage[];
  instagramHandle: string | null;
}

export function TenantInstagram({ images, instagramHandle }: TenantInstagramProps) {
  const displayImages = images.length > 0 ? images : PLACEHOLDER_INSTA;

  const cleanHandle = instagramHandle?.replace(/^@/, "").replace(/\s/g, "") || "";
  const profileUrl = cleanHandle ? `https://instagram.com/${cleanHandle}` : null;

  return (
    <section className="py-16 md:py-24 bg-background" id="instagram">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 text-pink-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Instagram className="w-4 h-4" />
            Siga-nos no Instagram
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Acompanhe Nosso Trabalho
          </h2>
          {cleanHandle && (
            <p className="text-muted-foreground">
              Confira nossas últimas publicações em{" "}
              <a
                href={profileUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                @{cleanHandle}
              </a>
            </p>
          )}
        </motion.div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {images.slice(0, 4).map((img, index) => (
              <motion.a
                key={img.id}
                href={profileUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all"
              >
                <img
                  src={img.image_url}
                  alt={img.title || "Instagram post"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-300 flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {profileUrl && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
              onClick={() => window.open(profileUrl, "_blank")}
            >
              <Instagram className="w-5 h-5" />
              Ver Perfil Completo
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
