import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "biblioteca";

export function isStoragePath(url?: string | null) {
  return !!url && !/^https?:\/\//i.test(url);
}

export function detectTipo(file: File): "imagem" | "video" | "pdf" | "arquivo" {
  if (file.type.startsWith("image/")) return "imagem";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "arquivo";
}

export async function resolveMidiaUrl(url?: string | null) {
  if (!url) return null;
  if (!isStoragePath(url)) return url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(url, 3600);
  return data?.signedUrl ?? null;
}

/** Resolve uma mídia (URL pública ou arquivo no storage) para exibição. */
export function useMidiaUrl(url?: string | null) {
  const { data } = useQuery({
    queryKey: ["midia-url", url],
    enabled: !!url,
    staleTime: 1000 * 60 * 30,
    queryFn: () => resolveMidiaUrl(url),
  });
  return url && !isStoragePath(url) ? url : (data ?? null);
}

export type MidiaItem = { url: string; tipo: string; legenda?: string | null };

/** Lê a galeria de mídias de um bloco, com fallback para o campo antigo único. */
export function parseMidias(bloco: {
  midias?: unknown;
  midia_url?: string | null;
  midia_tipo?: string | null;
}): MidiaItem[] {
  const raw = bloco?.midias;
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? safeJson(raw) : [];
  const items = list
    .filter((m: any) => m && typeof m.url === "string" && m.url)
    .map((m: any) => ({ url: m.url as string, tipo: (m.tipo as string) || "arquivo", legenda: m.legenda ?? null }));
  if (items.length) return items;
  if (bloco?.midia_url) return [{ url: bloco.midia_url, tipo: bloco.midia_tipo || "arquivo", legenda: null }];
  return [];
}

function safeJson(s: string): any[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
