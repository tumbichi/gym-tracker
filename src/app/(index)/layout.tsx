"use client";

import type React from "react";

import { SidebarProvider, SidebarTrigger } from "@core/components/ui/sidebar";
import { AppSidebar } from "@core/components/app-sidebar";
import { BarChart3, Calendar, Dumbbell, Home, PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import Header from "@core/components/header";

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

  const route = appRoutes.find((route) => {
    console.log("route.pathname", route.label);
    return route.pathname === pathname;
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        {route ? <Header icon={route.icon} title={route.label} /> : null}
        {children}
      </main>
    </SidebarProvider>
  );
}
