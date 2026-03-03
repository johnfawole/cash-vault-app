-- Create DCA plans table to track user's created plans
CREATE TABLE IF NOT EXISTS public.dca_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id BIGINT NOT NULL,
  asset_token TEXT NOT NULL,
  asset_symbol TEXT NOT NULL,
  funded_amount NUMERIC(20, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Enable RLS
ALTER TABLE public.dca_plans ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own plans
CREATE POLICY "Users can view their own DCA plans" 
  ON public.dca_plans FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own plans
CREATE POLICY "Users can insert their own DCA plans" 
  ON public.dca_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own plans
CREATE POLICY "Users can update their own DCA plans" 
  ON public.dca_plans FOR UPDATE 
  USING (auth.uid() = user_id);
