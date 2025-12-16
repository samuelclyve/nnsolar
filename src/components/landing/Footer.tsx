import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import logoNn from "@/assets/logo-nn-energia-solar.png";

export function Footer() {
  return (
    <footer className="bg-solar-blue-dark text-white">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <img 
              src={logoNn} 
              alt="NN Energia Solar" 
              className="h-12 w-auto object-contain mb-4"
            />
            <p className="text-white/70 max-w-md mb-6">
              Transformando a luz do sol em economia real. Somos especialistas 
              em energia solar fotovoltaica, oferecendo soluções completas para 
              residências e empresas.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/nnenergiasolar_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
              >
                <Instagram className="w-5 h-5 text-primary group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
              >
                <Facebook className="w-5 h-5 text-primary group-hover:text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors group"
              >
                <Linkedin className="w-5 h-5 text-primary group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-white/70 hover:text-primary transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#simulador" className="text-white/70 hover:text-primary transition-colors">
                  Simulador
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-white/70 hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="text-white/70 hover:text-primary transition-colors">
                  Depoimentos
                </a>
              </li>
              <li>
                <a href="#contato" className="text-white/70 hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+5588998471511" className="hover:text-primary transition-colors">
                  (88) 9.9847-1511
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+5588992213026" className="hover:text-primary transition-colors">
                  (88) 9.9221-3026
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:contato@nnenergiasolar.com.br" className="hover:text-primary transition-colors">
                  contato@nnenergiasolar.com.br
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Russas - CE</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>© 2024 NN Energia Solar. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
