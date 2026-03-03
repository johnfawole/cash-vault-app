-- Create DCA plans table to track user's created plans
CREATE TABLE IF NOT EXISTS public.dca_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id BIGINT NOT NULL,
  asset_token TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  funded_amount NUMERIC(20, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_dca_plans_user_id ON public.dca_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_plans_plan_id ON public.dca_plans(plan_id);
