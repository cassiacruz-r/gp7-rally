import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "./dashboard";
import { fmtNumber, pct } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/vendedores")({
  head: () => ({ meta: [{ title: "Vendedores | GP7 - ADRIANO" }] }),
  component: VendedoresPage,
});

type V = { id?: string; nome: string; setor: string; equipe: string; foto_url: string | null; pontuacao: number; meta: number; resultado: number; observacao: string };
const empty: V = { nome: "", setor: "", equipe: "", foto_url: null, pontuacao: 0, meta: 0, resultado: 0, observacao: "" };

function VendedoresPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<V>(empty);
  const { data: rows } = useQuery({
    queryKey: ["vendedores"],
    queryFn: async () => (await supabase.from("vendedores").select("*").order("pontuacao", { ascending: false })).data ?? [],
  });

  async function save() {
    if (!form.nome) return toast.error("Nome é obrigatório");
    const payload = { ...form };
    const res = form.id
      ? await supabase.from("vendedores").update(payload).eq("id", form.id)
      : await supabase.from("vendedores").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvo!");
    setOpen(false);
    setForm(empty);
    qc.invalidateQueries({ queryKey: ["vendedores"] });
    qc.invalidateQueries({ queryKey: ["vendedores-all"] });
  }

  async function del(id: string) {
    if (!confirm("Excluir este vendedor?")) return;
    const { error } = await supabase.from("vendedores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluído");
    qc.invalidateQueries({ queryKey: ["vendedores"] });
    qc.invalidateQueries({ queryKey: ["vendedores-all"] });
  }

  async function uploadFoto(file: File) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    setForm((f) => ({ ...f, foto_url: data?.signedUrl ?? null }));
    toast.success("Foto enviada");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Vendedores</h1>
          <p className="text-muted-foreground text-sm">Cadastre e edite a equipe comercial</p>
        </div>
        <div className="flex-1" />
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Novo vendedor</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} vendedor</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex items-center gap-4">
                <Avatar src={form.foto_url} name={form.nome || "?"} size={72} />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFoto(e.target.files[0])} />
                  <span className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border hover:bg-muted"><Upload className="h-4 w-4" /> Enviar foto</span>
                </label>
              </div>
              <div className="col-span-2"><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div><Label>Setor</Label><Input value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} /></div>
              <div><Label>Equipe</Label><Input value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })} /></div>
              <div><Label>Pontuação</Label><Input type="number" value={form.pontuacao} onChange={(e) => setForm({ ...form, pontuacao: Number(e.target.value) })} /></div>
              <div><Label>Meta</Label><Input type="number" value={form.meta} onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label>Resultado</Label><Input type="number" value={form.resultado} onChange={(e) => setForm({ ...form, resultado: Number(e.target.value) })} /></div>
              <div className="col-span-2"><Label>Observação</Label><Textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="card-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Vendedor</th>
              <th className="text-left px-4 py-3">Setor</th>
              <th className="text-left px-4 py-3">Equipe</th>
              <th className="text-right px-4 py-3">Meta</th>
              <th className="text-right px-4 py-3">Resultado</th>
              <th className="text-right px-4 py-3">%</th>
              <th className="text-right px-4 py-3">Pontos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((v: any) => {
              const p = pct(Number(v.meta), Number(v.resultado));
              return (
                <tr key={v.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={v.foto_url} name={v.nome} size={36} />
                      <span className="font-medium">{v.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.setor ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.equipe ?? "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtNumber(v.meta)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtNumber(v.resultado)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-semibold ${p >= 100 ? "text-success" : p >= 70 ? "text-warning" : "text-danger"}`}>{p}%</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold">{fmtNumber(v.pontuacao)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setForm(v); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => del(v.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">Nenhum vendedor cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}