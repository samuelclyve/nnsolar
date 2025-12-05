-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'manager', 'commercial', 'technician', 'client')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  email TEXT,
  monthly_consumption NUMERIC,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'visit_scheduled', 'proposal_sent', 'negotiation', 'closed', 'lost')),
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hero_slides table for carousel
CREATE TABLE public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies (authenticated users can manage leads)
CREATE POLICY "Authenticated users can view leads" ON public.leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert leads" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads" ON public.leads
  FOR UPDATE TO authenticated USING (true);

-- Public can insert leads (from landing form)
CREATE POLICY "Public can insert leads" ON public.leads
  FOR INSERT TO anon WITH CHECK (true);

-- Hero slides are public read
CREATE POLICY "Anyone can view active hero slides" ON public.hero_slides
  FOR SELECT USING (is_active = true);

-- Only authenticated users can manage hero slides
CREATE POLICY "Authenticated can manage hero slides" ON public.hero_slides
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create trigger for profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hero slides
INSERT INTO public.hero_slides (title, subtitle, image_url, button_text, button_link, sort_order) VALUES
('Economize até 95% na conta de luz', 'Sistema fotovoltaico completo com garantia de 25 anos', '/placeholder.svg', 'Simular Economia', '#simulador', 0),
('Financiamento Facilitado', 'Parcelas que cabem no seu bolso, sem entrada', '/placeholder.svg', 'Saiba Mais', '#contato', 1),
('Instalação Profissional', 'Equipe certificada e experiente na região', '/placeholder.svg', 'Agendar Visita', '#contato', 2);