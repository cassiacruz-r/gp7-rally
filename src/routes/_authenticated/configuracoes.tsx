import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, KeyRound, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações | GP7 - ADRIANO" },
      { name: "description", content: "Preferências do CRM de reuniões da GP7: identidade do app, perfil e senha do administrador." },
      { property: "og:title", content: "Configurações | GP7 - ADRIANO" },
      { property: "og:description", content: "Preferências do CRM de reuniões da GP7: identidade do app, perfil e senha do administrador." },
    ],
  }),
  component: ConfiguracoesPage,
});

type Config = { nome_app: string; subtitulo: string; tempo_bloco_padrao: number };
const DEFAULTS: Config = { nome_app: "GP7 - ADRIANO", subtitulo: "CRM de Reuniões", tempo_bloco_padrao: 5 };

function ConfiguracoesPage() {
  const qc = useQueryClient();
  const [cfg, setCfg] = useState<Config>(DEFAULTS);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");

  const { data: rows } = useQuery({
    queryKey: ["configuracoes"],
    queryFn: async () => (await supabase.from("configuracoes").select("*")).data ?? [],
  });

  const { data: perfil } = useQuery({
    queryKey: ["meu-perfil"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
      return { ...data, email: auth.user.email, id: auth.user.id };
    },
  });

  useEffect(() => {
    if (!rows) return;
    const map: any = {};
    for (const r of rows as any[]) map[r.chave] = r.valor;
    setCfg({
      nome_app: map.nome_app ?? DEFAULTS.nome_app,
      subtitulo: map.subtitulo ?? DEFAULTS.subtitulo,
      tempo_bloco_padrao: Number(map.tempo_bloco_padrao ?? DEFAULTS.tempo_bloco_padrao),
    });
  }, [rows]);

  useEffect(() => {
    if (perfil) { setNome((perfil as any).nome ?? ""); setEmail((perfil as any).email ?? ""); }
  }, [perfil]);

  async function salvarCfg() {
    const payload = Object.entries(cfg).map(([chave, valor]) => ({ chave, valor: valor as any }));
    const { error } = await supabase.from("configuracoes").upsert(payload, { onConflict: "chave" });
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    qc.invalidateQueries({ queryKey: ["configuracoes"] });
  }

  async function salvarPerfil() {
    if (!perfil) return;
    const { error } = await supabase.from("profiles").update({ nome }).eq("id", (perfil as any).id);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado");
    qc.invalidateQueries({ queryKey: ["meu-perfil"] });
  }

  async function trocarSenha() {
    if (senha.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres");
    if (senha !== senha2) return toast.error("As senhas não conferem");
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) return toast.error(error.message);
    toast.success("Senha alterada");
    setSenha(""); setSenha2("");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Configurações</h1>
        <p className="text-muted-foreground text-sm">Identidade do sistema, perfil e segurança</p>
      </header>

      <section className="card-soft p-6 space-y-4">
        <h2 className="font-semibold">Identidade do sistema</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nome do app</Label><Input value={cfg.nome_app} onChange={(e) => setCfg({ ...cfg, nome_app: e.target.value })} /></div>
          <div><Label>Subtítulo</Label><Input value={cfg.subtitulo} onChange={(e) => setCfg({ ...cfg, subtitulo: e.target.value })} /></div>
          <div>
            <Label>Tempo padrão por bloco (min)</Label>
            <Input type="number" min={1} value={cfg.tempo_bloco_padrao} onChange={(e) => setCfg({ ...cfg, tempo_bloco_padrao: Number(e.target.value) })} />
          </div>
        </div>
        <Button onClick={salvarCfg}><Save className="h-4 w-4 mr-1" /> Salvar</Button>
      </section>

      <section className="card-soft p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-brand" /> Perfil do administrador</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} disabled /></div>
        </div>
        <Button onClick={salvarPerfil} variant="secondary"><Save className="h-4 w-4 mr-1" /> Atualizar perfil</Button>
      </section>

      <section className="card-soft p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4 text-brand" /> Alterar senha</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nova senha</Label><Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></div>
          <div><Label>Confirmar senha</Label><Input type="password" value={senha2} onChange={(e) => setSenha2(e.target.value)} /></div>
        </div>
        <Button onClick={trocarSenha} variant="secondary">Alterar senha</Button>
      </section>
    </div>
  );
}