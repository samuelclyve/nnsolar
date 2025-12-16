-- Create notification_logs table for tracking WhatsApp notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installation_id UUID NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  message_content TEXT,
  sent_by UUID REFERENCES public.profiles(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Staff can view notification logs"
ON public.notification_logs
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial') OR 
  has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can create notification logs"
ON public.notification_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'manager') OR 
  has_role(auth.uid(), 'comercial') OR 
  has_role(auth.uid(), 'technician')
);

-- Index for faster lookups
CREATE INDEX idx_notification_logs_installation ON public.notification_logs(installation_id);