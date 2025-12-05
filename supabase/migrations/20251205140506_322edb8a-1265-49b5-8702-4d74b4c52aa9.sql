-- Create user_roles table for permission system
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'commercial', 'technician', 'client')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create installations table
CREATE TABLE public.installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  address TEXT,
  city TEXT,
  power_kwp NUMERIC,
  panel_count INTEGER,
  status TEXT DEFAULT 'project' CHECK (status IN ('project', 'approval', 'installation', 'inspection', 'active', 'cancelled')),
  assigned_technician UUID REFERENCES public.profiles(id),
  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create installation_stages table for timeline
CREATE TABLE public.installation_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create installation_documents table
CREATE TABLE public.installation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('contract', 'art', 'project', 'invoice', 'photo', 'other')),
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create client_installments table (parcelas)
CREATE TABLE public.client_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_proof_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_installments ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Installations policies
CREATE POLICY "Authenticated users can view installations" ON public.installations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can manage installations" ON public.installations
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Technicians can update assigned installations" ON public.installations
  FOR UPDATE TO authenticated
  USING (assigned_technician IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Installation stages policies
CREATE POLICY "Authenticated can view stages" ON public.installation_stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage stages" ON public.installation_stages
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'technician'));

-- Documents policies
CREATE POLICY "Authenticated can view documents" ON public.installation_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage documents" ON public.installation_documents
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'technician'));

-- Installments policies
CREATE POLICY "Authenticated can view installments" ON public.client_installments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage installments" ON public.client_installments
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Create trigger for installations updated_at
CREATE TRIGGER update_installations_updated_at
  BEFORE UPDATE ON public.installations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can view documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');