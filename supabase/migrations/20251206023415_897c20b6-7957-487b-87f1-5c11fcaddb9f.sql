-- Site Content Tables for full CMS capability

-- Testimonials table
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,
  client_location text,
  client_photo_url text,
  message text NOT NULL,
  rating integer DEFAULT 5,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated can manage testimonials" ON public.testimonials
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Site Settings table (key-value pairs for site configuration)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Authenticated can manage site settings" ON public.site_settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
('hero_title', 'Economize até 95% na sua conta de luz', 'text'),
('hero_subtitle', 'Transforme a luz do sol em economia real com energia solar fotovoltaica.', 'text'),
('simulator_title', 'Simule sua Economia', 'text'),
('simulator_subtitle', 'Descubra quanto você pode economizar com energia solar', 'text'),
('how_it_works_title', 'Como Funciona', 'text'),
('how_it_works_subtitle', 'Um processo simples e transparente do início ao fim', 'text'),
('testimonials_title', 'O Que Nossos Clientes Dizem', 'text'),
('testimonials_subtitle', 'Histórias reais de economia e satisfação', 'text'),
('contact_phone', '(88) 99847-1511', 'text'),
('contact_email', 'contato@nnenergiasolar.com.br', 'text'),
('contact_address', 'Russas, CE', 'text'),
('whatsapp_number', '5588998471511', 'text');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();