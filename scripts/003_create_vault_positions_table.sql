-- Create vault_positions table to track user's Aave vault positions
CREATE TABLE IF NOT EXISTS public.vault_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dca_plan_id BIGINT NOT NULL REFERENCES public.dca_plans(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  vault_address TEXT NOT NULL,
  underlying_asset TEXT NOT NULL,
  shares_balance NUMERIC(20, 8) DEFAULT 0,
  principal_deposited NUMERIC(20, 8) NOT NULL,
  yield_earned NUMERIC(20, 8) DEFAULT 0,
  yield_claimed_by_protocol NUMERIC(20, 8) DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  deposited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vault_positions_dca_plan_id ON public.vault_positions(dca_plan_id);
CREATE INDEX IF NOT EXISTS idx_vault_positions_wallet_address ON public.vault_positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_vault_positions_active ON public.vault_positions(withdrawn_at) WHERE withdrawn_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vault_positions_vault_address ON public.vault_positions(vault_address);
