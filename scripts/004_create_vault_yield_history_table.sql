-- Create vault_yield_history table for yield tracking and analytics
CREATE TABLE IF NOT EXISTS public.vault_yield_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_position_id UUID NOT NULL REFERENCES public.vault_positions(id) ON DELETE CASCADE,
  yield_before NUMERIC(20, 8) DEFAULT 0,
  yield_after NUMERIC(20, 8) NOT NULL,
  protocol_fee_collected NUMERIC(20, 8) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vault_yield_history_position_id ON public.vault_yield_history(vault_position_id);
CREATE INDEX IF NOT EXISTS idx_vault_yield_history_timestamp ON public.vault_yield_history(timestamp DESC);
