import { SidebarProvider, SidebarTrigger } from "@core/components/ui/sidebar";
import { AppSidebar } from "@core/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Badge } from "@core/components/ui/badge";
import { Separator } from "@core/components/ui/separator";
import { Calendar, ArrowLeft, Play, Edit } from "lucide-react";
import { prisma } from "@core/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  });

  if (!routine) {
    notFound();
  }

  return routine;
}

export default async function RoutineDetailPage({ params }: { params: { id: string } }) {
  const routine = await getRoutine(params.id);

  return (
    <div className="flex-1 p-6 space-y-6">
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
            <Play className="w-4 h-4 mr-2" />
            Comenzar Entrenamiento
          </Button>
          <Button variant="outline" className="bg-transparent">
            <Edit className="w-4 h-4 mr-2" />
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
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{item.series} series</span>
                            <span>{item.reps} reps</span>
                            {item.targetWeight && <span>{item.targetWeight} kg</span>}
                          </div>
                          {item.notes && <p className="mt-1 text-sm text-muted-foreground">{item.notes}</p>}
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
                <div className="py-8 text-center text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Día de descanso</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
