-- Create clients table separated from staff profiles
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  address TEXT,
  city TEXT,
  avatar_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Staff can view all clients"
ON public.clients
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial') OR 
  has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can manage clients"
ON public.clients
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial')
);

CREATE POLICY "Clients can view own data"
ON public.clients
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clients can update own data"
ON public.clients
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add hero_background_url to site_settings if not exists
INSERT INTO public.site_settings (setting_key, setting_value, setting_type)
VALUES ('hero_background_url', '', 'image')
ON CONFLICT (setting_key) DO NOTHING;