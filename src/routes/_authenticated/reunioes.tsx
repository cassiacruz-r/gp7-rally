import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/reunioes")({
  head: () => ({ meta: [{ title: "Reuniões | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Reuniões" description="Histórico e agendamento de reuniões diárias" icon={CalendarDays} phase="Fase 2" />,
});