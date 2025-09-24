import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Badge } from "@core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@core/components/ui/dialog";
import { Plus, Calendar, Edit, Trash2, Play } from "lucide-react";
import { RoutineForm } from "@core/components/routine-form";
import { prisma } from "@core/lib/prisma";
import Link from "next/link";

async function getRoutines() {
  return await prisma.routine.findMany({
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
    orderBy: { createdAt: "desc" },
  });
}

export default async function RoutinesPage() {
  const routines = await getRoutines();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rutinas de Entrenamiento</h2>
          <p className="text-muted-foreground">Crea y gestiona tus rutinas semanales personalizadas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Rutina
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Rutina</DialogTitle>
              <DialogDescription>Diseña una rutina semanal completa con ejercicios para cada día</DialogDescription>
            </DialogHeader>
            <RoutineForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Routines Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Card key={routine.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{routine.name}</CardTitle>
                <Badge variant="secondary">
                  {routine.weeks} semana{routine.weeks > 1 ? "s" : ""}
                </Badge>
              </div>
              <CardDescription>
                {routine.days.filter((day) => day.items.length > 0).length} días activos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {/* Days Preview */}
              <div className="space-y-2">
                {routine.days.slice(0, 3).map((day) => (
                  <div key={day.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day.name}</span>
                    <span className="text-muted-foreground">
                      {day.items.length} ejercicio{day.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
                {routine.days.length > 3 && (
                  <div className="text-sm text-muted-foreground">+{routine.days.length - 3} días más...</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <Link href={`/routines/${routine.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    Ver Rutina
                  </Link>
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Rutina</DialogTitle>
                      <DialogDescription>Modifica tu rutina de entrenamiento</DialogDescription>
                    </DialogHeader>
                    <RoutineForm routine={routine} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {routines.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes rutinas creadas</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crea tu primera rutina de entrenamiento para comenzar a organizar tus sesiones
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Rutina
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Rutina</DialogTitle>
                    <DialogDescription>
                      Diseña una rutina semanal completa con ejercicios para cada día
                    </DialogDescription>
                  </DialogHeader>
                  <RoutineForm />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
