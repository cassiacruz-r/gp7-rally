import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar | GP7 - ADRIANO" },
      { name: "description", content: "Acesso do administrador ao CRM de reuniões da equipe comercial GP7." },
      { property: "og:title", content: "Entrar | GP7 - ADRIANO" },
      { property: "og:description", content: "Acesso do administrador ao CRM de reuniões da equipe comercial GP7." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email se solicitado, ou entre.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand to-primary p-12 flex-col justify-between">
        <div className="text-brand-foreground">
          <div className="text-sm font-medium opacity-80 tracking-widest uppercase">GP7</div>
          <div className="mt-2 text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>ADRIANO</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-brand-foreground">
          <h1 className="text-5xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Reuniões que transformam resultados.
          </h1>
          <p className="mt-6 text-lg opacity-90 max-w-md">
            CRM completo para gerenciar pautas, indicadores, rankings e apresentações da equipe comercial.
          </p>
        </motion.div>
        <div className="text-brand-foreground opacity-70 text-sm">© {new Date().getFullYear()} GP7</div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-soft p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Acesso do administrador</h2>
              <p className="text-sm text-muted-foreground">Entre para gerenciar as reuniões</p>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gp7.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Sem acesso? <button className="text-brand font-medium hover:underline" onClick={() => setMode("signup")}>Criar administrador</button></>
            ) : (
              <>Já tem conta? <button className="text-brand font-medium hover:underline" onClick={() => setMode("login")}>Entrar</button></>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}