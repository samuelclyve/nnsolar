import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sun } from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantHero } from "@/components/tenant/TenantHero";
import { TenantCarousel } from "@/components/tenant/TenantCarousel";
import { TenantSimulator } from "@/components/tenant/TenantSimulator";
import { TenantHowItWorks } from "@/components/tenant/TenantHowItWorks";
import { TenantTestimonials } from "@/components/tenant/TenantTestimonials";
import { TenantLeadForm } from "@/components/tenant/TenantLeadForm";
import { TenantFooter } from "@/components/tenant/TenantFooter";

interface SiteData {
  workspace: any;
  settings: Record<string, string>;
  slides: any[];
  testimonials: any[];
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

    const [settingsRes, slidesRes, testimonialsRes] = await Promise.all([
      supabase.from("site_settings").select("setting_key, setting_value").eq("workspace_id", ws.id),
      supabase.from("hero_slides").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
      supabase.from("testimonials").select("*").eq("workspace_id", ws.id).eq("is_active", true).order("sort_order"),
    ]);

    const settingsMap: Record<string, string> = {};
    settingsRes.data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value || ""; });

    setData({
      workspace: ws,
      settings: settingsMap,
      slides: slidesRes.data || [],
      testimonials: testimonialsRes.data || [],
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

  const { workspace, settings, slides, testimonials } = data;

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader workspace={workspace} />
      <TenantHero settings={settings} workspace={workspace} />
      <TenantCarousel slides={slides} />
      <TenantSimulator />
      <TenantHowItWorks />
      <TenantTestimonials testimonials={testimonials} />
      <TenantLeadForm workspace={workspace} />
      <TenantFooter workspace={workspace} />
    </div>
  );
}
