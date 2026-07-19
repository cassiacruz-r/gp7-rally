import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/kpis")({
  head: () => ({ meta: [{ title: "KPIs | GP7 - ADRIANO" }] }),
  component: KpisPage,
});

type K = { id?: string; nome: string; valor: number; meta: number; unidade: string; ordem: number };
const empty: K = { nome: "", valor: 0, meta: 0, unidade: "", ordem: 0 };

function KpisPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<K>(empty);
  const { data: rows } = useQuery({ queryKey: ["kpis"], queryFn: async () => (await supabase.from("kpis").select("*").order("ordem")).data ?? [] });

  async function save() {
    if (!form.nome) return toast.error("Nome obrigatório");
    const res = form.id ? await supabase.from("kpis").update(form).eq("id", form.id) : await supabase.from("kpis").insert(form);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvo");
    setOpen(false); setForm(empty);
    qc.invalidateQueries({ queryKey: ["kpis"] });
  }
  async function del(id: string) {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("kpis").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["kpis"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>KPIs</h1>
          <p className="text-muted-foreground text-sm">Indicadores acompanhados nas reuniões</p>
        </div>
        <div className="flex-1" />
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Novo KPI</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} KPI</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor atual</Label><Input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} /></div>
                <div><Label>Meta</Label><Input type="number" value={form.meta} onChange={(e) => setForm({ ...form, meta: Number(e.target.value) })} /></div>
                <div><Label>Unidade</Label><Input placeholder="%, R$, un" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} /></div>
                <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={save}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(rows ?? []).map((k: any) => {
          const p = k.meta > 0 ? Math.round((Number(k.valor) / Number(k.meta)) * 100) : 0;
          return (
            <div key={k.id} className="card-soft p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{k.nome}</div>
                  <div className="text-3xl font-bold mt-1 tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
                    {Number(k.valor).toLocaleString("pt-BR")}<span className="text-base text-muted-foreground ml-1">{k.unidade}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setForm(k); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => del(k.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Meta: {Number(k.meta).toLocaleString("pt-BR")} {k.unidade}</span>
                  <span className={p >= 100 ? "text-success" : p >= 70 ? "text-warning" : "text-danger"}>{p}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full transition-all ${p >= 100 ? "bg-success" : p >= 70 ? "bg-warning" : "bg-danger"}`} style={{ width: `${Math.min(p, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
        {(!rows || rows.length === 0) && (
          <div className="col-span-full card-soft p-16 text-center text-muted-foreground">Nenhum KPI cadastrado.</div>
        )}
      </div>
    </div>
  );
}