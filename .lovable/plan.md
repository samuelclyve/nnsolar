

# Solarize -- Transformação em SaaS Multi-Tenant

## Visão Geral

Transformar o sistema atual (single-tenant NN Solar) em uma plataforma SaaS multi-tenant chamada **Solarize**, onde cada assinante (empresa de energia solar) recebe seu próprio workspace com site personalizável + painel administrativo completo.

## Arquitetura Multi-Tenant

```text
┌─────────────────────────────────────────────┐
│              SOLARIZE (SaaS)                │
├─────────────────────────────────────────────┤
│  Marketing Site (solarize.com)              │
│  ├── Landing page do produto                │
│  ├── Preços / Planos                        │
│  └── Cadastro de novo assinante             │
├─────────────────────────────────────────────┤
│  Super Admin Panel                          │
│  ├── Gerenciar todos os workspaces          │
│  ├── Ver assinaturas / pagamentos           │
│  └── Métricas globais                       │
├─────────────────────────────────────────────┤
│  Workspace A (Empresa Solar X)              │
│  ├── Site público personalizável            │
│  ├── Dashboard / CRM / Instalações / etc    │
│  └── Roles: admin, manager, comercial, tech │
├─────────────────────────────────────────────┤
│  Workspace B (Empresa Solar Y)              │
│  ├── Site público personalizável            │
│  └── (mesma estrutura)                      │
└─────────────────────────────────────────────┘
```

## Mudanças no Banco de Dados

### Novas tabelas

1. **`workspaces`** -- Cada assinante é um workspace
   - `id`, `name`, `slug` (URL única), `logo_url`, `owner_id`, `plan` (trial/monthly/annual), `trial_ends_at`, `subscription_status` (trial/active/expired/cancelled), `created_at`

2. **`workspace_members`** -- Vínculo usuário ↔ workspace
   - `id`, `workspace_id`, `user_id`, `role` (admin/manager/comercial/technician), `created_at`

3. **`subscriptions`** -- Controle de pagamentos
   - `id`, `workspace_id`, `plan_type` (monthly/annual), `amount`, `status`, `current_period_start`, `current_period_end`, `created_at`

### Alterações em tabelas existentes

Adicionar `workspace_id` (UUID, NOT NULL) em todas as tabelas de dados:
- `leads`, `installations`, `clients`, `documents`, `installation_documents`, `installation_stages`, `client_installments`, `notification_logs`, `site_settings`, `hero_slides`, `testimonials`

### Nova role: `super_admin`

- Armazenada na tabela `user_roles` existente
- Acesso a painel exclusivo de gestão de todos os workspaces
- Não pertence a nenhum workspace específico

### RLS atualizada

Todas as policies passam a filtrar por `workspace_id`, garantindo isolamento total entre tenants. Função helper:

```sql
CREATE FUNCTION get_user_workspace_id(uuid) RETURNS uuid
-- retorna o workspace_id do membro atual
```

## Mudanças no Frontend

### 1. Novo Site Marketing (rota `/`)
- Landing page do **Solarize** (não mais NN Solar)
- Seções: Hero, Funcionalidades, Preços (R$179,90/mês ou anual -20%), Depoimentos, CTA de cadastro
- Branding próprio Solarize

### 2. Fluxo de Cadastro de Assinante (rota `/signup`)
- Formulário: nome da empresa, email, senha, telefone
- Cria conta → workspace → trial de 14 dias automaticamente
- Redireciona para `/dashboard` após cadastro

### 3. Painel do Assinante (rotas existentes)
- Todas as páginas atuais (Dashboard, CRM, Instalações, etc.) passam a operar dentro do contexto do workspace do usuário logado
- Site Editor configura o site **do workspace** do assinante
- Hook `useWorkspace()` fornece `workspace_id` para todas as queries

### 4. Super Admin Panel (rota `/super-admin`)
- Lista todos os workspaces com status da assinatura
- Métricas: total de assinantes, MRR, churn
- Ações: ativar/desativar workspace, estender trial

### 5. Controle de Acesso à Assinatura
- Middleware que verifica se o workspace está ativo (trial válido ou assinatura paga)
- Tela de bloqueio quando expirado, com botão para pagamento

### 6. Site Público do Assinante (rota `/s/:slug`)
- Renderiza o site personalizável do workspace usando `slug`
- Usa dados de `site_settings`, `hero_slides`, `testimonials` filtrados por `workspace_id`

## Planos e Preços

| Plano | Valor | Descrição |
|-------|-------|-----------|
| Trial | Grátis | 14 dias com acesso completo |
| Mensal | R$ 179,90/mês | Acesso completo |
| Anual | R$ 1.727,04/ano | 20% desconto (R$ 143,92/mês) |

## Fases de Implementação

**Fase 1 -- Base Multi-Tenant**
- Criar tabelas `workspaces`, `workspace_members`, `subscriptions`
- Adicionar `workspace_id` em todas as tabelas existentes
- Atualizar RLS policies
- Criar hook `useWorkspace()`
- Criar role `super_admin`

**Fase 2 -- Novo Site + Signup**
- Criar landing page Solarize (substituir Index atual)
- Criar fluxo de cadastro com criação automática de workspace + trial
- Criar página de login atualizada com branding Solarize

**Fase 3 -- Isolamento de Dados**
- Atualizar todas as páginas do painel para usar `workspace_id` nas queries
- Atualizar Site Editor para salvar/ler por workspace
- Rota `/s/:slug` para sites públicos dos assinantes

**Fase 4 -- Super Admin + Assinaturas**
- Painel Super Admin
- Controle de expiração de trial/assinatura
- Tela de bloqueio + integração de pagamento (Stripe futuro)

## Observações Técnicas

- O sistema atual tem ~12 tabelas que precisam de `workspace_id` -- migration única com ALTER TABLE
- RLS precisa ser reescrita em todas as tabelas para incluir filtro de workspace
- O site público por slug permite que cada empresa tenha sua URL personalizada
- Stripe pode ser integrado depois para automatizar cobranças; inicialmente controle manual pelo super_admin

