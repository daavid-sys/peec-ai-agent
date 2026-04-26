CREATE TABLE public.opening_drafts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_id uuid NOT NULL UNIQUE REFERENCES public.action_openings(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'other',
  brief text,
  full_draft text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  model text,
  generated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_opening_drafts_status ON public.opening_drafts(status);
CREATE INDEX idx_opening_drafts_platform ON public.opening_drafts(platform);

ALTER TABLE public.opening_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read opening_drafts"
ON public.opening_drafts
FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.touch_opening_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER opening_drafts_set_updated_at
BEFORE UPDATE ON public.opening_drafts
FOR EACH ROW
EXECUTE FUNCTION public.touch_opening_drafts_updated_at();
