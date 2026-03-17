"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Play, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/components/ui/card";
import { Button } from "@core/components/ui/button";
import { Badge } from "@core/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@core/components/ui/alert-dialog";
import type { Routine } from "@modules/routines/types";

interface RoutineCardProps {
  routine: Routine;
  onDelete: (routineId: number) => void;
  isDeleting?: boolean;
}

export default function RoutineCard({ routine, onDelete, isDeleting }: RoutineCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const totalExercises = routine.days.reduce((acc, day) => acc + day.items.length, 0);
  const activeDaysCount = routine.days.filter((day) => day.items.length > 0).length;

  const handleConfirmDelete = () => {
    onDelete(routine.id);
    // El padre es responsable de cerrar el diálogo si la operación es exitosa
    // o de manejar el estado de error. Para UX, cerramos aquí.
    // setIsAlertOpen(false);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{routine.name}</CardTitle>
          <Badge variant="secondary">
            {activeDaysCount} día{activeDaysCount !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription>{totalExercises} ejercicios en total</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
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

        <div className="flex gap-2 pt-4">
          <Button
            asChild
            className="flex-1"
            aria-label={`Ver rutina ${routine.name}`}
          >
            <Link href={`/routines/${routine.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Ver Rutina
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
            aria-label={`Editar rutina ${routine.name}`}
          >
            <Link href={`/routines/${routine.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>

          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label={`Eliminar rutina ${routine.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Si la rutina tiene sesiones de entrenamiento registradas, será
                  archivada. De lo contrario, se eliminará permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isDeleting ? "Eliminando..." : "Continuar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
