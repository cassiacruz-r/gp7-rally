CREATE TABLE public.reunioes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  data date not null default current_date,
  hora time not null default '08:00',
  pauta_id uuid references public.pautas(id) on delete set null,
  status text not null default 'agendada',
  duracao_minutos integer not null default 0,
  responsavel text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reunioes TO authenticated;
GRANT ALL ON public.reunioes TO service_role;
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage reunioes" ON public.reunioes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.reuniao_presencas (
  id uuid primary key default gen_random_uuid(),
  reuniao_id uuid not null references public.reunioes(id) on delete cascade,
  vendedor_id uuid not null references public.vendedores(id) on delete cascade,
  presente boolean not null default false,
  created_at timestamptz not null default now(),
  unique (reuniao_id, vendedor_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reuniao_presencas TO authenticated;
GRANT ALL ON public.reuniao_presencas TO service_role;
ALTER TABLE public.reuniao_presencas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated manage presencas" ON public.reuniao_presencas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_reunioes_updated_at BEFORE UPDATE ON public.reunioes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();