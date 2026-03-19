import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sun } from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantCarousel } from "@/components/tenant/TenantCarousel";
import { TenantSimulator } from "@/components/tenant/TenantSimulator";
import { TenantPortfolio } from "@/components/tenant/TenantPortfolio";
import { TenantInstagram } from "@/components/tenant/TenantInstagram";
import { TenantHowItWorks } from "@/components/tenant/TenantHowItWorks";
import { TenantTestimonials } from "@/components/tenant/TenantTestimonials";
import { TenantLeadForm } from "@/components/tenant/TenantLeadForm";
import { TenantFooter } from "@/components/tenant/TenantFooter";

interface SiteData {
  workspace: any;
  settings: Record<string, string>;
  slides: any[];
  testimonials: any[];
  portfolioCases: any[];
  portfolioInstagram: any[];
}

// Convert hex to HSL values string like "28 100% 50%"
function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Generate a lighter version for accent
function hexToHslLighter(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.min(Math.round(l * 100) + 10, 90)}%`;
}

export default function TenantSite() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) fetchSiteData();
  }, [slug]);

  const fetchSiteData = async () => {
    const { data: ws, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !ws) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const [settingsRes, slidesRes, testimonialsRes, casesRes, instaRes] = await Promise.all([
      supabase.from("site_settings").select("setting_key, setting_value").eq("workspace_id", ws.id),
      supabase.from("hero_slides").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
      supabase.from("testimonials").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
      supabase.from("portfolio_images").select("*").eq("workspace_id", ws.id).eq("is_active", true).eq("category", "case").order("sort_order"),
      supabase.from("portfolio_images").select("*").eq("workspace_id", ws.id).eq("is_active", true).eq("category", "instagram").order("sort_order").limit(4),
    ]);

    const settingsMap: Record<string, string> = {};
    settingsRes.data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value || ""; });

    setData({
      workspace: ws,
      settings: settingsMap,
      slides: slidesRes.data || [],
      testimonials: testimonialsRes.data || [],
      portfolioCases: casesRes.data || [],
      portfolioInstagram: instaRes.data || [],
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Sun className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Site não encontrado</h1>
          <p className="text-muted-foreground">Este endereço não corresponde a nenhuma empresa.</p>
        </div>
      </div>
    );
  }

  const { workspace, settings, slides, testimonials, portfolioCases, portfolioInstagram } = data;

  // Merge contact info: site_settings override workspace fields
  const mergedWorkspace = {
    ...workspace,
    phone: settings.contact_phone || workspace.phone,
    whatsapp: settings.contact_whatsapp || workspace.whatsapp,
    email: settings.contact_email || workspace.email,
    instagram: settings.contact_instagram || workspace.instagram,
    region: settings.contact_region || "",
    logo_url: settings.site_logo_url || workspace.logo_url,
    name: settings.site_company_name || workspace.name,
    description: settings.about_text || workspace.description,
    cnpj: workspace.cnpj,
  };

  // Build custom CSS variables from brand colors
  const brandPrimary = settings.brand_color_primary || "#FF8C00";
  const brandSecondary = settings.brand_color_secondary || "#1B3A5C";

  const customStyles: React.CSSProperties & Record<string, string> = {
    "--primary": hexToHsl(brandPrimary),
    "--primary-foreground": "0 0% 100%",
    "--secondary": hexToHsl(brandSecondary),
    "--secondary-foreground": "0 0% 100%",
    "--accent": hexToHslLighter(brandPrimary),
    "--accent-foreground": "0 0% 100%",
    "--ring": hexToHsl(brandPrimary),
    "--gradient-hero": `linear-gradient(135deg, hsl(${hexToHsl(brandSecondary)}) 0%, hsl(${hexToHslLighter(brandSecondary)}) 100%)`,
    "--shadow-orange-glow": `0 10px 40px -10px hsl(${hexToHsl(brandPrimary)} / 0.4)`,
  } as any;

  return (
    <div className="min-h-screen bg-background" style={customStyles}>
      <TenantHeader workspace={mergedWorkspace} settings={settings} />
      <TenantHero settings={settings} workspace={mergedWorkspace} />
      <TenantCarousel slides={slides} />
      <TenantSimulator />
      <TenantHowItWorks />
      <TenantTestimonials testimonials={testimonials} />
      <TenantLeadForm workspace={mergedWorkspace} />
      <TenantFooter workspace={mergedWorkspace} />
    </div>
  );
}
