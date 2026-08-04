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
