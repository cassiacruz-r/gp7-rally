import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/modo-reuniao")({
  head: () => ({ meta: [{ title: "Modo Reunião | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Modo Reunião" description="Apresentação em tela cheia com navegação por blocos" icon={Play} phase="Fase 2" />,
});