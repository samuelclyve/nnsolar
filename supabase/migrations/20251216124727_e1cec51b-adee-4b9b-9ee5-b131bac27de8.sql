-- Make storage bucket public for site images
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Insert seed data for hero slides
INSERT INTO public.hero_slides (title, subtitle, image_url, button_text, button_link, is_active, sort_order)
VALUES 
  ('Economize até 95% na sua conta de luz', 'Transforme a luz do sol em economia real para sua casa ou empresa', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=80', 'Simular Economia', '#simulador', true, 0),
  ('Energia Solar para sua Casa', 'Sistema fotovoltaico com garantia de 25 anos e retorno do investimento em até 4 anos', 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1920&q=80', 'Solicitar Orçamento', '#contato', true, 1),
  ('Soluções para Empresas', 'Reduza custos operacionais e valorize seu negócio com energia limpa e renovável', 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=1920&q=80', 'Fale com Especialista', '#contato', true, 2)
ON CONFLICT DO NOTHING;

-- Insert seed data for testimonials
INSERT INTO public.testimonials (client_name, client_location, message, rating, is_active, sort_order)
VALUES 
  ('Carlos Mendes', 'Fortaleza, CE', 'Instalei o sistema há 6 meses e minha conta de luz caiu de R$ 800 para R$ 50. O investimento se paga em menos de 3 anos!', 5, true, 0),
  ('Ana Paula Silva', 'Maracanaú, CE', 'Excelente atendimento do início ao fim. A equipe técnica foi muito profissional e a instalação foi rápida e limpa.', 5, true, 1),
  ('Roberto Oliveira', 'Caucaia, CE', 'Tinha receio de investir em energia solar, mas a NN me passou toda confiança. Hoje recomendo para todos os amigos!', 5, true, 2),
  ('Maria José Santos', 'Eusébio, CE', 'Minha empresa agora economiza mais de R$ 3.000 por mês com energia. Melhor investimento que já fiz!', 5, true, 3)
ON CONFLICT DO NOTHING;

-- Insert site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type)
VALUES 
  ('hero_title', 'Economize até 95% na sua conta de energia', 'text'),
  ('hero_subtitle', 'Transforme a luz do sol em economia real para sua casa ou empresa com a NN Energia Solar', 'text'),
  ('contact_phone', '(85) 99999-9999', 'text'),
  ('contact_email', 'contato@nnenergia.com.br', 'text'),
  ('whatsapp', '5585999999999', 'text'),
  ('address', 'Fortaleza, CE', 'text'),
  ('about_text', 'A NN Energia Solar é líder em soluções de energia fotovoltaica no Ceará, com mais de 500 projetos instalados e uma equipe altamente qualificada.', 'text')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample leads for CRM (using only valid status values: new, contacted)
INSERT INTO public.leads (name, phone, email, city, monthly_consumption, status, notes)
VALUES 
  ('João Pedro Lima', '(85) 98765-4321', 'joao.lima@email.com', 'Fortaleza', 450, 'new', 'Interessado em sistema residencial'),
  ('Empresa ABC Ltda', '(85) 3333-4444', 'contato@empresaabc.com', 'Maracanaú', 2500, 'contacted', 'Empresa de médio porte, alto consumo'),
  ('Maria Clara Souza', '(85) 99876-5432', 'maria.souza@email.com', 'Caucaia', 350, 'new', 'Já possui orçamento da concorrência'),
  ('Restaurante Sabor do Sol', '(85) 3222-1111', 'sabordosol@email.com', 'Fortaleza', 1800, 'contacted', 'Enviado proposta dia 10/12')
ON CONFLICT DO NOTHING;

-- Insert sample installations
INSERT INTO public.installations (client_name, client_phone, client_email, city, address, power_kwp, panel_count, status, notes)
VALUES 
  ('Carlos Mendes', '(85) 99888-7766', 'carlos.mendes@email.com', 'Fortaleza', 'Rua das Flores, 123 - Aldeota', 5.5, 10, 'active', 'Sistema instalado e funcionando perfeitamente'),
  ('Ana Paula Silva', '(85) 98877-6655', 'ana.silva@email.com', 'Maracanaú', 'Av. Principal, 456', 8.25, 15, 'installation', 'Instalação em andamento'),
  ('Roberto Oliveira', '(85) 97766-5544', 'roberto@email.com', 'Caucaia', 'Rua do Comércio, 789', 3.3, 6, 'approval', 'Aguardando aprovação da ENEL')
ON CONFLICT DO NOTHING;

-- Insert sample clients
INSERT INTO public.clients (user_id, full_name, email, phone, city, address)
VALUES 
  (gen_random_uuid(), 'Carlos Mendes', 'carlos.mendes@email.com', '(85) 99888-7766', 'Fortaleza', 'Rua das Flores, 123 - Aldeota'),
  (gen_random_uuid(), 'Ana Paula Silva', 'ana.silva@email.com', '(85) 98877-6655', 'Maracanaú', 'Av. Principal, 456'),
  (gen_random_uuid(), 'Roberto Oliveira', 'roberto@email.com', '(85) 97766-5544', 'Caucaia', 'Rua do Comércio, 789')
ON CONFLICT DO NOTHING;