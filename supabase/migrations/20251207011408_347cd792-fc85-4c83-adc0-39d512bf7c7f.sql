-- Add client_user_id to installations table to link installations to client user accounts
ALTER TABLE public.installations 
ADD COLUMN client_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_installations_client_user_id ON public.installations(client_user_id);

-- Update RLS policy for clients to view their own installations
CREATE POLICY "Clients can view their own installations" 
ON public.installations 
FOR SELECT 
USING (
  client_user_id = auth.uid() OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  has_role(auth.uid(), 'technician') OR
  has_role(auth.uid(), 'comercial')
);

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can view installations" ON public.installations;

-- Update client_installments to allow clients to view their own installments via installation
DROP POLICY IF EXISTS "Authenticated can view installments" ON public.client_installments;

CREATE POLICY "Users can view installments" 
ON public.client_installments 
FOR SELECT 
USING (
  installation_id IN (
    SELECT id FROM public.installations WHERE client_user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager')
);

-- Update installation_documents policy for clients
DROP POLICY IF EXISTS "Authenticated can view documents" ON public.installation_documents;

CREATE POLICY "Users can view documents" 
ON public.installation_documents 
FOR SELECT 
USING (
  installation_id IN (
    SELECT id FROM public.installations WHERE client_user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  has_role(auth.uid(), 'technician')
);

-- Update installation_stages policy for clients
DROP POLICY IF EXISTS "Authenticated can view stages" ON public.installation_stages;

CREATE POLICY "Users can view stages" 
ON public.installation_stages 
FOR SELECT 
USING (
  installation_id IN (
    SELECT id FROM public.installations WHERE client_user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR
  has_role(auth.uid(), 'technician')
);