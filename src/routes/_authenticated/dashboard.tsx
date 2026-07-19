import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Target, TrendingUp, ListChecks, Trophy, ArrowDownRight } from "lucide-react";
import { fmtNumber, pct, statusColor } from "@/lib/format";
import { PodiumCard } from "@/components/podium-card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | GP7 - ADRIANO" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: vendedores } = useQuery({
    queryKey: ["vendedores-all"],
    queryFn: async () => {
      const { data } = await supabase.from("vendedores").select("*").order("pontuacao", { ascending: false });
      return data ?? [];
    },
  });
  const { data: kpis } = useQuery({
    queryKey: ["kpis"],
    queryFn: async () => (await supabase.from("kpis").select("*").order("ordem")).data ?? [],
  });
  const { data: metaHoje } = useQuery({
    queryKey: ["meta-hoje"],
    queryFn: async () => {
      const { data } = await supabase.from("metas").select("*").eq("tipo", "diaria").order("periodo", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  const totalVend = vendedores?.length ?? 0;
  const totalResultado = vendedores?.reduce((s, v) => s + Number(v.resultado || 0), 0) ?? 0;
  const totalMeta = metaHoje?.valor ?? vendedores?.reduce((s, v) => s + Number(v.meta || 0), 0) ?? 0;
  const percent = pct(Number(totalMeta), Number(totalResultado));
  const melhor = vendedores?.[0];
  const pior = vendedores?.[vendedores.length - 1];

  const top3 = (vendedores ?? []).slice(0, 3);

  const chartData = (vendedores ?? []).slice(0, 10).map((v, i) => ({ nome: v.nome.split(" ")[0], valor: Number(v.resultado) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral em tempo real da equipe comercial</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Meta do dia" value={fmtNumber(Number(totalMeta))} tone="brand" />
        <StatCard icon={TrendingUp} label="Resultado do dia" value={fmtNumber(Number(totalResultado))} tone="success" />
        <StatCard icon={ListChecks} label="% da meta" value={`${percent}%`} tone={statusColor(percent)} />
        <StatCard icon={Users} label="Vendedores" value={String(totalVend)} tone="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" /> Pódio dos Destaques</h2>
              <span className="text-xs text-muted-foreground">Top 3 pontuações</span>
            </div>
            {top3.length === 0 ? (
              <EmptyState msg="Cadastre vendedores para ver o pódio." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((v, i) => {
                  const pos = v === top3[0] ? 1 : v === top3[1] ? 2 : 3;
                  return <PodiumCard key={v!.id} vendedor={v!} posicao={pos} />;
                })}
              </div>
            )}
          </section>

          <section className="card-soft p-6">
            <h2 className="font-semibold text-lg mb-4">Resultados por vendedor</h2>
            {chartData.length === 0 ? <EmptyState msg="Sem dados ainda." /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="nome" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="valor" stroke="var(--brand)" strokeWidth={2} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-soft p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /> Melhor vendedor</h3>
            {melhor ? <PersonRow v={melhor} tone="success" /> : <EmptyState msg="—" />}
          </section>
          <section className="card-soft p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowDownRight className="h-4 w-4 text-danger" /> Precisa de reforço</h3>
            {pior && pior !== melhor ? <PersonRow v={pior} tone="danger" /> : <EmptyState msg="—" />}
          </section>
          <section className="card-soft p-6">
            <h3 className="font-semibold mb-4">KPIs ativos</h3>
            <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{kpis?.length ?? 0}</div>
            <p className="text-sm text-muted-foreground mt-1">indicadores cadastrados</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  const toneClass = {
    brand: "bg-brand/10 text-brand",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/10 text-danger",
    neutral: "bg-muted text-foreground",
  }[tone as string];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-5">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

function PersonRow({ v, tone }: { v: any; tone: "success" | "danger" }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={v.foto_url} name={v.nome} />
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{v.nome}</div>
        <div className="text-xs text-muted-foreground truncate">{v.setor ?? "—"}</div>
      </div>
      <div className={`text-right ${tone === "success" ? "text-success" : "text-danger"}`}>
        <div className="font-bold tabular-nums">{fmtNumber(Number(v.pontuacao))}</div>
        <div className="text-xs">pts</div>
      </div>
    </div>
  );
}

export function Avatar({ src, name, size = 40 }: { src?: string | null; name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="rounded-full bg-gradient-to-br from-brand/30 to-primary/30 grid place-items-center text-brand-foreground font-semibold overflow-hidden shrink-0"
      style={{ height: size, width: size, fontSize: size / 2.8 }}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span className="text-brand">{initials}</span>}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center">{msg}</div>;
}