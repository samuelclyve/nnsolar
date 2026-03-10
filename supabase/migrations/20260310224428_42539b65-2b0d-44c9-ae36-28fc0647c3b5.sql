-- Add company profile fields to workspaces
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS cnpj text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS cep text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS whatsapp text;