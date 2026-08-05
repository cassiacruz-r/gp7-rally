import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload, X, Image as ImageIcon, Video, FileText, Link as LinkIcon,
  Loader2, ChevronUp, ChevronDown,
} from "lucide-react";
import { BUCKET, detectTipo, isStoragePath, useMidiaUrl, type MidiaItem } from "@/lib/midia";

export const MIDIA_ICON = {
  imagem: ImageIcon, video: Video, pdf: FileText, link: LinkIcon, arquivo: FileText,
} as const;

export function MidiaGaleria({
  midias,
  onChange,
}: {
  midias: MidiaItem[];
  onChange: (v: MidiaItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const novos: MidiaItem[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name}: maior que 50MB`);
          continue;
        }
        const path = `pautas/${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
        if (error) throw error;
        novos.push({ url: path, tipo: detectTipo(file), legenda: file.name });
      }
      if (novos.length) {
        onChange([...midias, ...novos]);
        toast.success(`${novos.length} mídia(s) anexada(s)`);
      }
    } catch (e: any) {
      toast.error(e.message ?? "Falha no upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(i: number) {
    const item = midias[i];
    if (item && isStoragePath(item.url)) await supabase.storage.from(BUCKET).remove([item.url]);
    onChange(midias.filter((_, idx) => idx !== i));
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= midias.length) return;
    const next = [...midias];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function setLegenda(i: number, legenda: string) {
    onChange(midias.map((m, idx) => (idx === i ? { ...m, legenda } : m)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Mídias do bloco (fotos, vídeos, PDFs)</Label>
        <span className="text-xs text-muted-foreground">{midias.length} item(ns)</span>
      </div>

      <div className="rounded-xl border border-dashed p-4 text-center">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button type="button" variant="outline" size="sm" disabled={busy}
          onClick={() => inputRef.current?.click()} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Enviando..." : "Enviar arquivos"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, MP4, PDF — até 50MB cada. Selecione vários de uma vez.</p>
        <div className="flex gap-2 mt-3">
          <Input placeholder="ou cole um link (https://...)" value={link} onChange={(e) => setLink(e.target.value)} />
          <Button type="button" variant="ghost" size="sm" disabled={!link.trim()}
            onClick={() => { onChange([...midias, { url: link.trim(), tipo: "link", legenda: null }]); setLink(""); }}>
            Adicionar
          </Button>
        </div>
      </div>

      {midias.length > 0 && (
        <div className="space-y-2">
          {midias.map((m, i) => (
            <MidiaLinha
              key={`${m.url}-${i}`}
              item={m} index={i} total={midias.length}
              onMove={(d) => move(i, d)}
              onRemove={() => remove(i)}
              onLegenda={(v) => setLegenda(i, v)}
            />
          ))}
          <p className="text-xs text-muted-foreground">Use as setas para definir a ordem em que aparecem na apresentação.</p>
        </div>
      )}
    </div>
  );
}

function MidiaLinha({
  item, index, total, onMove, onRemove, onLegenda,
}: {
  item: MidiaItem;
  index: number;
  total: number;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  onLegenda: (v: string) => void;
}) {
  const src = useMidiaUrl(item.url);
  const Icon = (MIDIA_ICON as any)[item.tipo] ?? LinkIcon;
  return (
    <div className="rounded-xl border p-3 flex gap-3 items-start">
      <div className="flex flex-col items-center gap-0.5 pt-1">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          className="h-5 w-5 grid place-items-center rounded hover:bg-muted disabled:opacity-30">
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="text-[10px] text-muted-foreground font-semibold">{index + 1}</span>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          className="h-5 w-5 grid place-items-center rounded hover:bg-muted disabled:opacity-30">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="h-16 w-24 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
        {src && item.tipo === "imagem" ? (
          <img src={src} alt={item.legenda ?? ""} className="h-full w-full object-cover" />
        ) : src && item.tipo === "video" ? (
          <video src={src} className="h-full w-full object-cover" muted />
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="text-xs text-muted-foreground truncate">{item.url.split("/").pop()}</div>
        <Input value={item.legenda ?? ""} placeholder="Legenda (opcional)"
          onChange={(e) => onLegenda(e.target.value)} className="h-8 text-sm" />
      </div>

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
