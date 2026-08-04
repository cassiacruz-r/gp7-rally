import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users, CalendarDays, Clock, Play, CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reunioes")({
  head: () => ({
    meta: [
      { title: "Reuniões | GP7 - ADRIANO" },
      { name: "description", content: "Agenda, presença e histórico das reuniões diárias da equipe comercial GP7." },
      { property: "og:title", content: "Reuniões | GP7 - ADRIANO" },
      { property: "og:description", content: "Agenda, presença e histórico das reuniões diárias da equipe comercial GP7." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReunioesPage,
});

type R = {
  id?: string;
  titulo: string;
  data: string;
  hora: string;
  pauta_id: string | null;
  status: string;
  duracao_minutos: number;
  responsavel: string | null;
  observacoes: string | null;
};

const STATUS = ["agendada", "realizada", "cancelada"] as const;
const STATUS_LABEL: Record<string, string> = { agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada" };
const STATUS_CLASS: Record<string, string> = {
  agendada: "bg-brand/10 text-brand",
  realizada: "bg-success/10 text-success",
  cancelada: "bg-danger/10 text-danger",
};

const empty = (): R => ({
  titulo: "",
  data: new Date().toISOString().slice(0, 10),
  hora: "08:00",
  pauta_id: null,
  status: "agendada",
  duracao_minutos: 30,
  responsavel: "",
  observacoes: "",
});

function ReunioesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<R>(empty());
  const [filtro, setFiltro] = useState<string>("todas");
  const [presencaId, setPresencaId] = useState<string | null>(null);

  const { data: reunioes } = useQuery({
    queryKey: ["reunioes"],
    queryFn: async () =>
      (await supabase.from("reunioes").select("*").order("data", { ascending: false }).order("hora", { ascending: false })).data ?? [],
  });

  const { data: pautas } = useQuery({
    queryKey: ["pautas"],
    queryFn: async () => (await supabase.from("pautas").select("id, titulo, dia_semana").order("titulo")).data ?? [],
  });

  const { data: vendedores } = useQuery({
    queryKey: ["vendedores"],
    queryFn: async () => (await supabase.from("vendedores").select("id, nome, setor").order("nome")).data ?? [],
  });

  const { data: presencas } = useQuery({
    queryKey: ["presencas", presencaId],
    enabled: !!presencaId,
    queryFn: async () =>
      (await supabase.from("reuniao_presencas").select("*").eq("reuniao_id", presencaId!)).data ?? [],
  });

  const list = (reunioes ?? []).filter((r: any) => filtro === "todas" || r.status === filtro);

  async function save() {
    if (!form.titulo) return toast.error("Informe o título da reunião");
    const payload = { ...form, duracao_minutos: Number(form.duracao_minutos), pauta_id: form.pauta_id || null };
    const res = payload.id
      ? await supabase.from("reunioes").update(payload).eq("id", payload.id)
      : await supabase.from("reunioes").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Reunião salva");
    setOpen(false);
    setForm(empty());
    qc.invalidateQueries({ queryKey: ["reunioes"] });
  }

  async function del(id: string) {
    if (!confirm("Excluir esta reunião?")) return;
    const { error } = await supabase.from("reunioes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["reunioes"] });
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("reunioes").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["reunioes"] });
  }

  async function togglePresenca(vendedorId: string, presente: boolean) {
    if (!presencaId) return;
    const { error } = await supabase
      .from("reuniao_presencas")
      .upsert({ reuniao_id: presencaId, vendedor_id: vendedorId, presente }, { onConflict: "reuniao_id,vendedor_id" });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["presencas", presencaId] });
  }

  const presentesCount = (presencas ?? []).filter((p: any) => p.presente).length;
  const totalRealizadas = (reunioes ?? []).filter((r: any) => r.status === "realizada").length;
  const proxima = (reunioes ?? []).find((r: any) => r.status === "agendada");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Reuniões</h1>
          <p className="text-muted-foreground text-sm">Agenda, presença e histórico das reuniões diárias</p>
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {["todas", ...STATUS].map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filtro === s ? "bg-card shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s === "todas" ? "Todas" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty()); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Nova reunião</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Nova"} reunião</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Reunião diária comercial" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data</Label><Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></div>
                <div><Label>Hora</Label><Input type="time" value={form.hora?.slice(0, 5)} onChange={(e) => setForm({ ...form, hora: e.target.value })} /></div>
                <div>
                  <Label>Pauta</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.pauta_id ?? ""}
                    onChange={(e) => setForm({ ...form, pauta_id: e.target.value || null })}
                  >
                    <option value="">Sem pauta</option>
                    {(pautas ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
                <div><Label>Duração (min)</Label><Input type="number" value={form.duracao_minutos} onChange={(e) => setForm({ ...form, duracao_minutos: Number(e.target.value) })} /></div>
                <div><Label>Responsável</Label><Input value={form.responsavel ?? ""} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Adriano" /></div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.observacoes ?? ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Salvar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-soft p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><CalendarDays className="h-4 w-4" /> Total de reuniões</div>
          <p className="text-3xl font-bold mt-1">{(reunioes ?? []).length}</p>
        </div>
        <div className="card-soft p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><CheckCircle2 className="h-4 w-4" /> Realizadas</div>
          <p className="text-3xl font-bold mt-1">{totalRealizadas}</p>
        </div>
        <div className="card-soft p-5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Clock className="h-4 w-4" /> Próxima agendada</div>
          <p className="text-lg font-semibold mt-1 truncate">
            {proxima ? `${new Date(proxima.data + "T00:00:00").toLocaleDateString("pt-BR")} · ${String(proxima.hora).slice(0, 5)}` : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card-soft p-12 text-center text-sm text-muted-foreground">Nenhuma reunião registrada ainda.</div>
        )}
        {list.map((r: any) => {
          const pauta = (pautas ?? []).find((p: any) => p.id === r.pauta_id);
          return (
            <div key={r.id} className="card-soft p-5 flex flex-wrap items-center gap-4">
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{r.titulo}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CLASS[r.status] ?? "bg-muted"}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")} · {String(r.hora).slice(0, 5)} · {r.duracao_minutos} min
                  {r.responsavel ? ` · ${r.responsavel}` : ""}
                </p>
                {pauta && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5" /> Pauta: {pauta.titulo}
                  </p>
                )}
                {r.observacoes && <p className="text-sm mt-2">{r.observacoes}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPresencaId(r.id)}>
                  <Users className="h-4 w-4 mr-1" /> Presença
                </Button>
                {r.pauta_id && (
                  <Button size="sm" asChild>
                    <Link to="/modo-reuniao" search={{ pauta: r.pauta_id }}><Play className="h-4 w-4 mr-1" /> Iniciar</Link>
                  </Button>
                )}
                {r.status !== "realizada" && (
                  <Button variant="outline" size="sm" onClick={() => setStatus(r.id, "realizada")}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Concluir
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => { setForm({ ...r, hora: String(r.hora).slice(0, 5) }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-danger" /></Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!presencaId} onOpenChange={(o) => !o && setPresencaId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lista de presença · {presentesCount}/{(vendedores ?? []).length}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {(vendedores ?? []).length === 0 && <p className="text-sm text-muted-foreground">Cadastre vendedores para registrar presença.</p>}
            {(vendedores ?? []).map((v: any) => {
              const presente = (presencas ?? []).find((p: any) => p.vendedor_id === v.id)?.presente ?? false;
              return (
                <label key={v.id} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--brand)]"
                    checked={presente}
                    onChange={(e) => togglePresenca(v.id, e.target.checked)}
                  />
                  <span className="text-sm font-medium">{v.nome}</span>
                  {v.setor && <span className="text-xs text-muted-foreground ml-auto">Setor {v.setor}</span>}
                </label>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
