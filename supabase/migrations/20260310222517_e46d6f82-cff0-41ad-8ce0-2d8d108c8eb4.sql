-- Create payment_history table for tracking all Cakto transactions
CREATE TABLE public.payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
    cakto_transaction_id text UNIQUE NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'BRL',
    status text NOT NULL,
    payment_method text,
    webhook_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_workspace_id ON public.payment_history(workspace_id);
CREATE INDEX idx_payment_history_transaction_id ON public.payment_history(cakto_transaction_id);

-- RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Workspace members can view their payment history
CREATE POLICY "Members can view workspace payment history"
ON public.payment_history
FOR SELECT
TO authenticated
USING (
    workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
    OR is_super_admin(auth.uid())
);

-- Only service role (edge functions) can insert/update
CREATE POLICY "Super admins can manage payment history"
ON public.payment_history
FOR ALL
TO authenticated
USING (is_super_admin(auth.uid()));