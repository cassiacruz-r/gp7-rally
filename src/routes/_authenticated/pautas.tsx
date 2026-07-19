import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/pautas")({
  head: () => ({ meta: [{ title: "Pautas | GP7 - ADRIANO" }] }),
  component: () => <PagePlaceholder title="Pautas da Semana" description="Organize os blocos da reunião: Gente e Segurança, Produtividade, Desafios D-1, Remuneração, Recado do GV, Tarefas, Como Atuar" icon={ListChecks} phase="Fase 2" />,
});