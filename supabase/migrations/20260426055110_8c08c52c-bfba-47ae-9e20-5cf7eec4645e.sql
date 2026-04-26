
create table public.prompts (
  id text primary key,
  project_id text not null,
  text text not null,
  topic text,
  volume text,
  own_visibility numeric default 0,
  top_competitor text,
  top_competitor_visibility numeric default 0,
  visibility_gap numeric default 0,
  opportunity_score numeric default 0,
  hidden_questions jsonb default '[]'::jsonb,
  competitor_breakdown jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prompt_sources (
  id uuid primary key default gen_random_uuid(),
  prompt_id text not null references public.prompts(id) on delete cascade,
  url text not null,
  domain text,
  title text,
  classification text,
  citation_count int default 0,
  retrieval_count int default 0,
  citation_rate numeric default 0,
  own_brand_present boolean default false,
  competitor_brands text[] default '{}',
  gap_score int default 0,
  created_at timestamptz not null default now(),
  unique (prompt_id, url)
);
create index on public.prompt_sources (prompt_id);
create index on public.prompt_sources (gap_score desc);

create table public.prompt_qfos (
  id uuid primary key default gen_random_uuid(),
  prompt_id text not null references public.prompts(id) on delete cascade,
  query_text text not null,
  model_id text,
  chat_id text,
  occurrence_count int default 1,
  created_at timestamptz not null default now()
);
create index on public.prompt_qfos (prompt_id);

create table public.source_scrapes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.prompt_sources(id) on delete cascade unique,
  status text not null default 'pending',
  raw_content text,
  summary text,
  scraped_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index on public.source_scrapes (status);

create table public.competitor_mentions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.prompt_sources(id) on delete cascade,
  prompt_id text not null references public.prompts(id) on delete cascade,
  competitor text not null,
  quote text not null,
  context text,
  created_at timestamptz not null default now()
);
create index on public.competitor_mentions (prompt_id);
create index on public.competitor_mentions (source_id);

create table public.action_openings (
  id uuid primary key default gen_random_uuid(),
  prompt_id text not null references public.prompts(id) on delete cascade,
  source_id uuid references public.prompt_sources(id) on delete cascade,
  competitor text,
  qfo_id uuid references public.prompt_qfos(id) on delete set null,
  action_type text not null,
  title text not null,
  rationale text,
  recommended_engagement text,
  impact_score int default 50,
  risk_level text default 'low',
  status text default 'ready',
  created_at timestamptz not null default now()
);
create index on public.action_openings (prompt_id);

alter table public.prompts enable row level security;
alter table public.prompt_sources enable row level security;
alter table public.prompt_qfos enable row level security;
alter table public.source_scrapes enable row level security;
alter table public.competitor_mentions enable row level security;
alter table public.action_openings enable row level security;

create policy "public read prompts" on public.prompts for select using (true);
create policy "public read prompt_sources" on public.prompt_sources for select using (true);
create policy "public read prompt_qfos" on public.prompt_qfos for select using (true);
create policy "public read source_scrapes" on public.source_scrapes for select using (true);
create policy "public read competitor_mentions" on public.competitor_mentions for select using (true);
create policy "public read action_openings" on public.action_openings for select using (true);
