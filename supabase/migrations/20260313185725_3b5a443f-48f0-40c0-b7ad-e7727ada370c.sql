-- Drop the incorrect unique constraint on setting_key alone
-- This was preventing multiple workspaces from having the same setting keys
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key;