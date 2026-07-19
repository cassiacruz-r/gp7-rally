export function pct(meta: number, realizado: number): number {
  if (!meta) return 0;
  return Math.round((realizado / meta) * 100);
}

export function statusColor(percent: number): "success" | "warning" | "danger" {
  if (percent >= 100) return "success";
  if (percent >= 70) return "warning";
  return "danger";
}

export function fmtNumber(n: number | null | undefined): string {
  if (n == null) return "0";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(n);
}