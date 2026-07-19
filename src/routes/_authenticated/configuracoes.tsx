import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Configurações" description="Preferências do sistema, tema e usuários" icon={Settings} phase="Fase 3" />,
});