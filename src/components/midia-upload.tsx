import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Video, FileText, Link as LinkIcon, Loader2 } from "lucide-react";
import { BUCKET, detectTipo, isStoragePath, useMidiaUrl } from "@/lib/midia";

export const MIDIA_ICON = { imagem: ImageIcon, video: Video, pdf: FileText, link: LinkIcon, arquivo: FileText } as const;

export function MidiaUpload({
  url,
  tipo,
  onChange,
}: {
  url: string | null;
  tipo: string | null;
  onChange: (v: { midia_url: string | null; midia_tipo: string | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const preview = useMidiaUrl(url);
  const Icon = (MIDIA_ICON as any)[tipo ?? ""] ?? LinkIcon;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) throw new Error("Arquivo maior que 50MB");
      const path = `pautas/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) throw error;
      onChange({ midia_url: path, midia_tipo: detectTipo(file) });
      toast.success("Mídia anexada");
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function clear() {
    if (url && isStoragePath(url)) await supabase.storage.from(BUCKET).remove([url]);
    onChange({ midia_url: null, midia_tipo: null });
  }

  return (
    <div className="space-y-2">
      <Label>Mídia do bloco (foto, vídeo ou PDF)</Label>

      {!url && (
        <div className="rounded-xl border border-dashed p-4 text-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => upload(e.target.files)}
          />
          <div className="flex items-center justify-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()} className="gap-2">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {busy ? "Enviando..." : "Enviar arquivo"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setLinkMode((v) => !v)} className="gap-2">
              <LinkIcon className="h-4 w-4" /> Usar link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG, MP4, PDF — até 50MB</p>
          {linkMode && (
            <Input
              className="mt-3"
              placeholder="https://..."
              onBlur={(e) => e.target.value && onChange({ midia_url: e.target.value, midia_tipo: "link" })}
            />
          )}
        </div>
      )}

      {url && (
        <div className="rounded-xl border p-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-brand/10 text-brand grid place-items-center">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-sm truncate flex-1">{url.split("/").pop()}</span>
            <Button type="button" variant="ghost" size="icon" onClick={clear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {preview && tipo === "imagem" && <img src={preview} alt="" className="w-full max-h-56 object-contain rounded-lg bg-muted" />}
          {preview && tipo === "video" && <video src={preview} controls className="w-full max-h-56 rounded-lg bg-black" />}
          {preview && tipo === "pdf" && (
            <object data={preview} type="application/pdf" className="w-full h-56 rounded-lg">
              <a href={preview} target="_blank" rel="noreferrer" className="text-brand underline text-sm">Abrir PDF</a>
            </object>
          )}
          {preview && tipo === "link" && (
            <a href={preview} target="_blank" rel="noreferrer" className="text-brand underline text-sm break-all">{preview}</a>
          )}
        </div>
      )}
    </div>
  );
}
