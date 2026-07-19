import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Metas" description="Metas diárias, semanais e mensais da equipe" icon={Target} phase="próxima etapa" />,
});