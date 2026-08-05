import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Clock,
  ListChecks,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { MidiaGaleria, MIDIA_ICON } from "@/components/midia-galeria";
import { parseMidias, type MidiaItem } from "@/lib/midia";

export const Route = createFileRoute("/_authenticated/pautas")({
  head: () => ({ meta: [{ title: "Pautas | GP7 - ADRIANO" }] }),
  component: PautasPage,
});

const DIAS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
] as const;

const BLOCOS_PADRAO = [
  "Gente e Segurança",
  "Produtividade",
  "Desafios D-1",
  "Remuneração",
  "Recado do GV",
  "Tarefas",
  "Como Atuar",
];

type Pauta = {
  id: string;
  titulo: string;
  descricao: string | null;
  dia_semana: string;
  created_at: string;
};
type Bloco = {
  id: string;
  pauta_id: string;
  titulo: string;
  descricao: string | null;
  observacoes: string | null;
  ordem: number;
  tempo_minutos: number;
  midia_tipo: string | null;
  midia_url: string | null;
  midias?: MidiaItem[] | null;
};

function PautasPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pautaOpen, setPautaOpen] = useState(false);
  const [pautaForm, setPautaForm] = useState<Partial<Pauta>>({
    titulo: "",
    descricao: "",
    dia_semana: "Segunda-feira",
  });

  const { data: pautas } = useQuery({
    queryKey: ["pautas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pautas")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as Pauta[]) ?? [];
    },
  });

  const selected = pautas?.find((p) => p.id === selectedId) ?? pautas?.[0] ?? null;

  async function savePauta() {
    if (!pautaForm.titulo) return toast.error("Título é obrigatório");
    const payload = {
      titulo: pautaForm.titulo!,
      descricao: pautaForm.descricao ?? null,
      dia_semana: pautaForm.dia_semana!,
    };
    const res = pautaForm.id
      ? await supabase.from("pautas").update(payload).eq("id", pautaForm.id)
      : await supabase.from("pautas").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Pauta salva");
    setPautaOpen(false);
    setPautaForm({ titulo: "", descricao: "", dia_semana: "Segunda-feira" });
    qc.invalidateQueries({ queryKey: ["pautas"] });
  }

  async function removePauta(id: string) {
    if (!confirm("Excluir esta pauta e todos os blocos?")) return;
    const { error } = await supabase.from("pautas").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Excluída");
    if (selectedId === id) setSelectedId(null);
    qc.invalidateQueries({ queryKey: ["pautas"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pautas da Semana
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize os blocos da reunião diária por dia da semana
          </p>
        </div>
        <Button
          onClick={() => {
            setPautaForm({ titulo: "", descricao: "", dia_semana: "Segunda-feira" });
            setPautaOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Nova pauta
        </Button>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <aside className="card-soft p-3 h-fit lg:sticky lg:top-20">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pautas ({pautas?.length ?? 0})
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {(pautas ?? []).map((p) => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 transition ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{p.titulo}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.dia_semana}
                  </div>
                </button>
              );
            })}
            {pautas?.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8 px-3">
                Nenhuma pauta ainda.
              </div>
            )}
          </div>
        </aside>

        <div>
          {selected ? (
            <PautaDetail
              pauta={selected}
              onEdit={() => {
                setPautaForm(selected);
                setPautaOpen(true);
              }}
              onDelete={() => removePauta(selected.id)}
            />
          ) : (
            <div className="card-soft p-12 text-center">
              <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Crie uma pauta para começar a organizar os blocos da reunião.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={pautaOpen} onOpenChange={setPautaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pautaForm.id ? "Editar pauta" : "Nova pauta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={pautaForm.titulo ?? ""}
                onChange={(e) => setPautaForm({ ...pautaForm, titulo: e.target.value })}
                placeholder="Ex: Reunião comercial - 22/07"
              />
            </div>
            <div>
              <Label>Dia da semana</Label>
              <Select
                value={pautaForm.dia_semana}
                onValueChange={(v) => setPautaForm({ ...pautaForm, dia_semana: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={pautaForm.descricao ?? ""}
                onChange={(e) => setPautaForm({ ...pautaForm, descricao: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPautaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={savePauta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PautaDetail({
  pauta,
  onEdit,
  onDelete,
}: {
  pauta: Pauta;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const qc = useQueryClient();
  const [blocoOpen, setBlocoOpen] = useState(false);
  const [blocoForm, setBlocoForm] = useState<Partial<Bloco>>({});

  const { data: blocos } = useQuery({
    queryKey: ["blocos", pauta.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blocos_pauta")
        .select("*")
        .eq("pauta_id", pauta.id)
        .order("ordem");
      return (data as Bloco[]) ?? [];
    },
  });

  const total = (blocos ?? []).reduce((s, b) => s + (b.tempo_minutos || 0), 0);

  async function saveBloco() {
    if (!blocoForm.titulo) return toast.error("Título é obrigatório");
    const nextOrder = (blocos?.length ?? 0);
    const payload = {
      pauta_id: pauta.id,
      titulo: blocoForm.titulo!,
      descricao: blocoForm.descricao ?? null,
      observacoes: blocoForm.observacoes ?? null,
      tempo_minutos: Number(blocoForm.tempo_minutos ?? 5),
      midia_tipo: blocoForm.midia_tipo || null,
      midia_url: blocoForm.midia_url || null,
      midias: (blocoForm.midias ?? []) as any,
      ordem: blocoForm.id ? blocoForm.ordem! : nextOrder,
    };
    const res = blocoForm.id
      ? await supabase.from("blocos_pauta").update(payload).eq("id", blocoForm.id)
      : await supabase.from("blocos_pauta").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("Bloco salvo");
    setBlocoOpen(false);
    setBlocoForm({});
    qc.invalidateQueries({ queryKey: ["blocos", pauta.id] });
  }

  async function removeBloco(id: string) {
    if (!confirm("Excluir este bloco?")) return;
    const { error } = await supabase.from("blocos_pauta").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["blocos", pauta.id] });
  }

  async function move(bloco: Bloco, dir: -1 | 1) {
    const list = blocos ?? [];
    const idx = list.findIndex((b) => b.id === bloco.id);
    const swap = list[idx + dir];
    if (!swap) return;
    await supabase.from("blocos_pauta").update({ ordem: swap.ordem }).eq("id", bloco.id);
    await supabase.from("blocos_pauta").update({ ordem: bloco.ordem }).eq("id", swap.id);
    qc.invalidateQueries({ queryKey: ["blocos", pauta.id] });
  }

  async function addPreset(titulo: string) {
    const nextOrder = blocos?.length ?? 0;
    const { error } = await supabase.from("blocos_pauta").insert({
      pauta_id: pauta.id,
      titulo,
      tempo_minutos: 5,
      ordem: nextOrder,
    });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["blocos", pauta.id] });
  }

  return (
    <div className="space-y-4">
      <div className="card-soft p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-xs font-medium text-brand uppercase tracking-wide">
              {pauta.dia_semana}
            </div>
            <h2
              className="text-2xl font-bold mt-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {pauta.titulo}
            </h2>
            {pauta.descricao && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                {pauta.descricao}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" /> {blocos?.length ?? 0} blocos
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {total} min
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="gap-1.5 text-danger hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/modo-reuniao" search={{ pauta: pauta.id } as any}>
                <Play className="h-3.5 w-3.5" /> Apresentar
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {blocos?.length === 0 && (
        <div className="card-soft p-4">
          <div className="text-sm font-medium mb-2">Adicionar blocos padrão</div>
          <div className="flex flex-wrap gap-2">
            {BLOCOS_PADRAO.map((b) => (
              <button
                key={b}
                onClick={() => addPreset(b)}
                className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition"
              >
                + {b}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {(blocos ?? []).map((b, i) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card-soft p-4 flex items-start gap-3"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => move(b, -1)}
                  disabled={i === 0}
                  className="h-6 w-6 grid place-items-center rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(b, 1)}
                  disabled={i === (blocos!.length - 1)}
                  className="h-6 w-6 grid place-items-center rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand grid place-items-center font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{b.titulo}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {b.tempo_minutos} min
                  </span>
                  {parseMidias(b).map((m, mi) => (
                    <span key={mi} className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand flex items-center gap-1">
                      {(() => {
                        const MI = (MIDIA_ICON as any)[m.tipo] ?? LinkIcon;
                        return <MI className="h-3 w-3" />;
                      })()}
                      {m.tipo}
                    </span>
                  ))}
                </div>
                {b.descricao && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {b.descricao}
                  </p>
                )}
                {b.observacoes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Obs: {b.observacoes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setBlocoForm({ ...b, midias: parseMidias(b) });
                    setBlocoOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeBloco(b.id)}
                  className="text-danger hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          setBlocoForm({ tempo_minutos: 5, midias: [] });
          setBlocoOpen(true);
        }}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" /> Adicionar bloco
      </Button>

      <Dialog open={blocoOpen} onOpenChange={setBlocoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{blocoForm.id ? "Editar bloco" : "Novo bloco"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={blocoForm.titulo ?? ""}
                onChange={(e) => setBlocoForm({ ...blocoForm, titulo: e.target.value })}
                placeholder="Ex: Gente e Segurança"
              />
            </div>
            <div>
              <Label>Tempo (min)</Label>
              <Input
                type="number"
                min={1}
                value={blocoForm.tempo_minutos ?? 5}
                onChange={(e) =>
                  setBlocoForm({ ...blocoForm, tempo_minutos: Number(e.target.value) })
                }
              />
            </div>
            <MidiaGaleria
              midias={blocoForm.midias ?? []}
              onChange={(v) => setBlocoForm({ ...blocoForm, midias: v })}
            />
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={blocoForm.descricao ?? ""}
                onChange={(e) =>
                  setBlocoForm({ ...blocoForm, descricao: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Observações do apresentador</Label>
              <Textarea
                value={blocoForm.observacoes ?? ""}
                onChange={(e) =>
                  setBlocoForm({ ...blocoForm, observacoes: e.target.value })
                }
                rows={2}
                placeholder="Notas visíveis só para você"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBlocoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveBloco}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
