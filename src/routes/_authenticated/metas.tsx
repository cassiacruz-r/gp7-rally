import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { toast } from "sonner";
import { pct, statusColor, fmtNumber } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas | GP7 - ADRIANO" },
      { name: "description", content: "Cadastro e acompanhamento das metas diárias, semanais e mensais da equipe comercial GP7." },
      { property: "og:title", content: "Metas | GP7 - ADRIANO" },
      { property: "og:description", content: "Cadastro e acompanhamento das metas diárias, semanais e mensais da equipe comercial GP7." },
    ],
  }),
  component: MetasPage,
});

type M = { id?: string; tipo: string; titulo: string; valor: number; realizado: number; periodo: string; observacao?: string };
const TIPOS = ["diaria", "semanal", "mensal"] as const;
const LABEL: Record<string, string> = { diaria: "Diária", semanal: "Semanal", mensal: "Mensal" };
const empty = (): M => ({ tipo: "diaria", titulo: "", valor: 0, realizado: 0, periodo: new Date().toISOString().slice(0, 10), observacao: "" });

function MetasPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("todas");
  const [form, setForm] = useState<M>(empty());

  const { data: rows } = useQuery({
    queryKey: ["metas"],
    queryFn: async () => (await supabase.from("metas").select("*").order("periodo", { ascending: false })).data ?? [],
  });

  const list = (rows ?? []).filter((m: any) => filtro === "todas" || m.tipo === filtro);

  async function save() {
    if (!form.titulo) return toast.error("Informe o título da meta");
    const payload = { ...form, valor: Number(form.valor), realizado: Number(form.realizado) };
    const res = payload.id
      ? await supabase.from("metas").update(payload).eq("id", payload.id)
      : await supabase.from("metas").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Meta salva");
    setOpen(false);
    setForm(empty());
    qc.invalidateQueries({ queryKey: ["metas"] });
  }

  async function del(id: string) {
    if (!confirm("Excluir esta meta?")) return;
    const { error } = await supabase.from("metas").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["metas"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Metas</h1>
          <p className="text-muted-foreground text-sm">Metas diárias, semanais e mensais da equipe</p>
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {["todas", ...TIPOS].map((t) => (
            <button
              key={t}
              onClick={() => setFiltro(t)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filtro === t ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "todas" ? "Todas" : LABEL[t]}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty()); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nova meta</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Nova"} meta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Faturamento do dia" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    {TIPOS.map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}
                  </select>
                </div>
                <div><Label>Período</Label><Input type="date" value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} /></div>
                <div><Label>Meta</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} /></div>
                <div><Label>Realizado</Label><Input type="number" value={form.realizado} onChange={(e) => setForm({ ...form, realizado: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Observação</Label><Textarea value={form.observacao ?? ""} onChange={(e) => setForm({ ...form, observacao: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((m: any) => {
          const p = pct(Number(m.valor), Number(m.realizado));
          const s = statusColor(p);
          return (
            <div key={m.id} className="card-soft p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-brand bg-brand/10 rounded-full px-2 py-0.5">
                    <Target className="h-3 w-3" /> {LABEL[m.tipo] ?? m.tipo}
                  </div>
                  <div className="mt-2 font-semibold">{m.titulo}</div>
                  <div className="text-xs text-muted-foreground">{new Date(m.periodo + "T00:00:00").toLocaleDateString("pt-BR")}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setForm({ ...m, observacao: m.observacao ?? "" }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del(m.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{fmtNumber(Number(m.realizado))}</div>
                <div className={`text-sm font-semibold text-${s}`}>{p}%</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full bg-${s} transition-all`} style={{ width: `${Math.min(p, 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Meta: {fmtNumber(Number(m.valor))}</div>
              {m.observacao && <p className="mt-3 text-sm text-muted-foreground">{m.observacao}</p>}
            </div>
          );
        })}
        {list.length === 0 && <div className="col-span-full card-soft p-16 text-center text-muted-foreground">Nenhuma meta cadastrada.</div>}
      </div>
    </div>
  );
}