ALTER TABLE public.support_tickets ADD COLUMN category text NOT NULL DEFAULT 'support';

COMMENT ON COLUMN public.support_tickets.category IS 'Ticket category: support, suggestion, bug, etc.';