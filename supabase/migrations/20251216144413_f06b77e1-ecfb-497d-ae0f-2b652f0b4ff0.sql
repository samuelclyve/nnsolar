-- Create documents table for general document management
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT NOT NULL DEFAULT 'outros',
  description TEXT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  installation_id UUID REFERENCES public.installations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Staff can view all documents"
ON public.documents
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial') OR 
  has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can manage documents"
ON public.documents
FOR ALL
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial') OR 
  has_role(auth.uid(), 'technician')
);

-- Create trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_name ON public.documents USING gin(to_tsvector('portuguese', name));
CREATE INDEX idx_documents_tags ON public.documents USING gin(tags);