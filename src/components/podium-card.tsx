import { motion } from "framer-motion";
import { Crown, Medal, Award } from "lucide-react";
import { fmtNumber } from "@/lib/format";

const styles = {
  1: { grad: "from-warning to-amber-500", ring: "ring-warning/40", icon: Crown, label: "1º Lugar", height: "h-72" },
  2: { grad: "from-slate-300 to-slate-400", ring: "ring-slate-300/60", icon: Medal, label: "2º Lugar", height: "h-64" },
  3: { grad: "from-orange-400 to-orange-600", ring: "ring-orange-400/40", icon: Award, label: "3º Lugar", height: "h-60" },
} as const;

export function PodiumCard({ vendedor, posicao }: { vendedor: any; posicao: 1 | 2 | 3 }) {
  const s = styles[posicao];
  const Icon = s.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: posicao * 0.08 }}
      className={`relative rounded-2xl p-5 flex flex-col items-center text-center border bg-card ${s.height}`}
    >
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${s.grad} flex items-center gap-1 shadow`}>
        <Icon className="h-3.5 w-3.5" /> {s.label}
      </div>
      <div className={`mt-4 h-24 w-24 rounded-full overflow-hidden ring-4 ${s.ring} bg-muted grid place-items-center`}>
        {vendedor.foto_url ? (
          <img src={vendedor.foto_url} alt={vendedor.nome} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-muted-foreground">
            {vendedor.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
          </span>
        )}
      </div>
      <div className="mt-3 font-semibold truncate w-full" title={vendedor.nome}>{vendedor.nome}</div>
      <div className="text-xs text-muted-foreground truncate w-full">{vendedor.setor ?? "—"}</div>
      <div className="mt-auto pt-3">
        <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{fmtNumber(Number(vendedor.pontuacao))}</div>
        <div className="text-xs text-muted-foreground">pontos</div>
      </div>
    </motion.div>
  );
}