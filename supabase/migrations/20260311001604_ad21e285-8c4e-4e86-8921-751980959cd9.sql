
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  category text NOT NULL DEFAULT 'mercado',
  image_url text,
  read_time text DEFAULT '5 min',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  author_name text DEFAULT 'Solarize',
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT TO public USING (is_published = true);

-- Super admins can manage all posts
CREATE POLICY "Super admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- Download materials table
CREATE TABLE public.download_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'ebook',
  file_url text,
  cover_image_url text,
  is_published boolean DEFAULT false,
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.download_materials ENABLE ROW LEVEL SECURITY;

-- Anyone can view published materials
CREATE POLICY "Public can view published materials" ON public.download_materials
  FOR SELECT TO public USING (is_published = true);

-- Super admins can manage all materials
CREATE POLICY "Super admins can manage materials" ON public.download_materials
  FOR ALL TO authenticated USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));
