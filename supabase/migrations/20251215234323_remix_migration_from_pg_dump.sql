CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;


--
-- Name: has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: client_installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_installments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    installation_id uuid NOT NULL,
    installment_number integer NOT NULL,
    amount numeric NOT NULL,
    due_date date NOT NULL,
    paid_date date,
    status text DEFAULT 'pending'::text,
    payment_proof_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT client_installments_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text])))
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    cpf text,
    address text,
    city text,
    avatar_url text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hero_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_slides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    button_text text,
    button_link text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: installation_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installation_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    installation_id uuid NOT NULL,
    document_name text NOT NULL,
    document_type text,
    file_url text NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT installation_documents_document_type_check CHECK ((document_type = ANY (ARRAY['contract'::text, 'art'::text, 'project'::text, 'invoice'::text, 'photo'::text, 'other'::text])))
);


--
-- Name: installation_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installation_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    installation_id uuid NOT NULL,
    stage_name text NOT NULL,
    stage_order integer NOT NULL,
    status text DEFAULT 'pending'::text,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT installation_stages_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])))
);


--
-- Name: installations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid,
    client_name text NOT NULL,
    client_phone text,
    client_email text,
    address text,
    city text,
    power_kwp numeric,
    panel_count integer,
    status text DEFAULT 'project'::text,
    assigned_technician uuid,
    estimated_start date,
    estimated_end date,
    actual_start date,
    actual_end date,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    client_user_id uuid,
    CONSTRAINT installations_status_check CHECK ((status = ANY (ARRAY['project'::text, 'approval'::text, 'installation'::text, 'inspection'::text, 'active'::text, 'cancelled'::text])))
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    city text,
    email text,
    monthly_consumption numeric,
    status text DEFAULT 'new'::text,
    notes text,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leads_status_check CHECK ((status = ANY (ARRAY['new'::text, 'contacted'::text, 'visit_scheduled'::text, 'proposal_sent'::text, 'negotiation'::text, 'closed'::text, 'lost'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    phone text,
    city text,
    avatar_url text,
    role text DEFAULT 'client'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'commercial'::text, 'technician'::text, 'client'::text])))
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key text NOT NULL,
    setting_value text,
    setting_type text DEFAULT 'text'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_name text NOT NULL,
    client_location text,
    client_photo_url text,
    message text NOT NULL,
    rating integer DEFAULT 5,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_roles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'manager'::text, 'commercial'::text, 'technician'::text, 'client'::text])))
);


--
-- Name: client_installments client_installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_installments
    ADD CONSTRAINT client_installments_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_key UNIQUE (user_id);


--
-- Name: hero_slides hero_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_slides
    ADD CONSTRAINT hero_slides_pkey PRIMARY KEY (id);


--
-- Name: installation_documents installation_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_documents
    ADD CONSTRAINT installation_documents_pkey PRIMARY KEY (id);


--
-- Name: installation_stages installation_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_stages
    ADD CONSTRAINT installation_stages_pkey PRIMARY KEY (id);


--
-- Name: installations installations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_installations_client_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_installations_client_user_id ON public.installations USING btree (client_user_id);


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: installations update_installations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_installations_updated_at BEFORE UPDATE ON public.installations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_settings update_site_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_installments client_installments_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_installments
    ADD CONSTRAINT client_installments_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.installations(id) ON DELETE CASCADE;


--
-- Name: installation_documents installation_documents_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_documents
    ADD CONSTRAINT installation_documents_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.installations(id) ON DELETE CASCADE;


--
-- Name: installation_documents installation_documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_documents
    ADD CONSTRAINT installation_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);


--
-- Name: installation_stages installation_stages_installation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installation_stages
    ADD CONSTRAINT installation_stages_installation_id_fkey FOREIGN KEY (installation_id) REFERENCES public.installations(id) ON DELETE CASCADE;


--
-- Name: installations installations_assigned_technician_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_assigned_technician_fkey FOREIGN KEY (assigned_technician) REFERENCES public.profiles(id);


--
-- Name: installations installations_client_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_client_user_id_fkey FOREIGN KEY (client_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: installations installations_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installations
    ADD CONSTRAINT installations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: installations Admins and managers can manage installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and managers can manage installations" ON public.installations TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text)));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::text));


--
-- Name: client_installments Admins can manage installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage installments" ON public.client_installments TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text)));


--
-- Name: hero_slides Anyone can view active hero slides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active hero slides" ON public.hero_slides FOR SELECT USING ((is_active = true));


--
-- Name: testimonials Anyone can view active testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING ((is_active = true));


--
-- Name: site_settings Anyone can view site settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: hero_slides Authenticated can manage hero slides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can manage hero slides" ON public.hero_slides TO authenticated USING (true) WITH CHECK (true);


--
-- Name: site_settings Authenticated can manage site settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can manage site settings" ON public.site_settings TO authenticated USING (true) WITH CHECK (true);


--
-- Name: testimonials Authenticated can manage testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can manage testimonials" ON public.testimonials TO authenticated USING (true) WITH CHECK (true);


--
-- Name: leads Authenticated users can insert leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: leads Authenticated users can update leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);


--
-- Name: leads Authenticated users can view leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);


--
-- Name: clients Clients can update own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can update own data" ON public.clients FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: clients Clients can view own data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view own data" ON public.clients FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: installations Clients can view their own installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view their own installations" ON public.installations FOR SELECT USING (((client_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'technician'::text) OR public.has_role(auth.uid(), 'comercial'::text)));


--
-- Name: leads Public can insert leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);


--
-- Name: clients Staff can manage clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage clients" ON public.clients USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'comercial'::text)));


--
-- Name: installation_documents Staff can manage documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage documents" ON public.installation_documents TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'technician'::text)));


--
-- Name: installation_stages Staff can manage stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage stages" ON public.installation_stages TO authenticated USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'technician'::text)));


--
-- Name: clients Staff can view all clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can view all clients" ON public.clients FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'comercial'::text) OR public.has_role(auth.uid(), 'technician'::text)));


--
-- Name: installations Technicians can update assigned installations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Technicians can update assigned installations" ON public.installations FOR UPDATE TO authenticated USING ((assigned_technician IN ( SELECT profiles.id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: installation_documents Users can view documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view documents" ON public.installation_documents FOR SELECT USING (((installation_id IN ( SELECT installations.id
   FROM public.installations
  WHERE (installations.client_user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'technician'::text)));


--
-- Name: client_installments Users can view installments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view installments" ON public.client_installments FOR SELECT USING (((installation_id IN ( SELECT installations.id
   FROM public.installations
  WHERE (installations.client_user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text)));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: installation_stages Users can view stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view stages" ON public.installation_stages FOR SELECT USING (((installation_id IN ( SELECT installations.id
   FROM public.installations
  WHERE (installations.client_user_id = auth.uid()))) OR public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'manager'::text) OR public.has_role(auth.uid(), 'technician'::text)));


--
-- Name: client_installments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_installments ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: hero_slides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

--
-- Name: installation_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.installation_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: installation_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.installation_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: installations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


