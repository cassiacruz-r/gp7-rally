import { motion } from "framer-motion";

export function PagePlaceholder({ title, description, icon: Icon, phase }: { title: string; description: string; icon: any; phase?: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-soft p-12 text-center">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-brand/10 grid place-items-center text-brand">
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Em construção</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Esta área será liberada em {phase ?? "próxima fase"} do desenvolvimento do CRM.
        </p>
      </motion.div>
    </div>
  );
}