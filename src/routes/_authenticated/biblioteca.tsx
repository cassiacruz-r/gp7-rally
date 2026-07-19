import { createFileRoute } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({ meta: [{ title: "Biblioteca | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Biblioteca" description="Documentos, políticas e materiais de apoio" icon={Library} phase="Fase 3" />,
});