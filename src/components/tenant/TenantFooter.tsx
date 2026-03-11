import { Phone, Mail, MapPin, Instagram, MessageCircle, Sun, FileText, Globe } from "lucide-react";

interface TenantFooterProps {
  workspace: any;
}

export function TenantFooter({ workspace }: TenantFooterProps) {
  const ws = workspace;
  const whatsappLink = ws.whatsapp
    ? `https://wa.me/55${ws.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            {ws.logo_url ? (
              <img src={ws.logo_url} alt={ws.name} className="h-12 w-auto object-contain mb-4" />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <Sun className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold">{ws.name}</span>
              </div>
            )}
            <p className="text-secondary-foreground/70 max-w-md mb-6">
              {ws.description || `Transformando a luz do sol em economia real. Somos especialistas em energia solar fotovoltaica, oferecendo soluções completas para residências e empresas.`}
            </p>
            <div className="flex gap-4">
              {ws.instagram && (
                <a
                  href={`https://instagram.com/${ws.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
                >
                  <Instagram className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              {[
                { label: "Início", href: "#home" },
                { label: "Simulador", href: "#simulador" },
                { label: "Como Funciona", href: "#como-funciona" },
                { label: "Depoimentos", href: "#depoimentos" },
                { label: "Contato", href: "#contato" },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-secondary-foreground/70 hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              {ws.phone && (
                <li className="flex items-center gap-3 text-secondary-foreground/70">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href={`tel:${ws.phone}`} className="hover:text-primary transition-colors">{ws.phone}</a>
                </li>
              )}
              {ws.whatsapp && (
                <li className="flex items-center gap-3 text-secondary-foreground/70">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <a href={whatsappLink || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{ws.whatsapp}</a>
                </li>
              )}
              {ws.email && (
                <li className="flex items-center gap-3 text-secondary-foreground/70">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href={`mailto:${ws.email}`} className="hover:text-primary transition-colors">{ws.email}</a>
                </li>
              )}
              {(ws.city || ws.state) && (
                <li className="flex items-start gap-3 text-secondary-foreground/70">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{[ws.city, ws.state].filter(Boolean).join(" - ")}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/60">
          <p>© {new Date().getFullYear()} {ws.name}. Todos os direitos reservados.</p>
          <p>
            Powered by <span className="font-semibold text-primary">Solarize</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
