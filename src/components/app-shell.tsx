import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Users,
  Gauge,
  Trophy,
  Target,
  Library,
  History,
  Settings,
  Play,
  LogOut,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type NavItem = { to: string; label: string; icon: any; highlight?: boolean };
const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Operação",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/reunioes", label: "Reuniões", icon: CalendarDays },
      { to: "/pautas", label: "Pautas da Semana", icon: ListChecks },
      { to: "/modo-reuniao", label: "Modo Reunião", icon: Play, highlight: true },
    ],
  },
  {
    label: "Pessoas & Metas",
    items: [
      { to: "/vendedores", label: "Vendedores", icon: Users },
      { to: "/kpis", label: "KPIs", icon: Gauge },
      { to: "/ranking", label: "Ranking", icon: Trophy },
      { to: "/metas", label: "Metas", icon: Target },
    ],
  },
  {
    label: "Sistema",
    items: [
      { to: "/biblioteca", label: "Biblioteca", icon: Library },
      { to: "/historico", label: "Histórico", icon: History },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { data: appName } = useQuery({
    queryKey: ["config", "app_nome"],
    queryFn: async () => {
      const { data } = await supabase.from("configuracoes").select("valor").eq("chave", "app_nome").maybeSingle();
      return (data?.valor as string) ?? "GP7 - ADRIANO";
    },
  });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand to-primary grid place-items-center text-brand-foreground font-bold shrink-0">
            G
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-semibold truncate" style={{ fontFamily: "var(--font-display)" }}>{appName ?? "GP7"}</div>
            <div className="text-xs text-muted-foreground">CRM de Reuniões</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link to={item.to as any} className="flex items-center gap-2.5">
                          <item.icon className="h-4 w-4" />
                          <span className={item.highlight ? "font-semibold" : ""}>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SignOutButton />
      </SidebarFooter>
    </Sidebar>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  }
  return (
    <Button variant="ghost" size="sm" className="justify-start w-full gap-2" onClick={signOut}>
      <LogOut className="h-4 w-4" />
      <span className="group-data-[collapsible=icon]:hidden">Sair</span>
    </Button>
  );
}

function TopBar() {
  return (
    <header className="h-16 border-b bg-card/60 backdrop-blur sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6">
      <SidebarTrigger />
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar vendedor, pauta, KPI..."
            className="w-full pl-9 pr-3 h-9 rounded-lg bg-muted/50 border border-transparent focus:bg-background focus:border-border outline-none text-sm transition"
          />
        </div>
      </div>
      <div className="flex-1" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground font-medium tabular-nums"
      >
        <LiveClock />
      </motion.div>
    </header>
  );
}

import { useEffect, useState } from "react";
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span>
      {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      {" · "}
      {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}