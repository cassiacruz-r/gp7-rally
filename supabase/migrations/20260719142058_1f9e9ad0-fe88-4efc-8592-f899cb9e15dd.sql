
-- Trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  foto_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- VENDEDORES
CREATE TABLE public.vendedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  setor TEXT,
  equipe TEXT,
  foto_url TEXT,
  pontuacao NUMERIC NOT NULL DEFAULT 0,
  meta NUMERIC NOT NULL DEFAULT 0,
  resultado NUMERIC NOT NULL DEFAULT 0,
  posicao_podio INT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendedores TO authenticated;
GRANT ALL ON public.vendedores TO service_role;
ALTER TABLE public.vendedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage vendedores" ON public.vendedores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_vendedores_updated BEFORE UPDATE ON public.vendedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KPIS
CREATE TABLE public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  meta NUMERIC NOT NULL DEFAULT 0,
  resultado NUMERIC NOT NULL DEFAULT 0,
  pontuacao NUMERIC NOT NULL DEFAULT 0,
  observacao TEXT,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpis TO authenticated;
GRANT ALL ON public.kpis TO service_role;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage kpis" ON public.kpis FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_kpis_updated BEFORE UPDATE ON public.kpis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- METAS
CREATE TABLE public.metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('diaria','semanal','mensal')),
  titulo TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  realizado NUMERIC NOT NULL DEFAULT 0,
  periodo DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metas TO authenticated;
GRANT ALL ON public.metas TO service_role;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage metas" ON public.metas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_metas_updated BEFORE UPDATE ON public.metas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAUTAS
CREATE TABLE public.pautas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('segunda','terca','quarta','quinta','sexta','sabado')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pautas TO authenticated;
GRANT ALL ON public.pautas TO service_role;
ALTER TABLE public.pautas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage pautas" ON public.pautas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_pautas_updated BEFORE UPDATE ON public.pautas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BLOCOS_PAUTA
CREATE TABLE public.blocos_pauta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pauta_id UUID NOT NULL REFERENCES public.pautas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tempo_minutos INT NOT NULL DEFAULT 5,
  midia_url TEXT,
  midia_tipo TEXT,
  ordem INT NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocos_pauta TO authenticated;
GRANT ALL ON public.blocos_pauta TO service_role;
ALTER TABLE public.blocos_pauta ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage blocos" ON public.blocos_pauta FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_blocos_updated BEFORE UPDATE ON public.blocos_pauta FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- BIBLIOTECA
CREATE TABLE public.biblioteca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  url TEXT NOT NULL,
  tamanho_bytes BIGINT,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.biblioteca TO authenticated;
GRANT ALL ON public.biblioteca TO service_role;
ALTER TABLE public.biblioteca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage biblioteca" ON public.biblioteca FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- HISTORICO
CREATE TABLE public.historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao TEXT NOT NULL,
  entidade TEXT,
  descricao TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico TO authenticated;
GRANT ALL ON public.historico TO service_role;
ALTER TABLE public.historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage historico" ON public.historico FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CONFIGURACOES
CREATE TABLE public.configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes TO authenticated;
GRANT ALL ON public.configuracoes TO service_role;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth manage config" ON public.configuracoes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_config_updated BEFORE UPDATE ON public.configuracoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default configurações
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('app_nome', '"GP7 - ADRIANO"'::jsonb),
  ('app_subtitulo', '"CRM de Reuniões"'::jsonb),
  ('logo_url', '""'::jsonb),
  ('reconhecimento_do_dia', '{"nome":"","mensagem":"","foto_url":""}'::jsonb);

-- Seed pautas para cada dia
INSERT INTO public.pautas (dia_semana, titulo, descricao) VALUES
  ('segunda','Segunda-feira','Pauta da reunião de segunda'),
  ('terca','Terça-feira','Pauta da reunião de terça'),
  ('quarta','Quarta-feira','Pauta da reunião de quarta'),
  ('quinta','Quinta-feira','Pauta da reunião de quinta'),
  ('sexta','Sexta-feira','Pauta da reunião de sexta'),
  ('sabado','Sábado','Pauta da reunião de sábado');
