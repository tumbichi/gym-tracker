import {
  Calendar,
  Dumbbell,
  Home,
  BarChart3,
  Settings,
  PlusCircle,
} from 'lucide-react'
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
} from '@core/components/ui/sidebar'
import { Button } from '@core/components/ui/button'
import Link from 'next/link'
import { SessionActiveIndicator } from '@modules/log-workout/modules/session/components/SessionActiveIndicator'

// Menu items
const items = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Rutinas',
    url: '/routines',
    icon: Calendar,
  },
  {
    title: 'Ejercicios',
    url: '/exercises',
    icon: Dumbbell,
  },
  {
    title: 'Registrar Entrenamiento',
    url: '/log-workout',
    icon: PlusCircle,
  },
  {
    title: 'Estadísticas',
    url: '/statistics',
    icon: BarChart3,
  },
  {
    title: 'Configuración',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className='border-sidebar-border border-b'>
        <div className='flex items-center gap-2 px-4 py-2'>
          <span className='text-sidebar-foreground text-xl font-medium'>
            g<span className='font-extralight'>fyt</span>
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
                      className='flex w-full items-center justify-between'
                    >
                      <div className='flex items-center'>
                        <item.icon className='mr-3 h-5 w-5' />
                        <span>{item.title}</span>
                      </div>
                      {item.url === '/log-workout' && (
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
      <SidebarFooter className='border-sidebar-border border-t'>
        <div className='p-4'>
          <Button variant='outline' size='sm' className='w-full bg-transparent'>
            <Settings className='mr-2 h-4 w-4' />
            Configuración
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
