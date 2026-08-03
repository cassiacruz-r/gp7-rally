import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Film, Image as ImageIcon, File, Upload, Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca | GP7 - ADRIANO" },
      { name: "description", content: "Repositório de imagens, vídeos e documentos usados nas reuniões da equipe GP7." },
      { property: "og:title", content: "Biblioteca | GP7 - ADRIANO" },
      { property: "og:description", content: "Repositório de imagens, vídeos e documentos usados nas reuniões da equipe GP7." },
    ],
  }),
  component: BibliotecaPage,
});

function tipoDe(mime: string) {
  if (mime.startsWith("image/")) return "imagem";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "documento";
}

const ICONS: Record<string, any> = { imagem: ImageIcon, video: Film, pdf: FileText, documento: File };

function tamanho(bytes?: number | null) {
  if (!bytes) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, v = bytes;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

function BibliotecaPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [uploading, setUploading] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: async () => (await supabase.from("biblioteca").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const list = (rows ?? []).filter(
    (f: any) => (filtro === "todos" || f.tipo === filtro) && f.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const path = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const up = await supabase.storage.from("biblioteca").upload(path, file);
        if (up.error) throw up.error;
        const ins = await supabase.from("biblioteca").insert({
          nome: file.name,
          tipo: tipoDe(file.type),
          url: path,
          tamanho_bytes: file.size,
        });
        if (ins.error) throw ins.error;
      }
      toast.success(`${files.length} arquivo(s) enviado(s)`);
      qc.invalidateQueries({ queryKey: ["biblioteca"] });
    } catch (err: any) {
      toast.error(err.message ?? "Falha no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function abrir(f: any) {
    const { data, error } = await supabase.storage.from("biblioteca").createSignedUrl(f.url, 3600);
    if (error || !data) return toast.error("Não foi possível abrir o arquivo");
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function del(f: any) {
    if (!confirm(`Excluir "${f.nome}"?`)) return;
    await supabase.storage.from("biblioteca").remove([f.url]);
    const { error } = await supabase.from("biblioteca").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success("Arquivo removido");
    qc.invalidateQueries({ queryKey: ["biblioteca"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Biblioteca</h1>
          <p className="text-muted-foreground text-sm">Imagens, vídeos e documentos de apoio às reuniões</p>
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-56" placeholder="Buscar arquivo" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={onUpload} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4 mr-1" /> {uploading ? "Enviando..." : "Enviar arquivos"}
        </Button>
      </header>

      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {["todos", "imagem", "video", "pdf", "documento"].map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${filtro === t ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((f: any) => {
          const Icon = ICONS[f.tipo] ?? File;
          return (
            <div key={f.id} className="card-soft p-5 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-brand/10 text-brand grid place-items-center">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-medium text-sm break-words">{f.nome}</div>
              <div className="text-xs text-muted-foreground">{tamanho(f.tamanho_bytes)} · {new Date(f.created_at).toLocaleDateString("pt-BR")}</div>
              <div className="mt-4 flex gap-1">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => abrir(f)}><Download className="h-4 w-4 mr-1" /> Abrir</Button>
                <Button size="sm" variant="ghost" onClick={() => del(f)}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="col-span-full card-soft p-16 text-center text-muted-foreground">Nenhum arquivo na biblioteca.</div>}
      </div>
    </div>
  );
}