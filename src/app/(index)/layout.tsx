"use client";

import type React from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { BarChart3, Calendar, Dumbbell, Home, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const appRoutes = [
  { pathname: "/", label: "Dashboard", icon: Home },
  { pathname: "/log-workout", label: "Registrar Entrenamiento", icon: PlusCircle },
  { pathname: "/exercises", label: "Ejercicios", icon: Dumbbell },
  { pathname: "/routines", label: "Rutinas", icon: Calendar },
  { pathname: "/statistics", label: "Estadísticas", icon: BarChart3 },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const Header = () => {
    const route = appRoutes.find((route) => route.pathname === pathname);

    if (!route) {
      return null;
    }

    const { icon: Icon, label } = route;

    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h1 className="text-lg font-semibold">{label}</h1>
        </div>
      </header>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        {children}
      </main>
    </SidebarProvider>
  );
}
