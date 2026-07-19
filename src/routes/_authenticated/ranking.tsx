import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PodiumCard } from "@/components/podium-card";
import { Avatar } from "./dashboard";
import { fmtNumber, pct } from "@/lib/format";
import { Trophy, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ranking")({
  head: () => ({ meta: [{ title: "Ranking | GP7 - ADRIANO" }] }),
  component: RankingPage,
});

function RankingPage() {
  const { data: rows } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => (await supabase.from("vendedores").select("*").order("pontuacao", { ascending: false })).data ?? [],
  });
  const list = rows ?? [];
  const top3 = list.slice(0, 3);
  const bottom3 = list.slice(-3).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Ranking</h1>
        <p className="text-muted-foreground text-sm">Classificação geral por pontuação</p>
      </div>

      <section className="card-soft p-6">
        <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" /> Top 3</h2>
        {top3.length === 0 ? <p className="text-center text-muted-foreground py-8">Sem dados.</p> : (
          <div className="grid sm:grid-cols-3 gap-4">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((v: any) => {
              const pos = v === top3[0] ? 1 : v === top3[1] ? 2 : 3;
              return <PodiumCard key={v.id} vendedor={v} posicao={pos as 1 | 2 | 3} />;
            })}
          </div>
        )}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="card-soft p-6">
          <h3 className="font-semibold mb-4">Classificação completa</h3>
          <div className="space-y-2">
            {list.map((v: any, i: number) => (
              <div key={v.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
                <div className="w-8 text-center font-bold text-muted-foreground tabular-nums">{i + 1}º</div>
                <Avatar src={v.foto_url} name={v.nome} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{v.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.setor ?? "—"}</div>
                </div>
                <div className="text-right tabular-nums font-bold">{fmtNumber(v.pontuacao)}</div>
              </div>
            ))}
            {list.length === 0 && <p className="text-center text-muted-foreground py-8">Sem vendedores.</p>}
          </div>
        </div>
        <div className="card-soft p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-danger" /> Precisam de atenção</h3>
          <div className="space-y-2">
            {bottom3.map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-danger/20 bg-danger/5">
                <Avatar src={v.foto_url} name={v.nome} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{v.nome}</div>
                  <div className="text-xs text-muted-foreground">Meta: {pct(v.meta, v.resultado)}%</div>
                </div>
                <div className="text-danger font-bold tabular-nums">{fmtNumber(v.pontuacao)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}