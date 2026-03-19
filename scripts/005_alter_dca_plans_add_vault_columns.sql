-- Alter dca_plans table to add vault-related columns
ALTER TABLE public.dca_plans
ADD COLUMN IF NOT EXISTS vault_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS vault_position_id UUID REFERENCES public.vault_positions(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dca_plans_vault_position_id ON public.dca_plans(vault_position_id);
