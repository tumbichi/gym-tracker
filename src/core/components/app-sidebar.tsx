import { Calendar, Dumbbell, Home, BarChart3, Settings, PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@core/components/ui/sidebar";
import { Button } from "@core/components/ui/button";
import Link from "next/link";
import { SessionActiveIndicator } from "@modules/log-workout/modules/session/components/SessionActiveIndicator";

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Rutinas",
    url: "/routines",
    icon: Calendar,
  },
  {
    title: "Ejercicios",
    url: "/exercises",
    icon: Dumbbell,
  },
  {
    title: "Registrar Entrenamiento",
    url: "/log-workout",
    icon: PlusCircle,
  },
  {
    title: "Estadísticas",
    url: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-medium text-sidebar-foreground text-xl">
            g<span className="font-extralight">fyt</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center justify-between w-full"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.title}</span>
                      </div>
                      {item.url === "/log-workout" && (
                        <SessionActiveIndicator />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
