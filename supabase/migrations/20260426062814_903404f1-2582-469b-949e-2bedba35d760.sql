CREATE TABLE public.prompt_brand_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id text NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  brand_id text NOT NULL,
  brand_name text NOT NULL,
  is_own boolean NOT NULL DEFAULT false,
  visibility numeric NOT NULL DEFAULT 0,
  share_of_voice numeric NOT NULL DEFAULT 0,
  sentiment numeric,
  position numeric,
  mention_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, brand_id)
);

CREATE INDEX prompt_brand_metrics_prompt_id_idx
  ON public.prompt_brand_metrics (prompt_id);

ALTER TABLE public.prompt_brand_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read prompt_brand_metrics"
  ON public.prompt_brand_metrics FOR SELECT
  USING (true);