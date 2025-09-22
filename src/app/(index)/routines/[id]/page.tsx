import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, ArrowLeft, Play, Edit } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getRoutine(id: string) {
  const routine = await prisma.routine.findUnique({
    where: { id: Number.parseInt(id) },
    include: {
      days: {
        include: {
          items: {
            include: {
              exercise: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  })

  if (!routine) {
    notFound()
  }

  return routine
}

export default async function RoutineDetailPage({ params }: { params: { id: string } }) {
  const routine = await getRoutine(params.id)

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="bg-transparent">
              <Link href="/routines">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Calendar className="h-5 w-5" />
            <h1 className="text-lg font-semibold">{routine.name}</h1>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Routine Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{routine.name}</h2>
              <p className="text-muted-foreground">
                Rutina de {routine.weeks} semana{routine.weeks > 1 ? "s" : ""} •{" "}
                {routine.days.filter((day) => day.items.length > 0).length} días activos
              </p>
            </div>
            <div className="flex gap-2">
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Comenzar Entrenamiento
              </Button>
              <Button variant="outline" className="bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                Editar Rutina
              </Button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {routine.days.map((day) => (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{day.name}</span>
                    <Badge variant={day.items.length > 0 ? "default" : "secondary"}>
                      {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {day.items.length > 0 ? (
                    <div className="space-y-4">
                      {day.items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.exercise.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span>{item.series} series</span>
                                <span>{item.reps} reps</span>
                                {item.targetWeight && <span>{item.targetWeight} kg</span>}
                              </div>
                              {item.notes && <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.exercise.primaryGroup}</Badge>
                            </div>
                          </div>
                          {index < day.items.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Día de descanso</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
