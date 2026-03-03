-- Add email reminder columns to existing dca_plans table
ALTER TABLE public.dca_plans 
ADD COLUMN IF NOT EXISTS email_reminders_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_frequency TEXT DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS last_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Create index for email reminders lookup
CREATE INDEX IF NOT EXISTS idx_dca_plans_reminders ON public.dca_plans(email_reminders_enabled) WHERE email_reminders_enabled = true;
