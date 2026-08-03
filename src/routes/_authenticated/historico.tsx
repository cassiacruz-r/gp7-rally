import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico | GP7 - ADRIANO" },
      { name: "description", content: "Registro auditável das alterações e reuniões realizadas no CRM da GP7." },
      { property: "og:title", content: "Histórico | GP7 - ADRIANO" },
      { property: "og:description", content: "Registro auditável das alterações e reuniões realizadas no CRM da GP7." },
    ],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");

  const { data: rows } = useQuery({
    queryKey: ["historico"],
    queryFn: async () => (await supabase.from("historico").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [],
  });

  const list = (rows ?? []).filter((h: any) =>
    `${h.acao} ${h.entidade ?? ""} ${h.descricao ?? ""}`.toLowerCase().includes(busca.toLowerCase()),
  );

  async function limpar() {
    if (!confirm("Limpar todo o histórico?")) return;
    const { error } = await supabase.from("historico").delete().not("id", "is", null);
    if (error) return toast.error(error.message);
    toast.success("Histórico limpo");
    qc.invalidateQueries({ queryKey: ["historico"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Histórico</h1>
          <p className="text-muted-foreground text-sm">Registro das ações realizadas no sistema</p>
        </div>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 w-56" placeholder="Buscar registro" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Button variant="outline" onClick={limpar}><Trash2 className="h-4 w-4 mr-1" /> Limpar</Button>
      </header>

      <div className="card-soft divide-y">
        {list.map((h: any) => (
          <div key={h.id} className="flex items-start gap-4 p-4">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-brand/10 text-brand grid place-items-center">
              <History className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{h.acao}</span>
                {h.entidade && <span className="text-[11px] uppercase tracking-wide bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{h.entidade}</span>}
              </div>
              {h.descricao && <p className="text-sm text-muted-foreground mt-0.5">{h.descricao}</p>}
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(h.created_at).toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="p-16 text-center text-muted-foreground">Nenhum registro no histórico.</div>}
      </div>
    </div>
  );
}