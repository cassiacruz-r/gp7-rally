import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Clock,
  ListChecks,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

const searchSchema = z.object({
  pauta: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/modo-reuniao")({
  head: () => ({ meta: [{ title: "Modo Reunião | GP7 - ADRIANO" }] }),
  validateSearch: searchSchema,
  component: ModoReuniaoPage,
});

type Pauta = {
  id: string;
  titulo: string;
  dia_semana: string;
  descricao: string | null;
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
};

function ModoReuniaoPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [presenting, setPresenting] = useState(false);

  const { data: pautas } = useQuery({
    queryKey: ["pautas"],
    queryFn: async () => {
      const { data } = await supabase.from("pautas").select("*").order("created_at", { ascending: false });
      return (data as Pauta[]) ?? [];
    },
  });

  const pautaId = search.pauta ?? pautas?.[0]?.id;
  const selected = pautas?.find((p) => p.id === pautaId) ?? null;

  const { data: blocos } = useQuery({
    queryKey: ["blocos", pautaId],
    enabled: !!pautaId,
    queryFn: async () => {
      const { data } = await supabase
        .from("blocos_pauta")
        .select("*")
        .eq("pauta_id", pautaId!)
        .order("ordem");
      return (data as Bloco[]) ?? [];
    },
  });

  const total = (blocos ?? []).reduce((s, b) => s + (b.tempo_minutos || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Modo Reunião
          </h1>
          <p className="text-muted-foreground mt-1">
            Apresente a pauta em tela cheia com navegação por blocos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={pautaId ?? ""}
            onValueChange={(v) =>
              navigate({ to: "/modo-reuniao", search: { pauta: v } })
            }
          >
            <SelectTrigger className="min-w-[240px]">
              <SelectValue placeholder="Selecione uma pauta" />
            </SelectTrigger>
            <SelectContent>
              {(pautas ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.dia_semana} — {p.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setPresenting(true)}
            disabled={!blocos || blocos.length === 0}
            className="gap-2"
          >
            <Play className="h-4 w-4" /> Iniciar apresentação
          </Button>
        </div>
      </div>

      {!selected && (
        <div className="card-soft p-12 text-center">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Nenhuma pauta selecionada.{" "}
            <Link to="/pautas" className="text-brand underline">
              Crie uma pauta
            </Link>{" "}
            para começar.
          </p>
        </div>
      )}

      {selected && (
        <div className="card-soft p-6">
          <div className="text-xs font-medium text-brand uppercase tracking-wide">
            {selected.dia_semana}
          </div>
          <h2
            className="text-2xl font-bold mt-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {selected.titulo}
          </h2>
          {selected.descricao && (
            <p className="text-sm text-muted-foreground mt-2">{selected.descricao}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" /> {blocos?.length ?? 0} blocos
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {total} min estimados
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {(blocos ?? []).map((b, i) => (
              <div
                key={b.id}
                className="rounded-xl border p-4 hover:border-brand hover:shadow-sm transition"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-6 w-6 rounded-md bg-brand/10 text-brand grid place-items-center font-semibold">
                    {i + 1}
                  </span>
                  {b.tempo_minutos} min
                </div>
                <div className="font-semibold mt-2 truncate">{b.titulo}</div>
                {b.descricao && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {b.descricao}
                  </div>
                )}
              </div>
            ))}
            {blocos?.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                Esta pauta não tem blocos.{" "}
                <Link to="/pautas" className="text-brand underline">
                  Adicionar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {presenting && selected && blocos && blocos.length > 0 && (
        <Presenter
          pauta={selected}
          blocos={blocos}
          onExit={() => setPresenting(false)}
        />
      )}
    </div>
  );
}

function Presenter({
  pauta,
  blocos,
  onExit,
}: {
  pauta: Pauta;
  blocos: Bloco[];
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = blocos[idx];

  useEffect(() => {
    // enter fullscreen
    const el = rootRef.current;
    if (el && el.requestFullscreen) el.requestFullscreen().catch(() => {});
    const onFsChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown")
        setIdx((i) => Math.min(blocos.length - 1, i + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp")
        setIdx((i) => Math.max(0, i - 1));
      if (e.key === "Escape") onExit();
      if (e.key.toLowerCase() === "p") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blocos.length, onExit]);

  useEffect(() => {
    setElapsed(0);
  }, [idx]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [paused, idx]);

  const totalSec = current.tempo_minutos * 60;
  const progress = Math.min(100, (elapsed / totalSec) * 100);
  const overtime = elapsed > totalSec;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 bg-[oklch(0.14_0.02_260)] text-white flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-white/50">
            {pauta.dia_semana}
          </div>
          <div className="font-semibold text-lg truncate">{pauta.titulo}</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div
              className={`text-3xl font-bold tabular-nums ${
                overtime ? "text-danger" : ""
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {mm}:{ss}
            </div>
            <div className="text-xs text-white/50">
              de {current.tempo_minutos}:00
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={onExit}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Slide */}
      <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-6xl"
          >
            <div className="text-brand text-sm uppercase tracking-widest font-semibold mb-4">
              Bloco {idx + 1} de {blocos.length}
            </div>
            <h1
              className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {current.titulo}
            </h1>
            {current.descricao && (
              <p className="text-2xl text-white/80 mt-6 leading-relaxed max-w-4xl">
                {current.descricao}
              </p>
            )}
            {current.midia_url && (
              <div className="mt-8 max-h-[45vh] overflow-hidden rounded-xl border border-white/10">
                {current.midia_tipo === "imagem" && (
                  <img
                    src={current.midia_url}
                    alt=""
                    className="w-full max-h-[45vh] object-contain"
                  />
                )}
                {current.midia_tipo === "video" && (
                  <video
                    src={current.midia_url}
                    controls
                    className="w-full max-h-[45vh]"
                  />
                )}
                {current.midia_tipo === "link" && (
                  <a
                    href={current.midia_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 text-brand underline"
                  >
                    {current.midia_url}
                  </a>
                )}
              </div>
            )}
            {current.observacoes && (
              <div className="mt-8 px-5 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 max-w-3xl">
                <span className="font-semibold text-white/80">Notas: </span>
                {current.observacoes}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <div
          className={`h-full transition-all ${
            overtime ? "bg-danger" : "bg-brand"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-white/10 gap-4">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 gap-2"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft className="h-5 w-5" /> Anterior
        </Button>

        <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
          {blocos.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? "w-8 bg-brand"
                  : i < idx
                    ? "w-4 bg-white/40"
                    : "w-4 bg-white/15"
              }`}
              title={b.titulo}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 gap-2"
          onClick={() =>
            idx === blocos.length - 1
              ? onExit()
              : setIdx((i) => Math.min(blocos.length - 1, i + 1))
          }
        >
          {idx === blocos.length - 1 ? "Encerrar" : "Próximo"}{" "}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}