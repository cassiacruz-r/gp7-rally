ALTER TABLE public.blocos_pauta ADD COLUMN IF NOT EXISTS midias jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.blocos_pauta
SET midias = jsonb_build_array(jsonb_build_object('url', midia_url, 'tipo', COALESCE(midia_tipo, 'arquivo')))
WHERE midia_url IS NOT NULL AND midia_url <> '' AND midias = '[]'::jsonb;