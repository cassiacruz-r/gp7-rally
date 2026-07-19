import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({ meta: [{ title: "Histórico | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Histórico" description="Registro auditável das reuniões passadas" icon={History} phase="Fase 3" />,
});